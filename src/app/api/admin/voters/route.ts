import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'
import { voterSchema } from '@/lib/validations'
import { isUniqueViolation } from '@/lib/db-errors'

export async function GET() {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    try {
        const voters = await prisma.voter.findMany({
            where: { schoolId: auth.schoolId },
            include: {
                votes: {
                    include: {
                        candidate: {
                            select: {
                                name: true,
                                orderNumber: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ voters })
    } catch (error) {
        console.error('Voters API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    try {
        const parsed = voterSchema.safeParse(await request.json())
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
        }

        const voter = await prisma.voter.create({
            data: { ...parsed.data, schoolId: auth.schoolId }
        })

        return NextResponse.json(voter)
    } catch (error) {
        if (isUniqueViolation(error)) {
            return NextResponse.json(
                { error: 'NISN/NIS sudah terdaftar' },
                { status: 400 }
            )
        }
        console.error('Create voter error:', error)
        return NextResponse.json(
            { error: 'Failed to create voter' },
            { status: 500 }
        )
    }
}
