import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        await prisma.voter.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete voter error:', error)
        return NextResponse.json(
            { error: 'Failed to delete voter' },
            { status: 500 }
        )
    }
}

// ...duplikasi function PUT dihapus...

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const body = await request.json()

        const voter = await prisma.voter.update({
            where: { id: id },
            data: body
        })

        return NextResponse.json(voter)
    } catch (error) {
        console.error('Update voter error:', error)
        return NextResponse.json(
            { error: 'Failed to update voter' },
            { status: 500 }
        )
    }
}