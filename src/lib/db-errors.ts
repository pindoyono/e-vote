import { Prisma } from '@prisma/client'

// Pelanggaran constraint unik (mis. NISN/nomor urut/username sudah dipakai)
export function isUniqueViolation(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

// Record tidak ditemukan saat update/delete (termasuk karena bukan milik sekolah ini)
export function isNotFound(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}
