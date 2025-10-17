'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Monitor, Users, Vote, TrendingUp, RefreshCw } from 'lucide-react'

interface RealtimeStats {
    totalVoters: number
    verifiedVoters: number
    totalVotes: number
    participationRate: number
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
        candidateName: string
        timestamp: string
        voterClass: string
    }>
    hourlyData: Array<{
        hour: string
        votes: number
    }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function MonitoringPage() {
    const [stats, setStats] = useState<RealtimeStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
    const [autoRefresh, setAutoRefresh] = useState(true)

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/monitoring/realtime')
            const data = await response.json()
            setStats(data)
            setLastUpdate(new Date())
        } catch (error) {
            console.error('Error fetching realtime stats:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()

        let interval: NodeJS.Timeout
        if (autoRefresh) {
            interval = setInterval(fetchStats, 5000) // Update every 5 seconds
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [autoRefresh])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Memuat monitoring realtime...</p>
                </div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-red-400">
                    <p>Error loading monitoring data</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center">
                        <Monitor className="h-8 w-8 mr-3 text-blue-400" />
                        Monitoring Realtime
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Pemilihan Ketua OSIS SMK N 2 Malinau 2025
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Last Update:</p>
                        <p className="text-white font-medium">
                            {lastUpdate.toLocaleTimeString('id-ID')}
                        </p>
                    </div>
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${autoRefresh
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-600 hover:bg-gray-700'
                            }`}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                        {autoRefresh ? 'Auto Refresh' : 'Manual'}
                    </button>
                    <button
                        onClick={fetchStats}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Refresh Now
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Pemilih</p>
                            <p className="text-3xl font-bold text-white">{stats.totalVoters}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-400" />
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Terverifikasi</p>
                            <p className="text-3xl font-bold text-green-400">{stats.verifiedVoters}</p>
                        </div>
                        <Users className="h-8 w-8 text-green-400" />
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Suara</p>
                            <p className="text-3xl font-bold text-yellow-400">{stats.totalVotes}</p>
                        </div>
                        <Vote className="h-8 w-8 text-yellow-400" />
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Partisipasi</p>
                            <p className="text-3xl font-bold text-purple-400">
                                {stats.participationRate.toFixed(1)}%
                            </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-400" />
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Bar Chart */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold mb-6">Perolehan Suara</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.candidates}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="orderNumber"
                                stroke="#9CA3AF"
                                tickFormatter={(value) => `Kandidat ${value}`}
                            />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                                formatter={(value, name, props) => [
                                    `${value} suara`,
                                    props.payload.name
                                ]}
                            />
                            <Bar dataKey="voteCount" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold mb-6">Distribusi Suara</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats.candidates}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="voteCount"
                                label={({ name, percentage }: { name?: string; percentage?: number }) =>
                                    name && percentage ? `${name.split(' ')[0]} (${percentage.toFixed(1)}%)` : ''
                                }
                            >
                                {stats.candidates.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Votes and Hourly Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Votes */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold mb-6">Suara Terbaru</h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                        {stats.recentVotes.length > 0 ? (
                            stats.recentVotes.map((vote, index) => (
                                <div key={vote.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                    <div>
                                        <p className="font-medium text-white">{vote.candidateName}</p>
                                        <p className="text-sm text-gray-400">Kelas: {vote.voterClass}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">
                                            {new Date(vote.timestamp).toLocaleTimeString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-8">
                                <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Belum ada suara masuk</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hourly Trend */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold mb-6">Tren Per Jam</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={stats.hourlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="hour" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="votes" fill="#10B981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Candidate Details */}
            <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-6">Detail Kandidat</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.candidates.map((candidate, index) => (
                        <div key={candidate.id} className="bg-gray-700 rounded-lg p-4">
                            <div className="text-center mb-4">
                                <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold`}
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                                    {candidate.orderNumber}
                                </div>
                                <h4 className="font-semibold text-white">{candidate.name}</h4>
                                <p className="text-sm text-gray-400">{candidate.class}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white mb-2">
                                    {candidate.voteCount}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {candidate.percentage.toFixed(1)}% dari total suara
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}