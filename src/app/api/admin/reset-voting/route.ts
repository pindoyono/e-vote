import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'

export async function POST() {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response
    const { schoolId } = auth

    try {
        // Reset voting sekolah ini saja, dalam satu transaksi
        await prisma.$transaction(async (tx) => {
            await tx.vote.deleteMany({ where: { schoolId } })

            await tx.voter.updateMany({
                where: { schoolId },
                data: {
                    hasVoted: false,
                    isVerified: false,
                    voteToken: null
                }
            })

            await tx.votingSession.updateMany({
                where: { schoolId },
                data: {
                    isActive: false,
                    endTime: new Date()
                }
            })
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Reset voting error:', error)
        return NextResponse.json(
            { error: 'Failed to reset voting' },
            { status: 500 }
        )
    }
}
