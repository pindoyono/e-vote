'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'

export default function SuperAdminLogin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const result = await signIn('superadmin-credentials', { username, password, redirect: false })
        setLoading(false)
        if (result?.error) {
            setError('Username atau password salah')
        } else {
            router.push('/superadmin')
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm space-y-5">
                <div className="text-center">
                    <ShieldCheck className="h-12 w-12 text-gray-800 mx-auto mb-2" />
                    <h1 className="text-2xl font-bold text-gray-900">Pengelola Platform</h1>
                </div>
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    autoComplete="username"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900"
                    required
                />
                <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-500 text-white font-semibold py-3 rounded-lg">
                    {loading ? 'Memproses...' : 'Masuk'}
                </button>
            </form>
        </div>
    )
}
