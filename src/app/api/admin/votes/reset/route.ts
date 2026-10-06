import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'

// Reset all votes
export async function DELETE() {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response
    const { schoolId } = auth

    try {
        await prisma.$transaction([
            prisma.vote.deleteMany({ where: { schoolId } }),
            prisma.voter.updateMany({
                where: { schoolId },
                data: { hasVoted: false }
            })
        ])

        console.log('All votes reset by admin:', auth.session.user.username)

        return NextResponse.json({
            success: true,
            message: 'All votes have been reset successfully'
        })
    } catch (error) {
        console.error('Reset all votes error:', error)
        return NextResponse.json(
            { error: 'Failed to reset votes' },
            { status: 500 }
        )
    }
}
