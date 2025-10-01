'use client'

import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/Card'

export default function ThankYouPage() {
    const searchParams = useSearchParams()
    const candidateName = searchParams.get('candidate')

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
            <div className="container mx-auto px-4">
                <Card className="max-w-2xl mx-auto text-center">
                    {/* Success Icon */}
                    <div className="text-green-500 text-8xl mb-6">
                        ✅
                    </div>

                    {/* Thank You Message */}
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Terima Kasih!
                    </h1>

                    <h2 className="text-2xl font-semibold text-blue-600 mb-6">
                        Vote Anda Telah Berhasil Disimpan
                    </h2>

                    {candidateName && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-lg text-gray-700">
                                Anda telah memilih kandidat:
                            </p>
                            <p className="text-xl font-bold text-blue-600 mt-2">
                                {candidateName}
                            </p>
                        </div>
                    )}

                    {/* Message */}
                    <div className="space-y-4 text-gray-700 mb-8">
                        <p className="text-lg">
                            Terima kasih telah berpartisipasi dalam pemilihan Ketua OSIS SMK N 2 MALINAU
                        </p>
                        <p>
                            Vote Anda sangat berharga untuk kemajuan organisasi siswa di sekolah kita.
                        </p>
                        <p className="font-medium">
                            Hasil pemilihan akan diumumkan setelah proses voting selesai.
                        </p>
                    </div>

                    {/* School Info */}
                    <div className="border-t pt-6 mt-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            SMK N 2 MALINAU
                        </h3>
                        <p className="text-gray-600">
                            Sistem Pemilihan Ketua OSIS Electronic Voting
                        </p>
                        <p className="text-sm text-gray-500 mt-4">
                            Halaman ini akan tertutup otomatis dalam beberapa saat
                        </p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="flex justify-center space-x-4 mt-8 text-4xl">
                        <span>🎉</span>
                        <span>🏫</span>
                        <span>🗳️</span>
                        <span>✨</span>
                    </div>
                </Card>
            </div>
        </div>
    )
}