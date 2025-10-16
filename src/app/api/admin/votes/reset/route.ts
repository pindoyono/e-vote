import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Reset all votes
export async function DELETE() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Delete all votes
        await prisma.vote.deleteMany()

        // Reset all voters to hasVoted: false
        await prisma.voter.updateMany({
            data: {
                hasVoted: false
            }
        })

        console.log('All votes reset by admin:', session.user.username)

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