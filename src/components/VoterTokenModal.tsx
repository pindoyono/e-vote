'use client'

import { useState } from 'react'
import { X, Vote } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface VoterTokenModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function VoterTokenModal({ isOpen, onClose }: VoterTokenModalProps) {
    const [token, setToken] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!token.trim()) {
            setError('Token tidak boleh kosong')
            return
        }

        if (token.length !== 5) {
            setError('Token harus 5 karakter')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`/api/vote/validate-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: token }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Token tidak valid')
                setLoading(false)
                return
            }

            // Redirect to voting page
            router.push(`/vote/${token}`)
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.')
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center mb-3">
                        <div className="bg-purple-100 p-3 rounded-full mr-4">
                            <Vote className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Portal Pemilih</h2>
                            <p className="text-sm text-purple-600 font-medium">Pemilihan Ketua OSIS 2025</p>
                        </div>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <p className="text-sm text-blue-800 font-medium">
                            Masukkan <span className="font-bold">kode token</span> yang Anda terima dari panitia untuk mulai memilih kandidat Ketua OSIS.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="token" className="block text-base font-semibold text-gray-900 mb-3">
                            Masukkan Kode Token Anda
                        </label>
                        <input
                            type="text"
                            id="token"
                            value={token}
                            onChange={(e) => {
                                setToken(e.target.value)
                                setError('')
                            }}
                            maxLength={5}
                            placeholder="ABC12"
                            className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center text-3xl font-mono font-bold tracking-widest shadow-sm"
                            disabled={loading}
                            autoFocus
                        />
                        <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                                <p className="text-sm text-gray-600">
                                    Token terdiri dari <span className="font-semibold text-gray-900">5 karakter</span> (huruf dan angka)
                                </p>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                                <p className="text-sm text-gray-600">
                                    Contoh format: <span className="font-mono font-bold text-purple-600">ABC12</span>, <span className="font-mono font-bold text-purple-600">XY789</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-purple-400 transition-colors flex items-center justify-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memvalidasi...
                                </>
                            ) : (
                                'Akses Halaman Vote'
                            )}
                        </button>
                    </div>
                </form>

                {/* Info */}
                <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100">
                                <svg className="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">📱 Belum Punya Token?</h4>
                            <ul className="text-xs text-gray-700 space-y-1.5">
                                <li className="flex items-start">
                                    <span className="font-bold text-purple-600 mr-2">1.</span>
                                    <span>Token diberikan oleh <span className="font-semibold">panitia atau admin</span> setelah data Anda diverifikasi</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-bold text-purple-600 mr-2">2.</span>
                                    <span>Hubungi panitia OSIS jika belum menerima token</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="font-bold text-purple-600 mr-2">3.</span>
                                    <span>Setiap pemilih hanya mendapat <span className="font-semibold">1 token</span> untuk <span className="font-semibold">1 kali voting</span></span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
