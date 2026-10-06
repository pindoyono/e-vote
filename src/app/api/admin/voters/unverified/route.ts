import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'

export async function GET() {
    const auth = await requireSchoolUser(['admin', 'committee'])
    if ('response' in auth) return auth.response

    try {
        const voters = await prisma.voter.findMany({
            where: { schoolId: auth.schoolId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(voters)
    } catch (error) {
        console.error('Unverified voters API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
