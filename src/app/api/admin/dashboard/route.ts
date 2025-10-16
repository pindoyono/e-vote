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

        // Get voting session status
        const votingSession = await prisma.votingSession.findFirst({
            where: { id: 'default' }
        })

        // Get voter statistics
        const totalVoters = await prisma.voter.count()
        const verifiedVoters = await prisma.voter.count({
            where: { isVerified: true }
        })
        const totalVotes = await prisma.vote.count()

        // Get candidates with vote counts
        const candidates = await prisma.candidate.findMany({
            orderBy: { orderNumber: 'asc' },
            include: {
                _count: {
                    select: { votes: true }
                }
            }
        })

        const candidatesWithVotes = candidates.map(candidate => ({
            id: candidate.id,
            name: candidate.name,
            class: candidate.class,
            orderNumber: candidate.orderNumber,
            voteCount: candidate._count.votes
        }))

        const dashboardData = {
            totalVoters,
            verifiedVoters,
            unverifiedVoters: totalVoters - verifiedVoters,
            totalVotes,
            candidates: candidatesWithVotes,
            isVotingActive: votingSession?.isActive || false
        }

        return NextResponse.json(dashboardData)
    } catch (error) {
        console.error('Dashboard API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}