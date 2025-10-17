import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
        }

        if (!file.name.endsWith('.csv')) {
            return NextResponse.json({ error: 'File harus berformat CSV' }, { status: 400 })
        }

        const text = await file.text()
        const lines = text.split('\n').filter(line => line.trim() !== '')

        if (lines.length === 0) {
            return NextResponse.json({ error: 'File CSV kosong' }, { status: 400 })
        }

        const voters: Array<{ name: string; class: string; nisn: string }> = []
        const errors: string[] = []

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            const columns = line.split(',').map(col => col.trim().replace(/"/g, ''))

            if (columns.length !== 3) {
                errors.push(`Baris ${i + 1}: Format tidak valid (harus ada 3 kolom: Nama, Kelas, NISN)`)
                continue
            }

            const [name, kelas, nisn] = columns

            // Validasi data
            if (!name || name.length < 2) {
                errors.push(`Baris ${i + 1}: Nama tidak valid (minimal 2 karakter)`)
                continue
            }

            if (!kelas || kelas.length < 1) {
                errors.push(`Baris ${i + 1}: Kelas tidak valid`)
                continue
            }

            if (!nisn || nisn.length !== 10 || !/^\d{10}$/.test(nisn)) {
                errors.push(`Baris ${i + 1}: NISN tidak valid (harus 10 digit angka)`)
                continue
            }

            // Cek duplikat NISN dalam file
            const duplicateInFile = voters.find(v => v.nisn === nisn)
            if (duplicateInFile) {
                errors.push(`Baris ${i + 1}: NISN ${nisn} duplikat dalam file`)
                continue
            }

            // Cek duplikat NISN di database
            const existingVoter = await prisma.voter.findUnique({
                where: { nisn }
            })

            if (existingVoter) {
                errors.push(`Baris ${i + 1}: NISN ${nisn} sudah terdaftar di database`)
                continue
            }

            voters.push({
                name: name,
                class: kelas,
                nisn: nisn
            })
        }

        if (errors.length > 0 && voters.length === 0) {
            return NextResponse.json({
                error: 'Tidak ada data valid untuk diimport',
                details: errors
            }, { status: 400 })
        }

        // Import data yang valid
        let importedCount = 0
        if (voters.length > 0) {
            try {
                // Import satu per satu untuk handle duplicate
                for (const voter of voters) {
                    try {
                        await prisma.voter.create({
                            data: voter
                        })
                        importedCount++
                    } catch (createError: unknown) {
                        // Jika duplikasi, tambahkan ke error
                        if (createError && typeof createError === 'object' && 'code' in createError && createError.code === 'P2002') {
                            errors.push(`NISN ${voter.nisn} sudah ada dalam database`)
                        } else {
                            errors.push(`Gagal mengimpor NISN ${voter.nisn}`)
                        }
                    }
                }
            } catch (dbError) {
                console.error('Database error:', dbError)
                return NextResponse.json({
                    error: 'Gagal menyimpan ke database',
                    details: errors
                }, { status: 500 })
            }
        }

        return NextResponse.json({
            success: true,
            message: `Berhasil mengimport ${importedCount} data pemilih`,
            imported: importedCount,
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