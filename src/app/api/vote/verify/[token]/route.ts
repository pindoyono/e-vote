import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
    try {
        const { token } = await params

        const voter = await prisma.voter.findUnique({
            where: { voteToken: token }
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

        return NextResponse.json({
            valid: true,
            voter: {
                name: voter.name,
                studentId: voter.studentId,
                class: voter.class
            }
        })
    } catch (error) {
        console.error('Error verifying vote token:', error)
        return NextResponse.json(
            { error: 'Failed to verify vote token' },
            { status: 500 }
        )
    }
}