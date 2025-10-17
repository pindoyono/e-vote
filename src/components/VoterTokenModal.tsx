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
                body: JSON.stringify({ token: token.toUpperCase() }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Token tidak valid')
                setLoading(false)
                return
            }

            // Redirect to voting page
            router.push(`/vote/${token.toUpperCase()}`)
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
                <div className="flex items-center mb-6">
                    <div className="bg-purple-100 p-3 rounded-full mr-4">
                        <Vote className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Portal Pemilih</h2>
                        <p className="text-sm text-gray-600">Masukkan token untuk memilih</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                            Token Pemilih
                        </label>
                        <input
                            type="text"
                            id="token"
                            value={token}
                            onChange={(e) => {
                                setToken(e.target.value.toUpperCase())
                                setError('')
                            }}
                            maxLength={5}
                            placeholder="ABC12"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-mono font-bold tracking-wider uppercase"
                            disabled={loading}
                        />
                        <p className="mt-2 text-xs text-gray-500 text-center">
                            Token terdiri dari 5 karakter (huruf dan angka)
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600 text-center">{error}</p>
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
                <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-xs text-purple-800">
                        <strong>ℹ️ Info:</strong> Token voting Anda diberikan oleh admin atau panitia setelah verifikasi.
                        Jika belum mendapat token, silakan hubungi panitia.
                    </p>
                </div>
            </div>
        </div>
    )
}
