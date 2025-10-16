import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { voterSchema } from '@/lib/validations'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const voters = await prisma.voter.findMany({
            include: {
                votes: {
                    include: {
                        candidate: {
                            select: {
                                name: true,
                                orderNumber: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ voters })
    } catch (error) {
        console.error('Voters API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = voterSchema.parse(body)

        // Check if NISN already exists
        const existingVoter = await prisma.voter.findUnique({
            where: { nisn: validatedData.nisn }
        })

        if (existingVoter) {
            return NextResponse.json(
                { error: 'NISN sudah terdaftar' },
                { status: 400 }
            )
        }

        const voter = await prisma.voter.create({
            data: validatedData
        })

        return NextResponse.json(voter)
    } catch (error) {
        console.error('Create voter error:', error)
        return NextResponse.json(
            { error: 'Failed to create voter' },
            { status: 500 }
        )
    }
}