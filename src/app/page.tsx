'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Card } from '@/components/Card'

export default function Home() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) {
      setError('Silakan masukkan token pemilihan')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Verify token
      const response = await fetch(`/api/vote/verify/${token.trim()}`)
      
      if (response.ok) {
        // Token valid, redirect to voting page
        router.push(`/vote/${token.trim()}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Token tidak valid atau sudah digunakan')
      }
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              E-Vote OSIS
            </h1>
            <h2 className="text-xl text-gray-600 mb-4">
              SMK N 2 MALINAU
            </h2>
            <p className="text-gray-500">
              Pemilihan Ketua OSIS 2025
            </p>
          </div>

          {/* Voting Token Form */}
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🗳️</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Masukkan Token Pemilihan
              </h3>
              <p className="text-gray-600">
                Masukkan token yang diberikan oleh panitia untuk mulai memilih
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  placeholder="Masukkan token pemilihan (5 karakter)"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  maxLength={5}
                  className="text-center text-xl font-mono tracking-wider"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading || !token.trim()}
              >
                {loading ? 'Memverifikasi...' : 'Mulai Memilih'}
              </Button>
            </form>

            {/* Instructions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 text-center">
                Petunjuk Penggunaan
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>1. Masukkan token 5 karakter yang diberikan panitia</p>
                <p>2. Klik &quot;Mulai Memilih&quot; untuk melanjutkan</p>
                <p>3. Pilih salah satu dari 3 kandidat yang tersedia</p>
                <p>4. Konfirmasi pilihan Anda</p>
                <p className="font-medium text-red-600">
                  ⚠️ Setiap token hanya dapat digunakan sekali
                </p>
              </div>
            </div>
          </Card>

          {/* Admin/Committee Access */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm mb-2">
              Akses untuk Admin atau Panitia?
            </p>
            <Button
              variant="outline"
              onClick={() => router.push('/login')}
              className="text-sm"
            >
              Login Admin/Panitia
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-400 text-xs">
            <p>© 2025 SMK N 2 MALINAU</p>
            <p>Sistem E-Voting OSIS</p>
          </div>
        </div>
      </div>
    </div>
  )
}
