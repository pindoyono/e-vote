import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { schoolRegistrationSchema } from '@/lib/validations'
import { isUniqueViolation } from '@/lib/db-errors'

// Pendaftaran sekolah baru: status PENDING sampai disetujui pengelola platform
export async function POST(request: Request) {
    try {
        const parsed = schoolRegistrationSchema.safeParse(await request.json())

        if (!parsed.success) {
            const issue = parsed.error.issues[0]
            return NextResponse.json(
                { error: issue.message, field: issue.path[0] },
                { status: 400 }
            )
        }

        const data = parsed.data
        const existing = await prisma.school.findUnique({ where: { npsn: data.npsn } })

        if (existing) {
            return NextResponse.json(
                { error: 'NPSN ini sudah terdaftar. Jika sekolah Anda belum pernah mendaftar, hubungi pengelola platform.', field: 'npsn' },
                { status: 409 }
            )
        }

        const school = await prisma.school.create({
            data: {
                npsn: data.npsn,
                name: data.name,
                shortName: data.shortName,
                level: data.level,
                address: data.address || null,
                city: data.city,
                province: data.province,
                contactName: data.contactName,
                contactPhone: data.contactPhone,
                contactEmail: data.contactEmail || null,
                eventTitle: data.eventTitle,
                eventYear: String(new Date().getFullYear()),
                admins: {
                    create: {
                        name: data.adminName,
                        username: data.adminUsername,
                        password: await hashPassword(data.adminPassword),
                    }
                }
            }
        })

        console.log(`Pendaftaran sekolah baru: ${school.npsn} ${school.name}`)

        return NextResponse.json({ success: true, npsn: school.npsn, status: school.status })
    } catch (error) {
        if (isUniqueViolation(error)) {
            return NextResponse.json(
                { error: 'NPSN ini sudah terdaftar.', field: 'npsn' },
                { status: 409 }
            )
        }
        console.error('Register school error:', error)
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
    }
}
