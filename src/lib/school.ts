import { School, VotingSession } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { normalizeVoteToken } from '@/lib/auth'
import { normalizeNpsn } from '@/lib/validations'

// Data sekolah yang aman ditampilkan ke publik (tanpa kontak/status internal)
export function publicSchool(school: School) {
    return {
        npsn: school.npsn,
        level: school.level,
        schoolName: school.name,
        schoolShortName: school.shortName,
        eventTitle: school.eventTitle,
        eventYear: school.eventYear,
    }
}

export type PublicSchool = ReturnType<typeof publicSchool>

// Alasan voting tidak bisa dilakukan, untuk ditampilkan ke pemilih
export function votingClosedMessage(session: VotingSession | null) {
    return session?.endTime
        ? 'Pemilihan sudah ditutup oleh panitia.'
        : 'Pemilihan belum dibuka. Tunggu sampai panitia/admin membuka pemilihan, lalu masukkan token Anda lagi.'
}

export async function findActiveSchoolByNpsn(npsn: string) {
    return prisma.school.findFirst({
        where: { npsn: normalizeNpsn(npsn), status: 'ACTIVE' }
    })
}

// Pemilih terverifikasi pemilik token, hanya jika sekolahnya aktif
export async function findVoterByToken(token: string) {
    const voter = await prisma.voter.findFirst({
        where: { voteToken: normalizeVoteToken(token), isVerified: true },
        include: { school: true }
    })

    if (!voter || voter.school.status !== 'ACTIVE') {
        return null
    }

    return voter
}
