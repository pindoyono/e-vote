import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'
import { hashPassword } from '@/lib/auth'
import { committeeCreateSchema } from '@/lib/validations'
import { isUniqueViolation } from '@/lib/db-errors'

const publicFields = { id: true, name: true, username: true, isActive: true, createdAt: true }

// Daftar akun panitia sekolah ini (tanpa hash password)
export async function GET() {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    const committees = await prisma.committee.findMany({
        where: { schoolId: auth.schoolId },
        select: publicFields,
        orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(committees)
}

export async function POST(request: Request) {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    try {
        const parsed = committeeCreateSchema.safeParse(await request.json())
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
        }

        const { name, username, password } = parsed.data
        const committee = await prisma.committee.create({
            data: {
                schoolId: auth.schoolId,
                name,
                username,
                password: await hashPassword(password)
            },
            select: publicFields
        })

        return NextResponse.json(committee)
    } catch (error) {
        if (isUniqueViolation(error)) {
            return NextResponse.json({ error: 'Username panitia sudah dipakai' }, { status: 400 })
        }
        console.error('Create committee error:', error)
        return NextResponse.json({ error: 'Gagal membuat akun panitia' }, { status: 500 })
    }
}
