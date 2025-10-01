'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

interface DashboardStats {
    totalVoters: number
    votersWhoVoted: number
    totalVotes: number
    votingProgress: number
    candidates: Array<{
        id: string
        name: string
        class: string
        orderNumber: number
        voteCount: number
        percentage: number
    }>
    recentVotes: Array<{
        id: string
        voterName: string
        voterClass: string
        candidateName: string
        candidateNumber: number
        createdAt: string
    }>
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [autoRefresh, setAutoRefresh] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchStats()

        let interval: NodeJS.Timeout
        if (autoRefresh) {
            interval = setInterval(fetchStats, 5000) // Refresh every 5 seconds
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [autoRefresh])

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/dashboard/stats')
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (!stats) {
        return <div>Error loading dashboard</div>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Dashboard Real-time
                            </h1>
                            <p className="text-gray-600">Pemilihan Ketua OSIS SMK N 2 MALINAU</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm">Auto Refresh</span>
                            </label>
                            <Button variant="secondary" onClick={() => router.back()}>
                                Kembali
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">

                    {/* Statistics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">Total Pemilih</h3>
                                <p className="text-3xl font-bold text-blue-600">{stats.totalVoters}</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">Sudah Memilih</h3>
                                <p className="text-3xl font-bold text-green-600">{stats.votersWhoVoted}</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">Total Vote</h3>
                                <p className="text-3xl font-bold text-purple-600">{stats.totalVotes}</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">Progress</h3>
                                <p className="text-3xl font-bold text-orange-600">{stats.votingProgress}%</p>
                            </div>
                        </Card>
                    </div>

                    {/* Progress Bar */}
                    <Card className="mb-8">
                        <h3 className="text-lg font-bold mb-4">Progress Pemilihan</h3>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${stats.votingProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            {stats.votersWhoVoted} dari {stats.totalVoters} pemilih telah memberikan suara
                        </p>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Voting Results */}
                        <Card title="Hasil Sementara">
                            <div className="space-y-6">
                                {stats.candidates.map((candidate, index) => (
                                    <div key={candidate.id} className="border-b pb-4 last:border-b-0">
                                        <div className="flex justify-between items-center mb-2">
                                            <div>
                                                <h4 className="font-bold text-lg">
                                                    {candidate.orderNumber}. {candidate.name}
                                                </h4>
                                                <p className="text-sm text-gray-600">{candidate.class}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {candidate.voteCount}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {candidate.percentage}%
                                                </p>
                                            </div>
                                        </div>

                                        {/* Vote Bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-500 ${index === 0 ? 'bg-green-500' :
                                                        index === 1 ? 'bg-blue-500' :
                                                            'bg-purple-500'
                                                    }`}
                                                style={{ width: `${candidate.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}

                                {stats.totalVotes === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        Belum ada vote yang masuk
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Recent Activity */}
                        <Card title="Aktivitas Terbaru">
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {stats.recentVotes.map((vote) => (
                                    <div key={vote.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{vote.voterName}</p>
                                            <p className="text-sm text-gray-600">{vote.voterClass}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">→ Kandidat {vote.candidateNumber}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(vote.createdAt).toLocaleTimeString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {stats.recentVotes.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        Belum ada aktivitas voting
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Live Indicator */}
                    <div className="fixed bottom-4 right-4">
                        <div className="bg-white rounded-lg shadow-lg p-3 flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className="text-sm font-medium">
                                {autoRefresh ? 'Live' : 'Paused'}
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}