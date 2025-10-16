'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Power, Settings, Users, Save } from 'lucide-react'

interface VotingSession {
    id: string
    isActive: boolean
    startTime?: string
    endTime?: string
    description?: string
}

interface VotingStats {
    totalVoters: number
    verifiedVoters: number
    totalVotes: number
    candidates: Array<{
        name: string
        voteCount: number
    }>
}

export default function SettingsPage() {
    const [session, setSession] = useState<VotingSession | null>(null)
    const [stats, setStats] = useState<VotingStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const fetchData = async () => {
        try {
            const [sessionRes, statsRes] = await Promise.all([
                fetch('/api/admin/voting-session'),
                fetch('/api/admin/dashboard')
            ])

            const sessionData = await sessionRes.json()
            const statsData = await statsRes.json()

            setSession(sessionData)
            setStats(statsData)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const toggleVoting = async () => {
        setSaving(true)
        try {
            const response = await fetch('/api/admin/voting-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isActive: !session?.isActive,
                }),
            })

            if (response.ok) {
                const updatedSession = await response.json()
                setSession(updatedSession)
                alert(updatedSession.isActive ? 'Voting telah diaktifkan!' : 'Voting telah dinonaktifkan!')
            } else {
                alert('Gagal mengubah status voting')
            }
        } catch (error) {
            console.error('Toggle voting error:', error)
            alert('Terjadi kesalahan')
        } finally {
            setSaving(false)
        }
    }

    const resetVoting = async () => {
        if (!confirm('PERINGATAN: Ini akan menghapus semua data voting! Yakin ingin melanjutkan?')) {
            return
        }

        setSaving(true)
        try {
            const response = await fetch('/api/admin/reset-voting', {
                method: 'POST',
            })

            if (response.ok) {
                alert('Data voting berhasil direset!')
                fetchData()
            } else {
                alert('Gagal mereset data voting')
            }
        } catch (error) {
            console.error('Reset voting error:', error)
            alert('Terjadi kesalahan')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
                </div>

                {/* Voting Control */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <Power className="h-8 w-8 text-gray-600 mr-3" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Kontrol Pemilihan
                                </h2>
                                <p className="text-gray-600">
                                    Aktifkan atau nonaktifkan proses pemilihan
                                </p>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${session?.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {session?.isActive ? 'AKTIF' : 'NONAKTIF'}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Status Saat Ini:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Total Pemilih:</span>
                                <p className="font-semibold text-lg">{stats?.totalVoters || 0}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Terverifikasi:</span>
                                <p className="font-semibold text-lg">{stats?.verifiedVoters || 0}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Suara Masuk:</span>
                                <p className="font-semibold text-lg">{stats?.totalVotes || 0}</p>
                            </div>
                            <div>
                                <span className="text-gray-600">Partisipasi:</span>
                                <p className="font-semibold text-lg">
                                    {stats?.verifiedVoters ?
                                        Math.round((stats.totalVotes / stats.verifiedVoters) * 100) : 0}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={toggleVoting}
                            disabled={saving}
                            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${session?.isActive
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                } disabled:opacity-50`}
                        >
                            <Power className="h-5 w-5 mr-2" />
                            {saving ? 'Menyimpan...' : (session?.isActive ? 'Nonaktifkan Voting' : 'Aktifkan Voting')}
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Users className="h-6 w-6 mr-2" />
                        Statistik Cepat
                    </h2>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Perolehan Suara Sementara:</h3>
                        {stats?.candidates.map((candidate, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <span className="font-medium">{candidate.name}</span>
                                <span className="font-bold text-lg">{candidate.voteCount} suara</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-red-900 mb-4">
                        Zona Berbahaya
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-red-900 mb-2">Reset Semua Data Voting</h3>
                            <p className="text-red-700 text-sm mb-4">
                                Ini akan menghapus semua suara yang telah masuk dan mereset status pemilih.
                                Tindakan ini tidak dapat dibatalkan!
                            </p>
                            <button
                                onClick={resetVoting}
                                disabled={saving || session?.isActive}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium"
                            >
                                {saving ? 'Mereset...' : 'Reset Data Voting'}
                            </button>
                            {session?.isActive && (
                                <p className="text-red-600 text-sm mt-2">
                                    Nonaktifkan voting terlebih dahulu untuk mereset data
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <Settings className="h-6 w-6 mr-2" />
                        Informasi Sistem
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Versi Sistem:</span>
                            <p className="font-semibold">E-Vote v1.0</p>
                        </div>
                        <div>
                            <span className="text-gray-600">Database:</span>
                            <p className="font-semibold">SQLite</p>
                        </div>
                        <div>
                            <span className="text-gray-600">Waktu Server:</span>
                            <p className="font-semibold">{new Date().toLocaleString('id-ID')}</p>
                        </div>
                        <div>
                            <span className="text-gray-600">Pemilihan:</span>
                            <p className="font-semibold">Ketua OSIS SMK N 2 Malinau 2025</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}