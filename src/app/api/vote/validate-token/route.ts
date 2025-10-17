import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json(
                { error: 'Token tidak boleh kosong' },
                { status: 400 }
            )
        }

        // Validate token format (5 characters)
        if (token.length !== 5) {
            return NextResponse.json(
                { error: 'Token harus 5 karakter' },
                { status: 400 }
            )
        }

        // Find voter with this token
        const voter = await prisma.voter.findUnique({
            where: { voteToken: token }
        })

        if (!voter) {
            return NextResponse.json(
                { error: 'Token tidak ditemukan' },
                { status: 404 }
            )
        }

        // Check if voter is verified
        if (!voter.isVerified) {
            return NextResponse.json(
                { error: 'Pemilih belum diverifikasi. Silakan hubungi panitia.' },
                { status: 403 }
            )
        }

        // Check if voter has already voted
        if (voter.hasVoted) {
            return NextResponse.json(
                { error: 'Anda sudah melakukan voting sebelumnya' },
                { status: 403 }
            )
        }

        // Token is valid
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
