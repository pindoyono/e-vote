import { z } from 'zod'

export const voterSchema = z.object({
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    class: z.string().min(1, 'Kelas wajib diisi'),
    nisn: z.string().length(10, 'NISN harus 10 digit'),
})

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

export type VoterForm = z.infer<typeof voterSchema>
export type CandidateForm = z.infer<typeof candidateSchema>
export type AdminForm = z.infer<typeof adminSchema>