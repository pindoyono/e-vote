import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'
import { generateVoteToken } from '@/lib/auth'
import { isNotFound, isUniqueViolation } from '@/lib/db-errors'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireSchoolUser(['admin', 'committee'])
    if ('response' in auth) return auth.response

    try {
        const { id } = await params

        // Token unik global; ulangi jika kebetulan bentrok dengan token lain
        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const voter = await prisma.voter.update({
                    where: { id, schoolId: auth.schoolId },
                    data: {
                        isVerified: true,
                        voteToken: generateVoteToken()
                    }
                })
                return NextResponse.json(voter)
            } catch (error) {
                if (!isUniqueViolation(error)) throw error
            }
        }

        return NextResponse.json({ error: 'Gagal membuat token, coba lagi' }, { status: 500 })
    } catch (error) {
        if (isNotFound(error)) {
            return NextResponse.json({ error: 'Pemilih tidak ditemukan' }, { status: 404 })
        }
        console.error('Verify voter error:', error)
        return NextResponse.json(
            { error: 'Failed to verify voter' },
            { status: 500 }
        )
    }
}
