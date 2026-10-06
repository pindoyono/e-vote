import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findVoterByToken } from '@/lib/school'
import { isUniqueViolation } from '@/lib/db-errors'

class AlreadyVotedError extends Error {}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { candidateId } = await request.json()
        const { token } = await params

        if (!candidateId || typeof candidateId !== 'string') {
            return NextResponse.json(
                { error: 'Candidate ID is required' },
                { status: 400 }
            )
        }

        const voter = await findVoterByToken(token)

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

        const votingSession = await prisma.votingSession.findUnique({
            where: { schoolId: voter.schoolId }
        })

        if (!votingSession?.isActive) {
            return NextResponse.json(
                { error: 'Pemilihan belum dimulai atau sudah berakhir' },
                { status: 400 }
            )
        }

        // Kandidat harus milik sekolah yang sama dengan pemilih
        const candidate = await prisma.candidate.findFirst({
            where: { id: candidateId, schoolId: voter.schoolId }
        })

        if (!candidate) {
            return NextResponse.json(
                { error: 'Kandidat tidak valid' },
                { status: 404 }
            )
        }

        // nginx mengisi X-Real-IP dengan IP klien yang sebenarnya
        const ip = request.headers.get('x-real-ip') ||
            request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
            'unknown'
        const userAgent = request.headers.get('user-agent')?.slice(0, 500) || 'unknown'

        // Tandai sudah memilih secara atomik: dua request bersamaan tidak bisa sama-sama lolos
        await prisma.$transaction(async (tx) => {
            const marked = await tx.voter.updateMany({
                where: { id: voter.id, hasVoted: false },
                data: { hasVoted: true }
            })

            if (marked.count === 0) {
                throw new AlreadyVotedError()
            }

            await tx.vote.create({
                data: {
                    schoolId: voter.schoolId,
                    voterId: voter.id,
                    candidateId: candidate.id,
                    voteToken: voter.voteToken!,
                    ipAddress: ip,
                    userAgent: userAgent
                }
            })
        })

        return NextResponse.json({
            success: true,
            message: 'Vote berhasil disimpan'
        })

    } catch (error) {
        if (error instanceof AlreadyVotedError || isUniqueViolation(error)) {
            return NextResponse.json(
                { error: 'Anda sudah melakukan voting' },
                { status: 400 }
            )
        }
        console.error('Error submitting vote:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
