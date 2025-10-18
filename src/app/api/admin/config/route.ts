import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get all config values
export async function GET() {
    try {
        const configs = await prisma.config.findMany()

        // Convert array to object
        const configObject: Record<string, string> = {}
        configs.forEach(config => {
            configObject[config.key] = config.value
        })

        return NextResponse.json(configObject)
    } catch (error) {
        console.error('Get config error:', error)
        return NextResponse.json(
            { error: 'Gagal mengambil konfigurasi' },
            { status: 500 }
        )
    }
}

// POST - Update config values
export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Update each config key
        const promises = Object.keys(body).map(key =>
            prisma.config.upsert({
                where: { key },
                update: {
                    value: body[key],
                    updatedAt: new Date()
                },
                create: {
                    key,
                    value: body[key],
                    updatedAt: new Date()
                }
            })
        )

        await Promise.all(promises)

        return NextResponse.json({ success: true, message: 'Konfigurasi berhasil disimpan' })
    } catch (error) {
        console.error('Update config error:', error)
        return NextResponse.json(
            { error: 'Gagal menyimpan konfigurasi' },
            { status: 500 }
        )
    }
}
