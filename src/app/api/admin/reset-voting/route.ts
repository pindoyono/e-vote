import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function POST() {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Reset voting in transaction
        await prisma.$transaction(async (tx) => {
            // Delete all votes
            await tx.vote.deleteMany()

            // Reset all voters
            await tx.voter.updateMany({
                data: {
                    hasVoted: false,
                    isVerified: false,
                    voteToken: null
                }
            })

            // Deactivate voting session
            await tx.votingSession.updateMany({
                data: {
                    isActive: false,
                    endTime: new Date()
                }
            })
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Reset voting error:', error)
        return NextResponse.json(
            { error: 'Failed to reset voting' },
            { status: 500 }
        )
    }
}