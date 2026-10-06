import { NextResponse } from 'next/server'
import { findVoterByToken, publicSchool } from '@/lib/school'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        const voter = await findVoterByToken(token)

        if (!voter) {
            return NextResponse.json(
                { error: 'Token tidak valid' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            voter: {
                name: voter.name,
                class: voter.class,
                hasVoted: voter.hasVoted
            },
            school: publicSchool(voter.school)
        })
    } catch (error) {
        console.error('Vote status API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
