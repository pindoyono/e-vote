import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const candidates = await prisma.candidate.findMany({
            include: {
                _count: {
                    select: {
                        votes: true
                    }
                }
            },
            orderBy: {
                orderNumber: 'asc'
            }
        })

        return NextResponse.json(candidates)
    } catch (error) {
        console.error('Error fetching candidates:', error)
        return NextResponse.json(
            { error: 'Failed to fetch candidates' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, class: className, vision, mission, orderNumber, photo } = await request.json()

        if (!name || !className || !vision || !mission || !orderNumber) {
            return NextResponse.json(
                { error: 'Name, class, vision, mission, and order number are required' },
                { status: 400 }
            )
        }

        // Check if order number already exists
        const existingCandidate = await prisma.candidate.findUnique({
            where: { orderNumber }
        })

        if (existingCandidate) {
            return NextResponse.json(
                { error: 'Candidate with this order number already exists' },
                { status: 409 }
            )
        }

        const candidate = await prisma.candidate.create({
            data: {
                name,
                class: className,
                vision,
                mission,
                orderNumber,
                photo
            }
        })

        return NextResponse.json(candidate, { status: 201 })
    } catch (error) {
        console.error('Error creating candidate:', error)
        return NextResponse.json(
            { error: 'Failed to create candidate' },
            { status: 500 }
        )
    }
}