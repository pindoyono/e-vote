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
        const url = req.nextUrl.clone()
        url.pathname = area.login
        url.search = ''
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/committee/:path*', '/superadmin/:path*']
}
