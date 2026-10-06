import bcrypt from 'bcryptjs'
import { randomInt } from 'crypto'

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

// Huruf/angka yang mudah dibedakan saat diketik (tanpa 0/O, 1/I/L)
const TOKEN_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const VOTE_TOKEN_LENGTH = 8

// Token pemilih unik secara global (satu token langsung menunjuk sekolah & pemilihnya)
export function generateVoteToken(): string {
    let result = ''
    for (let i = 0; i < VOTE_TOKEN_LENGTH; i++) {
        result += TOKEN_ALPHABET[randomInt(TOKEN_ALPHABET.length)]
    }
    return result
}

export function normalizeVoteToken(token: string): string {
    return token.trim().toUpperCase()
}
