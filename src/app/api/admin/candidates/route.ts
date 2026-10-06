import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'
import { saveCandidatePhoto, UploadError } from '@/lib/upload'
import { isUniqueViolation } from '@/lib/db-errors'

export async function GET() {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    try {
        const candidates = await prisma.candidate.findMany({
            where: { schoolId: auth.schoolId },
            orderBy: { orderNumber: 'asc' }
        })
        return NextResponse.json(candidates)
    } catch (error) {
        console.error('Get candidates error:', error)
        return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    try {
        const formData = await request.formData()
        const name = formData.get('name') as string
        const kelas = formData.get('class') as string
        const vision = formData.get('vision') as string
        const mission = formData.get('mission') as string
        const orderNumber = parseInt(formData.get('orderNumber') as string || '0')

        let photoPath: string | undefined = undefined
        const file = formData.get('photo') as File | null
        if (file && file.size > 0) {
            photoPath = await saveCandidatePhoto(file)
        }

        const candidate = await prisma.candidate.create({
            data: {
                schoolId: auth.schoolId,
                name,
                class: kelas,
                vision,
                mission,
                photo: photoPath,
                orderNumber
            }
        })

        return NextResponse.json(candidate)
    } catch (error) {
        if (error instanceof UploadError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        if (isUniqueViolation(error)) {
            return NextResponse.json({ error: 'Nomor urut kandidat sudah dipakai' }, { status: 400 })
        }
        console.error('Create candidate error:', error)
        return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 })
    }
}
