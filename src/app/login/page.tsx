'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Card } from '@/components/Card'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user))

                if (data.user.role === 'ADMIN') {
                    router.push('/admin')
                } else {
                    router.push('/committee')
                }
            } else {
                setError(data.error || 'Login failed')
            }
        } catch {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Login Admin/Panitia
                    </h1>
                    <h2 className="text-lg text-gray-600 mb-2">
                        E-Vote OSIS SMK N 2 MALINAU
                    </h2>
                    <p className="text-sm text-gray-500">
                        Khusus untuk Administrator dan Panitia Pemilihan
                    </p>
                </div>

                <Card>
                    <div className="text-center mb-6">
                        <div className="text-4xl mb-3">🔐</div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Area Terbatas
                        </h3>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            label="Username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Masukkan username"
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Masukkan password"
                        />

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm text-center">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Masuk...' : 'Masuk'}
                        </Button>
                    </form>

                    {/* Default Credentials Info */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center mb-2">
                            Kredensial Default (Harap diganti setelah login):
                        </p>
                        <div className="text-xs text-gray-600 space-y-1">
                            <p><strong>Admin:</strong> admin / admin123</p>
                            <p><strong>Panitia:</strong> committee / committee123</p>
                        </div>
                    </div>
                </Card>

                {/* Back to Voting */}
                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm mb-3">
                        Ingin memilih sebagai pemilih?
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="text-sm"
                    >
                        🗳️ Kembali ke Halaman Pemilihan
                    </Button>
                </div>

                <div className="mt-6 text-center text-sm text-gray-400">
                    <p>© 2025 SMK N 2 MALINAU</p>
                    <p>Sistem E-Voting OSIS</p>
                </div>
            </div>
        </div>
    )
}