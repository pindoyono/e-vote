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
        } catch (error) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        E-Vote OSIS
                    </h1>
                    <p className="text-gray-600">
                        SMK N 2 MALINAU
                    </p>
                </div>

                <Card>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            label="Username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />

                        {error && (
                            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </Card>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Sistem Pemilihan Ketua OSIS</p>
                    <p>SMK N 2 MALINAU</p>
                </div>
            </div>
        </div>
    )
}