import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeVoteToken, VOTE_TOKEN_LENGTH } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        if (!body?.token || typeof body.token !== 'string') {
            return NextResponse.json(
                { error: 'Token tidak boleh kosong' },
                { status: 400 }
            )
        }

        const token = normalizeVoteToken(body.token)

        if (token.length !== VOTE_TOKEN_LENGTH) {
            return NextResponse.json(
                { error: `Token harus ${VOTE_TOKEN_LENGTH} karakter` },
                { status: 400 }
            )
        }

        const voter = await prisma.voter.findUnique({
            where: { voteToken: token },
            include: { school: { select: { status: true } } }
        })

        if (!voter || voter.school.status !== 'ACTIVE') {
            return NextResponse.json(
                { error: 'Token tidak ditemukan' },
                { status: 404 }
            )
        }

        if (!voter.isVerified) {
            return NextResponse.json(
                { error: 'Pemilih belum diverifikasi. Silakan hubungi panitia.' },
                { status: 403 }
            )
        }

        if (voter.hasVoted) {
            return NextResponse.json(
                { error: 'Anda sudah melakukan voting sebelumnya' },
                { status: 403 }
            )
        }

        return NextResponse.json({
            valid: true,
            message: 'Token valid',
            voteUrl: `/vote/${token}`
        })

    } catch (error) {
        console.error('Validate token error:', error)
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
