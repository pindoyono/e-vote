import NextAuth from 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            name: string
            username: string
            role: string
            schoolId?: string
            npsn?: string
        }
    }

    interface User {
        id: string
        name: string
        username: string
        role: string
        schoolId?: string
        npsn?: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        username: string
        role: string
        schoolId?: string
        npsn?: string
    }
}
