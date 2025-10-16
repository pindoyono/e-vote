import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            const fileName = `/uploads/${Date.now()}-${file.name}`
            const fs = require('fs')
            const path = require('path')
            const fullPath = path.join(process.cwd(), 'public', fileName)
            fs.writeFileSync(fullPath, buffer)
            photoPath = fileName
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
        console.error('Create candidate error:', error)
        return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 })
    }
}