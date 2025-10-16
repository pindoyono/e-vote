import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params

        const voter = await prisma.voter.findFirst({
            where: {
                voteToken: token,
                isVerified: true
            }
        })

        if (!voter) {
            return NextResponse.json(
                { error: 'Token tidak valid' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            voter: {
                name: voter.name,
                class: voter.class,
                hasVoted: voter.hasVoted
            }
        })
    } catch (error) {
        console.error('Vote status API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}