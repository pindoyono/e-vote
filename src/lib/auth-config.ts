import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { normalizeNpsn } from '@/lib/validations'

const schoolCredentials = {
    npsn: { label: 'NPSN', type: 'text' },
    username: { label: 'Username', type: 'text' },
    password: { label: 'Password', type: 'password' },
}

// Cari akun sekolah (admin/panitia) berdasarkan NPSN + username, lalu cek password dan status sekolah
async function authorizeSchoolUser(
    credentials: Record<'npsn' | 'username' | 'password', string> | undefined,
    role: 'admin' | 'committee'
) {
    if (!credentials?.npsn || !credentials?.username || !credentials?.password) {
        return null
    }

    const school = await prisma.school.findUnique({
        where: { npsn: normalizeNpsn(credentials.npsn) },
    })

    if (!school) {
        return null
    }

    const where = { schoolId_username: { schoolId: school.id, username: credentials.username } }
    const account = role === 'admin'
        ? await prisma.admin.findUnique({ where })
        : await prisma.committee.findUnique({ where })

    if (!account || ('isActive' in account && !account.isActive)) {
        return null
    }

    const isPasswordValid = await verifyPassword(credentials.password, account.password)

    if (!isPasswordValid) {
        return null
    }

    // Status sekolah baru diungkap setelah password benar (kode error: lihat lib/login-errors.ts)
    if (school.status !== 'ACTIVE') {
        throw new Error(`SCHOOL_${school.status}`)
    }

    return {
        id: account.id,
        name: account.name,
        username: account.username,
        role,
        schoolId: school.id,
        npsn: school.npsn,
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'admin-credentials',
            credentials: schoolCredentials,
            async authorize(credentials) {
                return authorizeSchoolUser(credentials, 'admin')
            },
        }),
        CredentialsProvider({
            id: 'committee-credentials',
            name: 'committee-credentials',
            credentials: schoolCredentials,
            async authorize(credentials) {
                return authorizeSchoolUser(credentials, 'committee')
            },
        }),
        CredentialsProvider({
            id: 'superadmin-credentials',
            name: 'superadmin-credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                const admin = await prisma.platformAdmin.findUnique({
                    where: { username: credentials.username },
                })

                if (!admin || !(await verifyPassword(credentials.password, admin.password))) {
                    return null
                }

                return {
                    id: admin.id,
                    name: admin.name,
                    username: admin.username,
                    role: 'superadmin'
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 12 * 60 * 60,
    },
    pages: {
        signIn: '/admin/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.username = user.username
                token.role = user.role
                token.schoolId = user.schoolId
                token.npsn = user.npsn
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub!
                session.user.username = token.username as string
                session.user.role = token.role as string
                session.user.schoolId = token.schoolId
                session.user.npsn = token.npsn
            }
            return session
        },
    },
}
