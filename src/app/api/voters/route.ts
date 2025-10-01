import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const voters = await prisma.voter.findMany({
            include: {
                vote: {
                    include: {
                        candidate: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(voters)
    } catch (error) {
        console.error('Error fetching voters:', error)
        return NextResponse.json(
            { error: 'Failed to fetch voters' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const { studentId, name, class: className } = await request.json()

        if (!studentId || !name || !className) {
            return NextResponse.json(
                { error: 'Student ID, name, and class are required' },
                { status: 400 }
            )
        }

        // Check if voter already exists
        const existingVoter = await prisma.voter.findUnique({
            where: { studentId }
        })

        if (existingVoter) {
            return NextResponse.json(
                { error: 'Voter with this student ID already exists' },
                { status: 409 }
            )
        }

        const voter = await prisma.voter.create({
            data: {
                studentId,
                name,
                class: className
            }
        })

        return NextResponse.json(voter, { status: 201 })
    } catch (error) {
        console.error('Error creating voter:', error)
        return NextResponse.json(
            { error: 'Failed to create voter' },
            { status: 500 }
        )
    }
}