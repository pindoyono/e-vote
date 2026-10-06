// Buat atau reset akun pengelola platform (super admin).
// Pemakaian: SUPERADMIN_USERNAME=... SUPERADMIN_PASSWORD=... node scripts/create-superadmin.mjs
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const username = process.env.SUPERADMIN_USERNAME
const password = process.env.SUPERADMIN_PASSWORD
const name = process.env.SUPERADMIN_NAME || 'Pengelola Platform'

if (!username || !password || password.length < 12) {
    console.error('Set SUPERADMIN_USERNAME dan SUPERADMIN_PASSWORD (minimal 12 karakter).')
    process.exit(1)
}

const prisma = new PrismaClient()
const hash = await bcrypt.hash(password, 12)

await prisma.platformAdmin.upsert({
    where: { username },
    update: { password: hash, name },
    create: { username, password: hash, name },
})

console.log(`Super admin "${username}" siap.`)
await prisma.$disconnect()
