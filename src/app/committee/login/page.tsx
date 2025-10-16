'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, User, Lock, Users } from 'lucide-react'
import Link from 'next/link'

export default function CommitteeLogin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const result = await signIn('committee-credentials', {
                username,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('Username atau password panitia salah. Silakan periksa kembali data login Anda.')
            } else {
                router.push('/committee/verification')
            }
        } catch (error) {
            setError('Terjadi kesalahan sistem. Silakan coba lagi beberapa saat.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-teal-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-white/10 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Portal Panitia
                    </h1>
                    <p className="text-green-200">
                        SMK Negeri 2 Malinau
                    </p>
                    <p className="text-green-300 text-sm">
                        Sistem Verifikasi Pemilih OSIS 2025
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Login Panitia Pemilihan
                        </h2>
                        <p className="text-sm text-gray-600">
                            Masuk sebagai panitia untuk melakukan verifikasi pemilih
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-gray-800 text-sm font-semibold mb-3">
                                Username Panitia
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 text-gray-900 font-medium"
                                    placeholder="Ketik username panitia di sini"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-800 text-sm font-semibold mb-3">
                                Password Panitia
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 text-gray-900 font-medium"
                                    placeholder="Ketik password panitia di sini"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-lg"
                        >
                            {isLoading ? 'Sedang memproses login...' : 'MASUK SEBAGAI PANITIA'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                            <p className="text-green-800 text-sm font-medium mb-1">
                                Login Default Panitia:
                            </p>
                            <p className="text-green-700 text-sm">
                                Username: <span className="font-semibold">panitia</span> |
                                Password: <span className="font-semibold">panitia123</span>
                            </p>
                        </div>

                        <div className="flex items-center justify-center space-x-4 text-sm">
                            <Link
                                href="/admin/login"
                                className="text-green-600 hover:text-green-700 font-medium transition-colors"
                            >
                                Login sebagai Admin
                            </Link>
                            <span className="text-gray-400">|</span>
                            <Link
                                href="/"
                                className="text-gray-600 hover:text-gray-700 transition-colors"
                            >
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}