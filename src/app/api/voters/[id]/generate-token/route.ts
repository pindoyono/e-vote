import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVoteToken } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        const voter = await prisma.voter.findUnique({
            where: { id }
        })

        if (!voter) {
            return NextResponse.json(
                { error: 'Voter not found' },
                { status: 404 }
            )
        }

        if (voter.hasVoted) {
            return NextResponse.json(
                { error: 'Voter has already voted' },
                { status: 400 }
            )
        }

        if (voter.voteToken && !voter.tokenUsed) {
            return NextResponse.json(
                { error: 'Vote token already generated' },
                { status: 400 }
            )
        }

        const voteToken = generateVoteToken()

        const updatedVoter = await prisma.voter.update({
            where: { id },
            data: {
                voteToken,
                tokenUsed: false
            }
        })

        return NextResponse.json({
            voteToken,
            voteUrl: `/vote/${voteToken}`
        })
    } catch (error) {
        console.error('Error generating vote token:', error)
        return NextResponse.json(
            { error: 'Failed to generate vote token' },
            { status: 500 }
        )
    }
}