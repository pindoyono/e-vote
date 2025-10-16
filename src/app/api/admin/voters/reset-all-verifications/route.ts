import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Reset all verifications
export async function POST() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Reset all voters' verification status and remove vote tokens
        const result = await prisma.voter.updateMany({
            data: {
                isVerified: false,
                voteToken: null
            }
        })

        console.log(`All verifications reset by admin:`, session.user.username, `- ${result.count} voters affected`)

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