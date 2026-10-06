'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Vote, Users, BarChart3, Shield } from 'lucide-react'
import VoterTokenModal from '@/components/VoterTokenModal'
import { usePublicSchool } from '@/components/usePublicSchool'

export default function SchoolHomePage() {
    const params = useParams()
    const npsn = params.npsn as string
    const { school, notFound } = usePublicSchool(npsn)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        if (school) document.title = `${school.eventTitle} - ${school.schoolName}`
    }, [school])

    if (notFound) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center px-4">
                <div className="bg-white rounded-xl p-8 max-w-md text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Sekolah tidak ditemukan</h1>
                    <p className="text-gray-600 mb-6">
                        NPSN <span className="font-mono font-semibold">{npsn}</span> belum terdaftar atau belum diaktifkan.
                    </p>
                    <Link href="/" className="text-blue-600 font-medium hover:underline">Kembali ke beranda</Link>
                </div>
            </div>
        )
    }

    if (!school) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
        )
    }

    const loginQuery = `?npsn=${encodeURIComponent(school.npsn)}`

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
            <div className="flex items-center justify-center min-h-screen px-4 py-12">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-2xl mb-6">
                        <Vote className="w-12 h-12 text-blue-600" />
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">E-VOTE</h1>
                    <h2 className="text-2xl md:text-3xl font-semibold text-blue-200 mb-4">
                        {school.eventTitle} {school.eventYear}
                    </h2>
                    <h3 className="text-xl md:text-2xl text-blue-300 mb-2">{school.schoolName}</h3>
                    <p className="text-blue-400 text-sm mb-10">NPSN {school.npsn}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-colors"
                        >
                            <Vote className="h-5 w-5" />
                            <span>Portal Pemilih</span>
                        </button>
                        <Link
                            href={`/s/${school.npsn}/monitoring`}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-colors"
                        >
                            <BarChart3 className="h-5 w-5" />
                            <span>Monitoring Hasil</span>
                        </Link>
                        <Link
                            href={`/admin/login${loginQuery}`}
                            className="bg-white hover:bg-gray-100 text-blue-900 font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-colors"
                        >
                            <Shield className="h-5 w-5" />
                            <span>Admin</span>
                        </Link>
                        <Link
                            href={`/committee/login${loginQuery}`}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-colors"
                        >
                            <Users className="h-5 w-5" />
                            <span>Panitia</span>
                        </Link>
                    </div>

                    <div className="mt-8 bg-yellow-100 border border-yellow-300 rounded-lg p-6 text-yellow-800">
                        <h4 className="font-semibold mb-2">Informasi Penting:</h4>
                        <ul className="text-sm space-y-1 text-left max-w-lg mx-auto">
                            <li>• Setiap pemilih harus diverifikasi terlebih dahulu oleh panitia</li>
                            <li>• Token pemilih terdiri dari 8 karakter dan hanya bisa dipakai sekali</li>
                            <li>• Satu pemilih hanya dapat memberikan satu suara</li>
                            <li>• Hasil dapat dipantau secara realtime</li>
                        </ul>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/20">
                        <p className="text-blue-300 text-sm">
                            © {new Date().getFullYear()} {school.schoolName} · <Link href="/" className="hover:underline">E-Vote Sekolah</Link>
                        </p>
                    </div>
                </div>
            </div>

            <VoterTokenModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                subtitle={`${school.eventTitle} ${school.eventYear}`}
            />
        </div>
    )
}
