import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
    // Create default admin
    const hashedAdminPassword = await hashPassword('admin123')

    await prisma.admin.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedAdminPassword,
            name: 'Administrator',
        },
    })

    // Create default committee member
    const hashedCommitteePassword = await hashPassword('panitia123')

    await prisma.committee.upsert({
        where: { username: 'panitia' },
        update: {},
        create: {
            username: 'panitia',
            password: hashedCommitteePassword,
            name: 'Panitia Verifikasi',
            role: 'verifikator',
            isActive: true,
        },
    })

    // Create 3 candidates for OSIS election
    const candidates = [
        {
            name: 'Ahmad Rizki Pratama',
            class: 'XII RPL 1',
            vision: 'Mewujudkan OSIS SMK N 2 Malinau yang inovatif, kreatif, dan berprestasi dengan semangat gotong royong',
            mission: 'Mengembangkan program kerja yang berfokus pada peningkatan kualitas pendidikan, kreativitas siswa, dan mempererat hubungan antar siswa',
            orderNumber: 1,
        },
        {
            name: 'Siti Nurhaliza',
            class: 'XII TKJ 1',
            vision: 'Membangun OSIS yang solid, transparan, dan mampu menjadi wadah aspirasi seluruh siswa SMK N 2 Malinau',
            mission: 'Menjalankan program kerja yang transparan, mengadakan kegiatan yang bermanfaat, dan menjadi penghubung antara siswa dengan pihak sekolah',
            orderNumber: 2,
        },
        {
            name: 'Muhammad Fajar Sidiq',
            class: 'XII OTKP 1',
            vision: 'Menciptakan lingkungan sekolah yang harmonis, produktif, dan menjunjung tinggi nilai-nilai keislaman',
            mission: 'Mengoptimalkan potensi siswa melalui berbagai kegiatan positif, meningkatkan kedisiplinan, dan mempererat silaturahmi',
            orderNumber: 3,
        },
    ]

    for (const candidate of candidates) {
        await prisma.candidate.upsert({
            where: { orderNumber: candidate.orderNumber },
            update: {},
            create: candidate,
        })
    }

    // Create voting session
    await prisma.votingSession.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            isActive: false,
            description: 'Pemilihan Ketua OSIS SMK N 2 Malinau 2025',
        },
    })

    console.log('Seed data created successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })