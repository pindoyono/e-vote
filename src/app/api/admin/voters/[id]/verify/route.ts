import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { generateVoteToken } from '@/lib/auth'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const voteToken = generateVoteToken()

        const voter = await prisma.voter.update({
            where: { id },
            data: {
                isVerified: true,
                voteToken: voteToken
            }
        })

        return NextResponse.json(voter)
    } catch (error) {
        console.error('Verify voter error:', error)
        return NextResponse.json(
            { error: 'Failed to verify voter' },
            { status: 500 }
        )
    }
}