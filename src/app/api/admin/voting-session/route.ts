import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'

export async function GET() {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    try {
        const votingSession = await prisma.votingSession.findUnique({
            where: { schoolId: auth.schoolId }
        })

        return NextResponse.json(votingSession)
    } catch (error) {
        console.error('Voting session API error:', error)
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
        const { isActive } = await request.json()
        if (typeof isActive !== 'boolean') {
            return NextResponse.json({ error: 'isActive harus boolean' }, { status: 400 })
        }

        const school = await prisma.school.findUniqueOrThrow({ where: { id: auth.schoolId } })

        const votingSession = await prisma.votingSession.upsert({
            where: { schoolId: auth.schoolId },
            update: {
                isActive,
                startTime: isActive ? new Date() : undefined,
                endTime: !isActive ? new Date() : null,
            },
            create: {
                schoolId: auth.schoolId,
                isActive,
                description: `${school.eventTitle} ${school.name} ${school.eventYear}`,
                startTime: isActive ? new Date() : undefined,
            }
        })

        return NextResponse.json(votingSession)
    } catch (error) {
        console.error('Update voting session error:', error)
        return NextResponse.json(
            { error: 'Failed to update voting session' },
            { status: 500 }
        )
    }
}
