import { NextResponse } from 'next/server'
import { getServerSession, Session } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export type SchoolRole = 'admin' | 'committee'

type Denied = { response: NextResponse }
type SchoolAuth = { session: Session; schoolId: string }

// Pastikan request datang dari user sekolah dengan peran yang diizinkan, dan sekolahnya masih aktif.
// Semua query data sekolah wajib memakai schoolId dari sini, bukan dari input klien.
export async function requireSchoolUser(roles: SchoolRole[]): Promise<SchoolAuth | Denied> {
    const session = await getServerSession(authOptions)

    if (!session?.user?.schoolId) {
        return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }

    if (!roles.includes(session.user.role as SchoolRole)) {
        return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    }

    // Sesi JWT tetap berlaku setelah sekolah dinonaktifkan, jadi status dicek ulang di setiap request
    const school = await prisma.school.findUnique({
        where: { id: session.user.schoolId },
        select: { status: true }
    })

    if (school?.status !== 'ACTIVE') {
        return { response: NextResponse.json({ error: 'Sekolah tidak aktif' }, { status: 403 }) }
    }

    return { session, schoolId: session.user.schoolId }
}

export async function requireSuperAdmin(): Promise<{ session: Session } | Denied> {
    const session = await getServerSession(authOptions)

    if (!session) {
        return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }

    if (session.user.role !== 'superadmin') {
        return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    }

    return { session }
}
