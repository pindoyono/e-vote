import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'

// Reset specific voter's vote
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    try {
        const { id } = await params

        const voter = await prisma.voter.findFirst({
            where: { id, schoolId: auth.schoolId }
        })

        if (!voter) {
            return NextResponse.json({ error: 'Voter not found' }, { status: 404 })
        }

        if (!voter.hasVoted) {
            return NextResponse.json({ error: 'Voter has not voted yet' }, { status: 400 })
        }

        await prisma.$transaction([
            prisma.vote.deleteMany({ where: { voterId: id } }),
            prisma.voter.update({
                where: { id },
                data: { hasVoted: false }
            })
        ])

        console.log(`Vote reset for voter ${voter.id} by admin:`, auth.session.user.username)

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
