import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// Reset specific voter's vote
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Check if voter exists and has voted
        const voter = await prisma.voter.findUnique({
            where: { id }
        })

        if (!voter) {
            return NextResponse.json({ error: 'Voter not found' }, { status: 404 })
        }

        if (!voter.hasVoted) {
            return NextResponse.json({ error: 'Voter has not voted yet' }, { status: 400 })
        }

        // Delete the voter's vote
        await prisma.vote.deleteMany({
            where: {
                voterId: id
            }
        })

        // Reset voter's hasVoted status
        await prisma.voter.update({
            where: { id },
            data: {
                hasVoted: false
            }
        })

        console.log(`Vote reset for voter ${voter.name} by admin:`, session.user.username)

        return NextResponse.json({
            success: true,
            message: `Vote for ${voter.name} has been reset successfully`
        })
    } catch (error) {
        console.error('Reset voter vote error:', error)
        return NextResponse.json(
            { error: 'Failed to reset voter vote' },
            { status: 500 }
        )
    }
}