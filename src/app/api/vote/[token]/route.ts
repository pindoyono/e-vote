import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findVoterByToken, publicSchool } from '@/lib/school'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        const voter = await findVoterByToken(token)

        if (!voter) {
            return NextResponse.json(
                { error: 'Token tidak valid' },
                { status: 404 }
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

        const candidates = await prisma.candidate.findMany({
            where: { schoolId: voter.schoolId },
            orderBy: { orderNumber: 'asc' }
        })

        return NextResponse.json({
            voter: {
                name: voter.name,
                class: voter.class,
                hasVoted: voter.hasVoted
            },
            school: publicSchool(voter.school),
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
