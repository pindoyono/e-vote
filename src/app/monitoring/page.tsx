'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Monitor } from 'lucide-react'

// Monitoring kini per sekolah: minta NPSN lalu arahkan ke /s/[npsn]/monitoring
export default function MonitoringIndexPage() {
    const router = useRouter()
    const [npsn, setNpsn] = useState('')

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        const value = npsn.trim().toUpperCase()
        if (value) router.push(`/s/${encodeURIComponent(value)}/monitoring`)
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <form onSubmit={submit} className="bg-gray-800 rounded-xl p-8 w-full max-w-md text-white">
                <h1 className="text-2xl font-bold flex items-center mb-2">
                    <Monitor className="h-7 w-7 mr-3 text-blue-400" />
                    Monitoring Realtime
                </h1>
                <p className="text-gray-400 mb-6">Masukkan NPSN sekolah untuk melihat hasil pemilihannya.</p>
                <input
                    value={npsn}
                    onChange={(e) => setNpsn(e.target.value)}
                    placeholder="NPSN (8 karakter)"
                    maxLength={8}
                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 font-mono tracking-wider mb-4"
                    required
                />
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-semibold py-3 rounded-lg">
                    Lihat Hasil
                </button>
                <Link href="/" className="block text-center text-gray-400 text-sm mt-4 hover:text-white">Kembali ke beranda</Link>
            </form>
        </div>
    )
}
