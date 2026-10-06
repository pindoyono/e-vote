import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/tenant'
import { schoolStatusSchema } from '@/lib/validations'
import { isNotFound } from '@/lib/db-errors'

// Setujui / tolak / nonaktifkan sekolah
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireSuperAdmin()
    if ('response' in auth) return auth.response

    try {
        const { id } = await params
        const parsed = schoolStatusSchema.safeParse(await request.json())

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
        }

        const { status, statusNote } = parsed.data
        const school = await prisma.school.update({
            where: { id },
            data: {
                status,
                statusNote: statusNote || null,
                approvedAt: status === 'ACTIVE' ? new Date() : undefined,
            }
        })

        // Sekolah yang tidak aktif tidak boleh tetap menerima suara
        if (status !== 'ACTIVE') {
            await prisma.votingSession.updateMany({
                where: { schoolId: id, isActive: true },
                data: { isActive: false, endTime: new Date() }
            })
        }

        console.log(`Status sekolah ${school.npsn} -> ${status} oleh ${auth.session.user.username}`)

        return NextResponse.json({ id: school.id, status: school.status })
    } catch (error) {
        if (isNotFound(error)) {
            return NextResponse.json({ error: 'Sekolah tidak ditemukan' }, { status: 404 })
        }
        console.error('Update school status error:', error)
        return NextResponse.json({ error: 'Gagal mengubah status sekolah' }, { status: 500 })
    }
}
