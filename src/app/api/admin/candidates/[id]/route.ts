import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const formData = await request.formData()
        const name = formData.get('name') as string
        const kelas = formData.get('class') as string
        const vision = formData.get('vision') as string
        const mission = formData.get('mission') as string
        const orderNumber = parseInt(formData.get('orderNumber') as string || '0')

        console.log('Updating candidate:', { id, name, kelas, vision, mission, orderNumber })

        let photoPath: string | undefined = undefined
        const file = formData.get('photo') as File | null
        if (file && file.size > 0) {
            console.log('Processing file upload:', file.name, file.size)
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            const fileName = `/uploads/${Date.now()}-${file.name}`

            // Ensure uploads directory exists
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true })
            }

            const fullPath = path.join(process.cwd(), 'public', fileName)
            fs.writeFileSync(fullPath, buffer)
            photoPath = fileName
            console.log('File saved to:', fullPath)
        } else {
            console.log('No file uploaded or file is empty')
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

        // Only update photo if a new one was uploaded
        if (photoPath !== undefined) {
            updateData.photo = photoPath
            console.log('Including photo in update:', photoPath)
        } else {
            console.log('No photo update - keeping existing photo')
        }

        console.log('Update data:', updateData)

        const updated = await prisma.candidate.update({
            where: { id },
            data: updateData
        })

        console.log('Candidate updated successfully:', updated.id)
        return NextResponse.json(updated)
    } catch (error) {
        console.error('Update candidate error:', error)
        return NextResponse.json({
            error: 'Failed to update candidate',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.candidate.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete candidate error:', error)
        return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500 })
    }
}