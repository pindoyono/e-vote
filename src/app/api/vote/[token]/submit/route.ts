import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { candidateId } = await request.json()
        const { token } = await params

        if (!candidateId) {
            return NextResponse.json(
                { error: 'Candidate ID is required' },
                { status: 400 }
            )
        }

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

        if (voter.hasVoted) {
            return NextResponse.json(
                { error: 'Anda sudah melakukan voting' },
                { status: 400 }
            )
        }

        // Check if voting is active
        const votingSession = await prisma.votingSession.findFirst({
            where: { id: 'default' }
        })

        if (!votingSession?.isActive) {
            return NextResponse.json(
                { error: 'Pemilihan belum dimulai atau sudah berakhir' },
                { status: 400 }
            )
        }

        // Verify candidate exists
        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId }
        })

        if (!candidate) {
            return NextResponse.json(
                { error: 'Kandidat tidak valid' },
                { status: 404 }
            )
        }

        // Get IP address and user agent for logging
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown'
        const userAgent = request.headers.get('user-agent') || 'unknown'

        // Submit vote in transaction
        await prisma.$transaction(async (tx) => {
            // Create vote record
            await tx.vote.create({
                data: {
                    voterId: voter.id,
                    candidateId: candidateId,
                    voteToken: token,
                    ipAddress: ip,
                    userAgent: userAgent
                }
            })

            // Mark voter as voted
            await tx.voter.update({
                where: { id: voter.id },
                data: { hasVoted: true }
            })
        })

        return NextResponse.json({
            success: true,
            message: 'Vote berhasil disimpan'
        })

    } catch (error) {
        console.error('Error submitting vote:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}