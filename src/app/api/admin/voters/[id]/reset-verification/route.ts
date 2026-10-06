import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'
import { isNotFound } from '@/lib/db-errors'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    try {
        const { id } = await params

        // Reset verification status and remove vote token
        const voter = await prisma.voter.update({
            where: { id, schoolId: auth.schoolId },
            data: {
                isVerified: false,
                voteToken: null
            }
        })

        console.log(`Verification reset for voter ${voter.id} by admin:`, auth.session.user.username)

        return NextResponse.json({
            ...voter,
            message: `Verification reset for ${voter.name}`
        })
    } catch (error) {
        if (isNotFound(error)) {
            return NextResponse.json({ error: 'Voter not found' }, { status: 404 })
        }
        console.error('Reset verification error:', error)
        return NextResponse.json(
            { error: 'Failed to reset verification' },
            { status: 500 }
        )
    }
}
