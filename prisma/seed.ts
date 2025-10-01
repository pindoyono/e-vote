import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Create admin user
    const adminPassword = await hashPassword('admin123')
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: adminPassword,
            role: 'ADMIN'
        }
    })

    // Create committee user
    const committeePassword = await hashPassword('committee123')
    const committee = await prisma.user.upsert({
        where: { username: 'committee' },
        update: {},
        create: {
            username: 'committee',
            password: committeePassword,
            role: 'COMMITTEE'
        }
    })

    // Create sample candidates
    const candidates = [
        {
            name: 'Ahmad Rizki',
            class: 'XI RPL 1',
            vision: 'Mewujudkan OSIS yang inovatif dan berprestasi',
            mission: 'Meningkatkan partisipasi siswa dalam kegiatan sekolah dan mengembangkan kreativitas siswa',
            orderNumber: 1
        },
        {
            name: 'Siti Nurhaliza',
            class: 'XI TKJ 2',
            vision: 'Membangun OSIS yang demokratis dan transparan',
            mission: 'Menjadi jembatan antara siswa dan pihak sekolah serta mengadakan program-program yang bermanfaat',
            orderNumber: 2
        },
        {
            name: 'Budi Santoso',
            class: 'XI MM 1',
            vision: 'Menciptakan lingkungan sekolah yang harmonis dan kondusif',
            mission: 'Mengembangkan potensi siswa melalui berbagai kegiatan ekstrakurikuler dan sosial',
            orderNumber: 3
        }
    ]

    for (const candidate of candidates) {
        await prisma.candidate.upsert({
            where: { orderNumber: candidate.orderNumber },
            update: {},
            create: candidate
        })
    }

    // Create sample voters
    const sampleVoters = [
        { studentId: '2023001', name: 'Andi Wijaya', class: 'X RPL 1' },
        { studentId: '2023002', name: 'Budi Hartono', class: 'X RPL 2' },
        { studentId: '2023003', name: 'Citra Dewi', class: 'X TKJ 1' },
        { studentId: '2023004', name: 'Dina Marlina', class: 'X TKJ 2' },
        { studentId: '2023005', name: 'Eko Prasetyo', class: 'X MM 1' }
    ]

    for (const voter of sampleVoters) {
        await prisma.voter.upsert({
            where: { studentId: voter.studentId },
            update: {},
            create: voter
        })
    }

    console.log('Database seeded successfully!')
    console.log('Admin credentials: admin / admin123')
    console.log('Committee credentials: committee / committee123')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })