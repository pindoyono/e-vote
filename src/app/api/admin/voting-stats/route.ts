import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'

export async function GET() {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response
    const { schoolId } = auth

    try {
        const totalVoters = await prisma.voter.count({ where: { schoolId } })

        const totalVoted = await prisma.voter.count({
            where: { schoolId, hasVoted: true }
        })

        const totalNotVoted = totalVoters - totalVoted

        const candidates = await prisma.candidate.findMany({
            where: { schoolId },
            select: { id: true, name: true, orderNumber: true, _count: { select: { votes: true } } },
            orderBy: { orderNumber: 'asc' }
        })

        const votesByCandidate = candidates.map(candidate => ({
            candidateId: candidate.id,
            candidateName: candidate.name,
            candidateNumber: candidate.orderNumber,
            voteCount: candidate._count.votes
        }))

        const stats = {
            totalVoters,
            totalVoted,
            totalNotVoted,
            votesByCandidate
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
