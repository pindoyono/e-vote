import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'
import { voterSchema } from '@/lib/validations'

const MAX_FILE_SIZE = 2 * 1024 * 1024
const MAX_ROWS = 5000

export async function POST(request: NextRequest) {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response
    const { schoolId } = auth

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
        }

        if (!file.name.toLowerCase().endsWith('.csv')) {
            return NextResponse.json({ error: 'File harus berformat CSV' }, { status: 400 })
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'Ukuran file maksimal 2 MB' }, { status: 400 })
        }

        const text = await file.text()
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '')

        if (lines.length === 0) {
            return NextResponse.json({ error: 'File CSV kosong' }, { status: 400 })
        }

        if (lines.length > MAX_ROWS) {
            return NextResponse.json({ error: `Maksimal ${MAX_ROWS} baris per impor` }, { status: 400 })
        }

        const voters: Array<{ name: string; class: string; nisn: string }> = []
        const errors: string[] = []

        for (let i = 0; i < lines.length; i++) {
            const columns = lines[i].split(/[,;]/).map(col => col.trim().replace(/"/g, ''))

            if (columns.length !== 3) {
                errors.push(`Baris ${i + 1}: Format tidak valid (harus ada 3 kolom: Nama, Kelas, NISN/NIS)`)
                continue
            }

            const [name, kelas, nisn] = columns
            const parsed = voterSchema.safeParse({ name, class: kelas, nisn })

            if (!parsed.success) {
                errors.push(`Baris ${i + 1}: ${parsed.error.issues[0].message}`)
                continue
            }

            if (voters.some(v => v.nisn === parsed.data.nisn)) {
                errors.push(`Baris ${i + 1}: NISN/NIS ${parsed.data.nisn} duplikat dalam file`)
                continue
            }

            voters.push(parsed.data)
        }

        // Cek NISN yang sudah ada di sekolah ini sekaligus (bukan satu query per baris)
        const existing = await prisma.voter.findMany({
            where: { schoolId, nisn: { in: voters.map(v => v.nisn) } },
            select: { nisn: true }
        })
        const existingNisn = new Set(existing.map(v => v.nisn))
        existingNisn.forEach(nisn => errors.push(`NISN/NIS ${nisn} sudah terdaftar di database`))
        const toImport = voters.filter(v => !existingNisn.has(v.nisn))

        if (toImport.length === 0) {
            return NextResponse.json({
                error: 'Tidak ada data valid untuk diimport',
                details: errors
            }, { status: 400 })
        }

        const result = await prisma.voter.createMany({
            data: toImport.map(v => ({ ...v, schoolId })),
            skipDuplicates: true
        })

        return NextResponse.json({
            success: true,
            message: `Berhasil mengimport ${result.count} data pemilih`,
            imported: result.count,
            errors: errors.length > 0 ? errors : undefined
        })

    } catch (error) {
        console.error('Import error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat mengimport data' },
            { status: 500 }
        )
    }
}
