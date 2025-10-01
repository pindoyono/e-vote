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

export default function CommitteeDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [autoRefresh, setAutoRefresh] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check if user is committee
        const userData = localStorage.getItem('user')
        if (!userData) {
            router.push('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        if (parsedUser.role !== 'COMMITTEE') {
            router.push('/login')
            return
        }

        fetchStats()

        let interval: NodeJS.Timeout
        if (autoRefresh) {
            interval = setInterval(fetchStats, 3000) // Refresh every 3 seconds
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [autoRefresh, router])

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
                                Dashboard Monitoring
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
                            <Button variant="secondary" onClick={() => router.push('/committee')}>
                                Kembali
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <div className="text-center">
                                <h3 className="text-sm font-medium text-gray-900">Total Pemilih</h3>
                                <p className="text-2xl font-bold text-blue-600">{stats.totalVoters}</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h3 className="text-sm font-medium text-gray-900">Sudah Memilih</h3>
                                <p className="text-2xl font-bold text-green-600">{stats.votersWhoVoted}</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h3 className="text-sm font-medium text-gray-900">Belum Memilih</h3>
                                <p className="text-2xl font-bold text-orange-600">
                                    {stats.totalVoters - stats.votersWhoVoted}
                                </p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h3 className="text-sm font-medium text-gray-900">Progress</h3>
                                <p className="text-2xl font-bold text-purple-600">{stats.votingProgress}%</p>
                            </div>
                        </Card>
                    </div>

                    {/* Real-time Results */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {stats.candidates.map((candidate, index) => (
                            <Card key={candidate.id}>
                                <div className="text-center">
                                    <div className="text-4xl mb-2">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {candidate.orderNumber}. {candidate.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">{candidate.class}</p>

                                    <div className="space-y-2">
                                        <div className="text-3xl font-bold text-blue-600">
                                            {candidate.voteCount}
                                        </div>
                                        <div className="text-lg font-semibold text-gray-700">
                                            {candidate.percentage}%
                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-1000 ${index === 0 ? 'bg-green-500' :
                                                        index === 1 ? 'bg-blue-500' :
                                                            'bg-purple-500'
                                                    }`}
                                                style={{ width: `${candidate.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Overall Progress */}
                    <Card className="mb-8">
                        <h3 className="text-lg font-bold mb-4">Progress Keseluruhan</h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Partisipasi Pemilih</span>
                            <span className="text-sm font-medium">{stats.votingProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-6">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-green-500 h-6 rounded-full transition-all duration-1000 flex items-center justify-center"
                                style={{ width: `${stats.votingProgress}%` }}
                            >
                                {stats.votingProgress > 10 && (
                                    <span className="text-white text-xs font-bold">
                                        {stats.votersWhoVoted}/{stats.totalVoters}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Recent Activity Feed */}
                    <Card title="Feed Aktivitas Real-time">
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {stats.recentVotes.map((vote) => (
                                <div key={vote.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-l-4 border-blue-500">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-2xl">🗳️</div>
                                        <div>
                                            <p className="font-medium text-gray-900">{vote.voterName}</p>
                                            <p className="text-sm text-gray-600">{vote.voterClass}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-blue-600">
                                            → Kandidat {vote.candidateNumber}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(vote.createdAt).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {stats.recentVotes.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-4xl mb-2">⏳</div>
                                    <p>Menunggu aktivitas voting...</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Status Indicator */}
                    <div className="fixed bottom-4 right-4">
                        <div className="bg-white rounded-full shadow-lg p-4 border-2 border-green-500">
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                <span className="text-sm font-medium">
                                    {autoRefresh ? 'Live Monitoring' : 'Paused'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}