import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Check if voter exists
        const existingVoter = await prisma.voter.findUnique({
            where: { id }
        })

        if (!existingVoter) {
            return NextResponse.json({ error: 'Voter not found' }, { status: 404 })
        }

        // Reset verification status and remove vote token
        const voter = await prisma.voter.update({
            where: { id },
            data: {
                isVerified: false,
                voteToken: null
            }
        })

        console.log(`Verification reset for voter ${voter.name} by admin:`, session.user.username)

        return NextResponse.json({
            ...voter,
            message: `Verification reset for ${voter.name}`
        })
    } catch (error) {
        console.error('Reset verification error:', error)
        return NextResponse.json(
            { error: 'Failed to reset verification' },
            { status: 500 }
        )
    }
}