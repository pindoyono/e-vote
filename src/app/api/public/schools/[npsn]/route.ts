import { NextResponse } from 'next/server'
import { findActiveSchoolByNpsn, publicSchool } from '@/lib/school'

// Info publik sekolah aktif untuk halaman /s/[npsn]
export async function GET(
    request: Request,
    { params }: { params: Promise<{ npsn: string }> }
) {
    const { npsn } = await params
    const school = await findActiveSchoolByNpsn(npsn)

    if (!school) {
        return NextResponse.json({ error: 'Sekolah tidak ditemukan atau belum aktif' }, { status: 404 })
    }

    return NextResponse.json(publicSchool(school))
}
