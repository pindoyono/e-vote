import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSchoolUser } from '@/lib/tenant'
import { saveCandidatePhoto, UploadError } from '@/lib/upload'
import { isNotFound, isUniqueViolation } from '@/lib/db-errors'
import { Prisma } from '@prisma/client'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    try {
        const { id } = await params
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

        // Prepare update data - only include photo if a new one was uploaded
        const updateData: {
            name: string
            class: string
            vision: string
            mission: string
            orderNumber: number
            photo?: string
        } = {
            name,
            class: kelas,
            vision,
            mission,
            orderNumber
        }

        if (photoPath !== undefined) {
            updateData.photo = photoPath
        }

        const updated = await prisma.candidate.update({
            where: { id, schoolId: auth.schoolId },
            data: updateData
        })

        return NextResponse.json(updated)
    } catch (error) {
        if (error instanceof UploadError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        if (isNotFound(error)) {
            return NextResponse.json({ error: 'Kandidat tidak ditemukan' }, { status: 404 })
        }
        if (isUniqueViolation(error)) {
            return NextResponse.json({ error: 'Nomor urut kandidat sudah dipakai' }, { status: 400 })
        }
        console.error('Update candidate error:', error)
        return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireSchoolUser(['admin'])
    if ('response' in auth) return auth.response

    try {
        const { id } = await params
        await prisma.candidate.delete({ where: { id, schoolId: auth.schoolId } })
        return NextResponse.json({ success: true })
    } catch (error) {
        if (isNotFound(error)) {
            return NextResponse.json({ error: 'Kandidat tidak ditemukan' }, { status: 404 })
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            return NextResponse.json({ error: 'Kandidat sudah memperoleh suara dan tidak bisa dihapus. Reset suara terlebih dahulu.' }, { status: 400 })
        }
        console.error('Delete candidate error:', error)
        return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500 })
    }
}
