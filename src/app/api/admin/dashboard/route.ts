import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'

export async function GET() {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response
    const { schoolId } = auth

    try {
        const votingSession = await prisma.votingSession.findUnique({
            where: { schoolId }
        })

        const totalVoters = await prisma.voter.count({ where: { schoolId } })
        const verifiedVoters = await prisma.voter.count({
            where: { schoolId, isVerified: true }
        })
        const totalVotes = await prisma.vote.count({ where: { schoolId } })

        const candidates = await prisma.candidate.findMany({
            where: { schoolId },
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
