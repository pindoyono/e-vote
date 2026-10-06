import { NextResponse } from 'next/server'
import { SchoolStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/tenant'

const STATUSES: SchoolStatus[] = ['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED']

// Daftar semua sekolah (opsional ?status=PENDING) beserta ringkasan jumlah data
export async function GET(request: Request) {
    const auth = await requireSuperAdmin()
    if ('response' in auth) return auth.response

    const status = new URL(request.url).searchParams.get('status') as SchoolStatus | null

    const schools = await prisma.school.findMany({
        where: status && STATUSES.includes(status) ? { status } : undefined,
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        include: {
            admins: { select: { name: true, username: true } },
            _count: { select: { voters: true, candidates: true, votes: true } }
        }
    })

    const counts = await prisma.school.groupBy({ by: ['status'], _count: true })

    return NextResponse.json({
        schools,
        counts: Object.fromEntries(counts.map(c => [c.status, c._count]))
    })
}
