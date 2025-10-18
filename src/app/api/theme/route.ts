import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get theme configuration as CSS variables
export async function GET() {
    try {
        const themeConfigs = await prisma.config.findMany({
            where: {
                key: {
                    in: ['themePrimary', 'themeSecondary', 'themeAccent', 'themeSuccess']
                }
            }
        })

        const theme: Record<string, string> = {
            themePrimary: '#1e40af',
            themeSecondary: '#3b82f6',
            themeAccent: '#eab308',
            themeSuccess: '#16a34a'
        }

        themeConfigs.forEach(config => {
            theme[config.key] = config.value
        })

        return NextResponse.json(theme)
    } catch (error) {
        console.error('Get theme error:', error)
        return NextResponse.json(
            { error: 'Gagal mengambil tema' },
            { status: 500 }
        )
    }
}
