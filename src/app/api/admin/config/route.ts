import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'
import { schoolConfigSchema } from '@/lib/validations'

// GET - Konfigurasi sekolah milik user yang login (admin/panitia)
export async function GET() {
    const auth = await requireSchoolUser(['admin', 'committee'])
    if ('response' in auth) return auth.response

    try {
        const school = await prisma.school.findUniqueOrThrow({ where: { id: auth.schoolId } })

        return NextResponse.json({
            npsn: school.npsn,
            level: school.level,
            schoolName: school.name,
            schoolShortName: school.shortName,
            eventTitle: school.eventTitle,
            eventYear: school.eventYear,
        })
    } catch (error) {
        console.error('Get config error:', error)
        return NextResponse.json(
            { error: 'Gagal mengambil konfigurasi' },
            { status: 500 }
        )
    }
}

// POST - Ubah nama sekolah & judul pemilihan
export async function POST(request: Request) {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    try {
        const parsed = schoolConfigSchema.safeParse(await request.json())
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
        }

        const { schoolName, schoolShortName, eventTitle, eventYear } = parsed.data
        await prisma.school.update({
            where: { id: auth.schoolId },
            data: { name: schoolName, shortName: schoolShortName, eventTitle, eventYear }
        })

        return NextResponse.json({ success: true, message: 'Konfigurasi berhasil disimpan' })
    } catch (error) {
        console.error('Update config error:', error)
        return NextResponse.json(
            { error: 'Gagal menyimpan konfigurasi' },
            { status: 500 }
        )
    }
}
