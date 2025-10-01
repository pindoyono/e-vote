import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 12)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword)
}

export const generateToken = (userId: string): string => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' })
}

export function verifyJWT(token: string): { userId: number } | null {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
            return decoded as { userId: number }
        }
        return null
    } catch {
        return null
    }
}

export const generateVoteToken = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''

    for (let i = 0; i < 5; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    return token
}