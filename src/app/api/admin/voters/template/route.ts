import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Template CSV dengan contoh data
    const csvTemplate = `Ahmad Nugroho,XII RPL 1,1234567890
Siti Aminah,XII TKJ 1,1234567891
Budi Santoso,XII OTKP 1,1234567892
Dewi Sartika,XII RPL 2,1234567893
Eko Prasetyo,XII TKJ 2,1234567894`

    const response = new NextResponse(csvTemplate, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="template-pemilih.csv"',
      },
    })

    return response
  } catch (error) {
    console.error('Template download error:', error)
    return NextResponse.json(
      { error: 'Gagal mengunduh template' },
      { status: 500 }
    )
  }
}