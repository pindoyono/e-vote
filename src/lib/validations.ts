import { z } from 'zod'

export const SCHOOL_LEVELS = ['SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'SMK', 'SLB', 'Lainnya'] as const

export function normalizeNpsn(npsn: string) {
    return npsn.trim().toUpperCase()
}

// NPSN 8 karakter; umumnya angka, sebagian satuan pendidikan memakai huruf di depan
export const npsnSchema = z
    .string()
    .transform(normalizeNpsn)
    .pipe(z.string().regex(/^[0-9A-Z]{8}$/, 'NPSN harus 8 karakter (angka/huruf)'))

// NISN (10 digit) atau nomor induk sekolah; dibuat longgar agar bisa dipakai semua jenjang
export const studentIdSchema = z
    .string()
    .trim()
    .regex(/^[0-9A-Za-z.\-/]{3,20}$/, 'NISN/NIS harus 3-20 karakter (angka/huruf)')

export const voterSchema = z.object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100),
    class: z.string().trim().min(1, 'Kelas wajib diisi').max(50),
    nisn: studentIdSchema,
})

export const voterUpdateSchema = voterSchema.partial()

export const candidateSchema = z.object({
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    class: z.string().min(1, 'Kelas wajib diisi'),
    vision: z.string().min(10, 'Visi minimal 10 karakter'),
    mission: z.string().min(10, 'Misi minimal 10 karakter'),
    orderNumber: z.number().min(1).max(3),
})

export const adminSchema = z.object({
    username: z.string().min(3, 'Username minimal 3 karakter'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    name: z.string().min(2, 'Nama minimal 2 karakter'),
})

const usernameSchema = z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9._-]{3,30}$/, 'Username 3-30 karakter: huruf, angka, titik, minus, garis bawah')

export const schoolConfigSchema = z.object({
    schoolName: z.string().trim().min(3, 'Nama sekolah minimal 3 karakter').max(150),
    schoolShortName: z.string().trim().min(2, 'Nama singkat minimal 2 karakter').max(50),
    eventTitle: z.string().trim().min(3, 'Judul pemilihan minimal 3 karakter').max(150),
    eventYear: z.string().trim().regex(/^\d{4}(\/\d{4})?$/, 'Tahun contoh: 2026 atau 2026/2027'),
})

export const schoolRegistrationSchema = z.object({
    npsn: npsnSchema,
    name: z.string().trim().min(3, 'Nama sekolah minimal 3 karakter').max(150),
    shortName: z.string().trim().min(2, 'Nama singkat minimal 2 karakter').max(50),
    level: z.enum(SCHOOL_LEVELS, { message: 'Pilih jenjang sekolah' }),
    address: z.string().trim().max(250).optional().or(z.literal('')),
    city: z.string().trim().min(2, 'Kabupaten/kota wajib diisi').max(100),
    province: z.string().trim().min(2, 'Provinsi wajib diisi').max(100),
    contactName: z.string().trim().min(2, 'Nama penanggung jawab wajib diisi').max(100),
    contactPhone: z.string().trim().regex(/^[0-9+\-\s]{8,20}$/, 'Nomor HP/WA tidak valid'),
    contactEmail: z.string().trim().email('Email tidak valid').max(150).optional().or(z.literal('')),
    eventTitle: z.string().trim().min(3, 'Judul pemilihan minimal 3 karakter').max(150),
    adminName: z.string().trim().min(2, 'Nama admin minimal 2 karakter').max(100),
    adminUsername: usernameSchema,
    adminPassword: z.string().min(8, 'Password minimal 8 karakter').max(100),
    // Honeypot anti-bot: harus kosong
    website: z.string().max(0).optional().or(z.literal('')),
})

export const committeeCreateSchema = z.object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100),
    username: usernameSchema,
    password: z.string().min(8, 'Password minimal 8 karakter').max(100),
})

export const schoolStatusSchema = z.object({
    status: z.enum(['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED']),
    statusNote: z.string().trim().max(500).optional(),
})

export type VoterForm = z.infer<typeof voterSchema>
export type CandidateForm = z.infer<typeof candidateSchema>
export type AdminForm = z.infer<typeof adminSchema>
export type SchoolRegistration = z.infer<typeof schoolRegistrationSchema>
