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

        const candidates = await prisma.candidate.findMany({
            orderBy: { orderNumber: 'asc' }
        })

        const votingSession = await prisma.votingSession.findFirst({
            where: { isActive: true }
        })

        if (!votingSession?.isActive) {
            return NextResponse.json(
                { error: 'Pemilihan belum dimulai atau sudah berakhir' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            voter: {
                name: voter.name,
                class: voter.class,
                hasVoted: voter.hasVoted
            },
            candidates,
            votingSession
        })
    } catch (error) {
        console.error('Error fetching vote data:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}