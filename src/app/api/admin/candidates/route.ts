import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { saveCandidatePhoto, UploadError } from '@/lib/upload'

export async function GET() {
    try {
        const candidates = await prisma.candidate.findMany({ orderBy: { orderNumber: 'asc' } })
        return NextResponse.json(candidates)
    } catch (error) {
        console.error('Get candidates error:', error)
        return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const denied = await requireAdmin()
    if (denied) return denied

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
        console.error('Create candidate error:', error)
        return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 })
    }
}