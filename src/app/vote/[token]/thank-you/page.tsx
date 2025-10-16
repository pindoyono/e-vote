'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, Users, School } from 'lucide-react'

interface VoterInfo {
    name: string
    class: string
    hasVoted: boolean
}

export default function ThankYouPage() {
    const params = useParams()
    const [voter, setVoter] = useState<VoterInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const voteToken = params.token as string

    useEffect(() => {
        const fetchVoterInfo = async () => {
            try {
                const response = await fetch(`/api/vote/${voteToken}/status`)
                if (response.ok) {
                    const data = await response.json()
                    setVoter(data.voter)
                }
            } catch (error) {
                console.error('Error fetching voter info:', error)
            } finally {
                setLoading(false)
            }
        }

        if (voteToken) {
            fetchVoterInfo()
        }
    }, [voteToken])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Memuat...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
            <div className="max-w-2xl mx-auto text-center">
                {/* Success Icon */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-2xl mb-6">
                        <CheckCircle className="w-16 h-16 text-green-600" />
                    </div>
                </div>

                {/* Thank You Message */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        TERIMA KASIH!
                    </h1>
                    <h2 className="text-2xl font-semibold text-green-200 mb-6">
                        Suara Anda Telah Tersimpan
                    </h2>

                    {voter && (
                        <div className="bg-white/20 rounded-lg p-4 mb-6">
                            <p className="text-green-100 text-lg">
                                <span className="font-semibold">Pemilih:</span> {voter.name}
                            </p>
                            <p className="text-green-100 text-lg">
                                <span className="font-semibold">Kelas:</span> {voter.class}
                            </p>
                        </div>
                    )}

                    <p className="text-green-100 text-lg leading-relaxed">
                        Anda telah berhasil berpartisipasi dalam{' '}
                        <span className="font-semibold text-yellow-300">
                            Pemilihan Ketua OSIS SMK Negeri 2 Malinau 2025
                        </span>
                    </p>
                </div>

                {/* School Branding */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center justify-center mb-6">
                        <School className="w-12 h-12 text-blue-600 mr-4" />
                        <div className="text-left">
                            <h3 className="text-2xl font-bold text-gray-900">
                                SMK NEGERI 2 MALINAU
                            </h3>
                            <p className="text-gray-600 font-medium">
                                Mewujudkan Generasi Unggul dan Berkarakter
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <h4 className="font-semibold text-gray-900">Demokratis</h4>
                            <p className="text-sm text-gray-600">Setiap suara berharga</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <h4 className="font-semibold text-gray-900">Transparan</h4>
                            <p className="text-sm text-gray-600">Proses yang jujur</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <School className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <h4 className="font-semibold text-gray-900">Berkualitas</h4>
                            <p className="text-sm text-gray-600">Pendidikan terbaik</p>
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <p className="text-gray-700 font-medium mb-2">
                            Hasil pemilihan akan diumumkan setelah pemilihan berakhir
                        </p>
                        <p className="text-sm text-gray-500">
                            Pantau terus pengumuman resmi dari sekolah
                        </p>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center">
                    <p className="text-green-200 text-sm mb-2">
                        Voting selesai pada: {new Date().toLocaleString('id-ID')}
                    </p>
                    <p className="text-green-300 text-xs">
                        © 2025 SMK Negeri 2 Malinau - Sistem E-Voting Pemilihan Ketua OSIS
                    </p>
                </div>

                {/* Important Notice */}
                <div className="mt-6 bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm font-medium">
                        ⚠️ Penting: Jangan bagikan URL voting ini kepada orang lain.
                        Setiap URL bersifat unik dan personal.
                    </p>
                </div>
            </div>
        </div>
    )
}