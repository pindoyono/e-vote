import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const votingSession = await prisma.votingSession.findFirst({
            where: { id: 'default' }
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
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { isActive } = await request.json()

        const votingSession = await prisma.votingSession.upsert({
            where: { id: 'default' },
            update: {
                isActive,
                startTime: isActive ? new Date() : undefined,
                endTime: !isActive ? new Date() : null,
            },
            create: {
                id: 'default',
                isActive,
                description: 'Pemilihan Ketua OSIS SMK N 2 Malinau 2025',
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