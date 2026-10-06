import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'
import { isNotFound } from '@/lib/db-errors'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    try {
        const { id } = await params
        await prisma.committee.delete({ where: { id, schoolId: auth.schoolId } })
        return NextResponse.json({ success: true })
    } catch (error) {
        if (isNotFound(error)) {
            return NextResponse.json({ error: 'Akun panitia tidak ditemukan' }, { status: 404 })
        }
        console.error('Delete committee error:', error)
        return NextResponse.json({ error: 'Gagal menghapus akun panitia' }, { status: 500 })
    }
}
