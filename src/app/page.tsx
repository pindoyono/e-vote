'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Vote, Users, BarChart3, Shield, School, Search, ClipboardCheck, KeyRound } from 'lucide-react'
import VoterTokenModal from '@/components/VoterTokenModal'

const steps = [
    { icon: School, title: 'Daftarkan sekolah', text: 'Isi NPSN, nama sekolah, dan akun admin. Pengelola platform memverifikasi pendaftaran.' },
    { icon: ClipboardCheck, title: 'Siapkan data', text: 'Atur judul pemilihan, impor data pemilih (CSV), tambahkan kandidat, dan buat akun panitia.' },
    { icon: KeyRound, title: 'Verifikasi & token', text: 'Panitia memverifikasi pemilih di hari H; setiap pemilih menerima token unik 8 karakter.' },
    { icon: BarChart3, title: 'Memilih & pantau', text: 'Pemilih memasukkan token lalu memilih. Hasil dipantau langsung secara realtime.' },
]

export default function HomePage() {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [npsn, setNpsn] = useState('')

    const openSchool = (e: React.FormEvent) => {
        e.preventDefault()
        const value = npsn.trim().toUpperCase()
        if (value) router.push(`/s/${encodeURIComponent(value)}`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
            <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                {/* Hero */}
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-2xl mb-6">
                    <Vote className="w-12 h-12 text-blue-600" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">E-VOTE SEKOLAH</h1>
                <h2 className="text-xl md:text-2xl font-semibold text-blue-200 mb-6">
                    Pemilihan elektronik untuk SD, SMP, SMA, SMK, madrasah, dan sekolah lainnya
                </h2>
                <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Selenggarakan pemilihan ketua OSIS, ketua kelas, atau pemilihan lainnya secara aman, transparan,
                    dan modern. Setiap sekolah mengelola datanya sendiri dengan NPSN sebagai identitas.
                </p>

                {/* CTA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                        <Vote className="h-5 w-5" />
                        <span>Saya Pemilih (Masukkan Token)</span>
                    </button>
                    <Link
                        href="/daftar"
                        className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                        <School className="h-5 w-5" />
                        <span>Daftarkan Sekolah</span>
                    </Link>
                    <Link
                        href="/admin/login"
                        className="bg-white hover:bg-gray-100 text-blue-900 font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                        <Shield className="h-5 w-5" />
                        <span>Masuk Admin Sekolah</span>
                    </Link>
                    <Link
                        href="/committee/login"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                        <Users className="h-5 w-5" />
                        <span>Masuk Panitia</span>
                    </Link>
                </div>

                {/* Cari sekolah */}
                <form onSubmit={openSchool} className="max-w-3xl mx-auto bg-white/10 border border-white/20 rounded-lg p-4 mb-16 flex flex-col sm:flex-row gap-3">
                    <label htmlFor="npsn" className="text-blue-100 text-sm font-medium sm:self-center sm:whitespace-nowrap">
                        Lihat halaman &amp; hasil sekolah:
                    </label>
                    <input
                        id="npsn"
                        value={npsn}
                        onChange={(e) => setNpsn(e.target.value)}
                        placeholder="Masukkan NPSN (8 karakter)"
                        maxLength={8}
                        className="flex-1 px-4 py-2 rounded-lg text-gray-900 bg-white font-mono tracking-wider"
                    />
                    <button type="submit" className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-5 py-2 rounded-lg flex items-center justify-center space-x-2">
                        <Search className="h-4 w-4" />
                        <span>Buka</span>
                    </button>
                </form>

                {/* Cara kerja */}
                <h3 className="text-2xl font-bold text-white mb-6">Cara Kerja</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16 text-left">
                    {steps.map((step, i) => {
                        const Icon = step.icon
                        return (
                            <div key={step.title} className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20">
                                <div className="flex items-center mb-3">
                                    <span className="bg-white text-blue-900 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-3">{i + 1}</span>
                                    <Icon className="h-6 w-6 text-blue-200" />
                                </div>
                                <h4 className="text-lg font-semibold text-white mb-1">{step.title}</h4>
                                <p className="text-blue-200 text-sm">{step.text}</p>
                            </div>
                        )
                    })}
                </div>

                {/* Fitur */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                        <Shield className="w-10 h-10 text-green-400 mx-auto mb-3" />
                        <h4 className="text-lg font-semibold text-white mb-1">Aman</h4>
                        <p className="text-blue-200 text-sm">Data tiap sekolah terpisah, pemilih diverifikasi panitia, satu token satu suara</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                        <Users className="w-10 h-10 text-blue-300 mx-auto mb-3" />
                        <h4 className="text-lg font-semibold text-white mb-1">Transparan</h4>
                        <p className="text-blue-200 text-sm">Hasil bisa dipantau realtime di halaman publik sekolah</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                        <BarChart3 className="w-10 h-10 text-purple-300 mx-auto mb-3" />
                        <h4 className="text-lg font-semibold text-white mb-1">Untuk Semua Jenjang</h4>
                        <p className="text-blue-200 text-sm">SD/MI, SMP/MTs, SMA/MA/SMK, SLB, dan satuan pendidikan lain</p>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/20">
                    <p className="text-blue-300 text-sm">© {new Date().getFullYear()} E-Vote Sekolah</p>
                </div>
            </div>

            <VoterTokenModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    )
}
