import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const { voteToken, candidateId } = await request.json()

        if (!voteToken || !candidateId) {
            return NextResponse.json(
                { error: 'Vote token and candidate ID are required' },
                { status: 400 }
            )
        }

        // Find voter by vote token
        const voter = await prisma.voter.findUnique({
            where: { voteToken }
        })

        if (!voter) {
            return NextResponse.json(
                { error: 'Invalid vote token' },
                { status: 404 }
            )
        }

        if (voter.tokenUsed || voter.hasVoted) {
            return NextResponse.json(
                { error: 'Vote token has already been used' },
                { status: 400 }
            )
        }

        // Verify candidate exists
        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId }
        })

        if (!candidate) {
            return NextResponse.json(
                { error: 'Invalid candidate' },
                { status: 404 }
            )
        }

        // Create vote and update voter in a transaction
        await prisma.$transaction(async (tx) => {
            // Create the vote
            const vote = await tx.vote.create({
                data: {
                    voterId: voter.id,
                    candidateId
                }
            })

            // Update voter status
            const updatedVoter = await tx.voter.update({
                where: { id: voter.id },
                data: {
                    hasVoted: true,
                    tokenUsed: true
                }
            })

            return { vote, voter: updatedVoter }
        })

        return NextResponse.json({
            message: 'Vote submitted successfully',
            candidate: candidate.name
        })
    } catch (error) {
        console.error('Error submitting vote:', error)
        return NextResponse.json(
            { error: 'Failed to submit vote' },
            { status: 500 }
        )
    }
}