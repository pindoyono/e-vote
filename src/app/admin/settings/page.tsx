'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Power, Settings, Users } from 'lucide-react'

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
                    isActive: !session?.isActive
                }),
            })

            if (response.ok) {
                await fetchData()
                alert(session?.isActive ? 'Voting berhasil dinonaktifkan' : 'Voting berhasil diaktifkan')
            } else {
                alert('Terjadi kesalahan')
            }
        } catch (error) {
            console.error('Toggle voting error:', error)
            alert('Terjadi kesalahan')
        } finally {
            setSaving(false)
        }
    }

    const resetVoting = async () => {
        if (!confirm('Yakin ingin mereset semua data voting? Tindakan ini tidak dapat dibatalkan!')) {
            return
        }

        setSaving(true)
        try {
            const response = await fetch('/api/admin/reset-voting', {
                method: 'POST',
            })

            if (response.ok) {
                await fetchData()
                alert('Data voting berhasil direset')
            } else {
                alert('Terjadi kesalahan')
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
            <div className="space-y-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengaturan Sistem</h1>
                    <p className="text-lg text-gray-600">
                        Kelola pengaturan dan kontrol sistem e-voting
                    </p>
                </div>

                {/* Voting Control */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                <Power className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                    Kontrol Pemilihan
                                </h2>
                                <p className="text-lg text-gray-600">
                                    Aktifkan atau nonaktifkan proses pemilihan secara keseluruhan
                                </p>
                            </div>
                        </div>
                        <div className={`px-6 py-3 rounded-full text-lg font-bold border-2 ${session?.isActive
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                            }`}>
                            {session?.isActive ? '🟢 AKTIF' : '🔴 NONAKTIF'}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Users className="h-6 w-6 mr-2 text-blue-600" />
                            Status Pemilihan Saat Ini
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Pemilih</p>
                                <p className="text-3xl font-bold text-blue-600">{stats?.totalVoters || 0}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600 mb-1">Terverifikasi</p>
                                <p className="text-3xl font-bold text-green-600">{stats?.verifiedVoters || 0}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Suara</p>
                                <p className="text-3xl font-bold text-purple-600">{stats?.totalVotes || 0}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600 mb-1">Partisipasi</p>
                                <p className="text-3xl font-bold text-orange-600">
                                    {stats?.totalVoters ? Math.round((stats?.totalVotes || 0) / stats.totalVoters * 100) : 0}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={toggleVoting}
                            disabled={saving}
                            className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all ${session?.isActive
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                                } disabled:opacity-50`}
                        >
                            {saving ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Menyimpan...
                                </div>
                            ) : (
                                <>
                                    {session?.isActive ? '⏸️ Nonaktifkan Voting' : '▶️ Aktifkan Voting'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <Users className="h-7 w-7 mr-3 text-purple-600" />
                        Statistik Real-time
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stats?.candidates?.map((candidate, index) => (
                            <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {candidate.name}
                                    </h3>
                                    <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                                        #{index + 1}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 font-medium">Total Suara:</span>
                                    <span className="text-2xl font-bold text-purple-600">
                                        {candidate.voteCount}
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
                                            style={{
                                                width: `${stats?.totalVotes ? (candidate.voteCount / stats.totalVotes) * 100 : 0}%`
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 text-center">
                                        {stats?.totalVotes ? Math.round((candidate.voteCount / stats.totalVotes) * 100) : 0}% dari total suara
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
                    <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center">
                        ⚠️ Zona Berbahaya
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-red-200">
                            <h3 className="text-xl font-bold text-red-900 mb-3">Reset Semua Data Voting</h3>
                            <p className="text-red-700 text-lg mb-4 leading-relaxed">
                                Tindakan ini akan <strong>menghapus semua suara</strong> yang telah masuk dan
                                <strong> mereset status pemilih</strong> ke kondisi awal.
                            </p>
                            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
                                <p className="text-red-800 font-semibold text-center">
                                    ⚠️ PERINGATAN: Tindakan ini tidak dapat dibatalkan!
                                </p>
                            </div>
                            <button
                                onClick={resetVoting}
                                disabled={saving || session?.isActive}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg font-bold text-lg transition-all"
                            >
                                {saving ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Mereset...
                                    </div>
                                ) : (
                                    '🗑️ Reset Data Voting'
                                )}
                            </button>
                            {session?.isActive && (
                                <p className="text-red-600 font-semibold text-lg mt-3 bg-red-100 p-3 rounded-lg">
                                    ⚠️ Nonaktifkan voting terlebih dahulu untuk mereset data
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <Settings className="h-7 w-7 mr-3 text-gray-600" />
                        Informasi Sistem
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <p className="text-gray-600 font-medium mb-2">Versi Sistem:</p>
                            <p className="text-2xl font-bold text-blue-600">E-Vote v1.0</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <p className="text-gray-600 font-medium mb-2">Database:</p>
                            <p className="text-2xl font-bold text-green-600">SQLite</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <p className="text-gray-600 font-medium mb-2">Waktu Server:</p>
                            <p className="text-lg font-bold text-purple-600">{new Date().toLocaleString('id-ID')}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <p className="text-gray-600 font-medium mb-2">Event Pemilihan:</p>
                            <p className="text-lg font-bold text-orange-600">Ketua OSIS SMK N 2 Malinau 2025</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}