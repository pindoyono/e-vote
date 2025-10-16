import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get total voters count
        const totalVoters = await prisma.voter.count()

        // Get voted voters count
        const totalVoted = await prisma.voter.count({
            where: { hasVoted: true }
        })

        // Get not voted count
        const totalNotVoted = totalVoters - totalVoted

        // Get votes by candidate
        const votesByCandidate = await prisma.vote.groupBy({
            by: ['candidateId'],
            _count: {
                candidateId: true
            }
        })

        // Get candidate details for vote counts
        const candidatesWithVotes = await Promise.all(
            votesByCandidate.map(async (vote) => {
                const candidate = await prisma.candidate.findUnique({
                    where: { id: vote.candidateId },
                    select: { id: true, name: true, orderNumber: true }
                })
                return {
                    candidateId: vote.candidateId,
                    candidateName: candidate?.name || 'Unknown',
                    candidateNumber: candidate?.orderNumber || 0,
                    voteCount: vote._count.candidateId
                }
            })
        )

        // Also include candidates with 0 votes
        const allCandidates = await prisma.candidate.findMany({
            select: { id: true, name: true, orderNumber: true }
        })

        const completeVotesByCandidate = allCandidates.map(candidate => {
            const existingVote = candidatesWithVotes.find(v => v.candidateId === candidate.id)
            return {
                candidateId: candidate.id,
                candidateName: candidate.name,
                candidateNumber: candidate.orderNumber,
                voteCount: existingVote?.voteCount || 0
            }
        }).sort((a, b) => a.candidateNumber - b.candidateNumber)

        const stats = {
            totalVoters,
            totalVoted,
            totalNotVoted,
            votesByCandidate: completeVotesByCandidate
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Voting stats error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch voting statistics' },
            { status: 500 }
        )
    }
}