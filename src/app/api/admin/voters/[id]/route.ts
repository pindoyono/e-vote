import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'
import { voterUpdateSchema } from '@/lib/validations'
import { isNotFound, isUniqueViolation } from '@/lib/db-errors'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    try {
        const { id } = await params
        await prisma.voter.delete({
            where: { id, schoolId: auth.schoolId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        if (isNotFound(error)) {
            return NextResponse.json({ error: 'Pemilih tidak ditemukan' }, { status: 404 })
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            return NextResponse.json({ error: 'Pemilih sudah memberikan suara dan tidak bisa dihapus. Reset suaranya terlebih dahulu.' }, { status: 400 })
        }
        console.error('Delete voter error:', error)
        return NextResponse.json(
            { error: 'Failed to delete voter' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    try {
        const { id } = await params

        // Hanya nama, kelas, dan NISN yang boleh diubah dari sini (status voting/token tidak)
        const parsed = voterUpdateSchema.safeParse(await request.json())
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
        }

        const voter = await prisma.voter.update({
            where: { id, schoolId: auth.schoolId },
            data: parsed.data
        })

        return NextResponse.json(voter)
    } catch (error) {
        if (isNotFound(error)) {
            return NextResponse.json({ error: 'Pemilih tidak ditemukan' }, { status: 404 })
        }
        if (isUniqueViolation(error)) {
            return NextResponse.json({ error: 'NISN/NIS sudah terdaftar' }, { status: 400 })
        }
        console.error('Update voter error:', error)
        return NextResponse.json(
            { error: 'Failed to update voter' },
            { status: 500 }
        )
    }
}
