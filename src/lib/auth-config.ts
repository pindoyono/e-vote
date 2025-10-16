import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'admin-credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                const admin = await prisma.admin.findUnique({
                    where: { username: credentials.username },
                })

                if (!admin) {
                    return null
                }

                const isPasswordValid = await verifyPassword(
                    credentials.password,
                    admin.password
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: admin.id,
                    name: admin.name,
                    username: admin.username,
                    role: 'admin'
                }
            },
        }),
        CredentialsProvider({
            id: 'committee-credentials',
            name: 'committee-credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                const committee = await prisma.committee.findUnique({
                    where: {
                        username: credentials.username,
                        isActive: true
                    },
                })

                if (!committee) {
                    return null
                }

                const isPasswordValid = await verifyPassword(
                    credentials.password,
                    committee.password
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: committee.id,
                    name: committee.name,
                    username: committee.username,
                    role: 'committee'
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/admin/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.username = user.username
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub!
                session.user.username = token.username as string
                session.user.role = token.role as string
            }
            return session
        },
    },
}