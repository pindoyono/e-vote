import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const MAX_SIZE = 5 * 1024 * 1024

// Folder upload bisa dipindah ke luar kode lewat UPLOAD_DIR; URL publik tetap /uploads/<nama>
const uploadsDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')

function detectImageType(buffer: Buffer): string | null {
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg'
    if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
    if (buffer.length >= 12 && buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return 'webp'
    return null
}

// Simpan foto kandidat; nama file dibuat server, isi dicek dari magic bytes (bukan dari nama/MIME kiriman klien)
export async function saveCandidatePhoto(file: File): Promise<string> {
    if (file.size > MAX_SIZE) {
        throw new UploadError('Ukuran foto maksimal 5 MB')
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = detectImageType(buffer)
    if (!ext) {
        throw new UploadError('Foto harus berformat JPG, PNG, atau WebP')
    }

    fs.mkdirSync(uploadsDir, { recursive: true })
    const fileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`
    fs.writeFileSync(path.join(uploadsDir, fileName), buffer, { mode: 0o644 })

    return `/uploads/${fileName}`
}

export class UploadError extends Error {}
