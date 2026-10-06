import { NextResponse } from 'next/server'
import { requireSchoolUser } from '@/lib/tenant'

export async function GET() {
  const auth = await requireSchoolUser(['admin'])
  if ('response' in auth) return auth.response

  // Template CSV: Nama, Kelas, NISN/NIS (tanpa header)
  const csvTemplate = `Ahmad Nugroho,Kelas 6A,0123456789
Siti Aminah,Kelas 6B,0123456790
Budi Santoso,IX-1,0123456791
Dewi Sartika,XII IPA 1,0123456792
Eko Prasetyo,XII TKJ 2,0123456793`

  return new NextResponse(csvTemplate, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="template-pemilih.csv"',
    },
  })
}
