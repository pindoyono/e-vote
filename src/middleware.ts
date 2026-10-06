import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Setiap area hanya untuk perannya; halaman login masing-masing tetap terbuka
const AREAS = [
    { prefix: '/superadmin', role: 'superadmin', login: '/superadmin/login' },
    { prefix: '/admin', role: 'admin', login: '/admin/login' },
    { prefix: '/committee', role: 'committee', login: '/committee/login' },
]

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl
    const area = AREAS.find(a => pathname === a.prefix || pathname.startsWith(a.prefix + '/'))

    if (!area || pathname === area.login) {
        return NextResponse.next()
    }

    const token = await getToken({ req })

    if (token?.role !== area.role) {
        // req.nextUrl berisi alamat internal server (127.0.0.1:port) di belakang reverse proxy,
        // jadi tujuan redirect disusun dari Host yang diteruskan nginx
        const host = req.headers.get('host')
        const proto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '')
        const origin = host ? `${proto}://${host}` : req.nextUrl.origin
        return NextResponse.redirect(new URL(area.login, origin))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/committee/:path*', '/superadmin/:path*']
}
