import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'

// Reset all verifications
export async function POST() {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    try {
        const result = await prisma.voter.updateMany({
            where: { schoolId: auth.schoolId },
            data: {
                isVerified: false,
                voteToken: null
            }
        })

        console.log(`All verifications reset by admin:`, auth.session.user.username, `- ${result.count} voters affected`)

        return NextResponse.json({
            success: true,
            message: `All verifications have been reset. ${result.count} voters affected.`,
            count: result.count
        })
    } catch (error) {
        console.error('Reset all verifications error:', error)
        return NextResponse.json(
            { error: 'Failed to reset all verifications' },
            { status: 500 }
        )
    }
}
