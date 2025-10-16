'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, User, Lock } from 'lucide-react'
import Link from 'next/link'

export default function AdminLogin() {
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
            const result = await signIn('credentials', {
                username,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('Username atau password salah. Silakan periksa kembali data login Anda.')
            } else {
                router.push('/admin/dashboard')
            }
        } catch (error) {
            setError('Terjadi kesalahan sistem. Silakan coba lagi beberapa saat.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        E-Vote Admin
                    </h1>
                    <p className="text-blue-200">
                        SMK Negeri 2 Malinau
                    </p>
                    <p className="text-blue-300 text-sm">
                        Pemilihan Ketua OSIS 2025
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-gray-800 text-sm font-semibold mb-3">
                                Nama Pengguna Administrator
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 font-medium"
                                    placeholder="Ketik username admin di sini"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-800 text-sm font-semibold mb-3">
                                Kata Sandi Administrator
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 font-medium"
                                    placeholder="Ketik password admin di sini"
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
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-lg"
                        >
                            {isLoading ? 'Sedang memproses login...' : 'MASUK KE SISTEM ADMIN'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <div className="flex items-center justify-center space-x-4 text-sm">
                            <Link
                                href="/committee/login"
                                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                Login sebagai Panitia
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