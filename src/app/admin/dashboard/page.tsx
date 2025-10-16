'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Users, Vote, UserCheck, Clock } from 'lucide-react'

interface DashboardStats {
    totalVoters: number
    totalVotes: number
    verifiedVoters: number
    unverifiedVoters: number
    candidates: Array<{
        id: string
        name: string
        class: string
        orderNumber: number
        voteCount: number
    }>
    isVotingActive: boolean
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/dashboard')
            const data = await response.json()
            setStats(data)
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
                </div>
            </AdminLayout>
        )
    }

    if (!stats) {
        return (
            <AdminLayout>
                <div className="text-center text-red-600">
                    Error loading dashboard data
                </div>
            </AdminLayout>
        )
    }

    const statCards = [
        {
            title: 'Total Pemilih',
            value: stats.totalVoters,
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            title: 'Terverifikasi',
            value: stats.verifiedVoters,
            icon: UserCheck,
            color: 'bg-green-500',
        },
        {
            title: 'Total Suara',
            value: stats.totalVotes,
            icon: Vote,
            color: 'bg-purple-500',
        },
        {
            title: 'Belum Verifikasi',
            value: stats.unverifiedVoters,
            icon: Clock,
            color: 'bg-orange-500',
        },
    ]

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${stats.isVotingActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {stats.isVotingActive ? 'Pemilihan Aktif' : 'Pemilihan Nonaktif'}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, index) => {
                        const Icon = card.icon
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                            >
                                <div className="flex items-center">
                                    <div className={`${card.color} rounded-lg p-3`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            {card.title}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {card.value}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Candidates Results */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Hasil Sementara Pemilihan
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {stats.candidates.map((candidate) => {
                                const percentage = stats.totalVotes > 0
                                    ? (candidate.voteCount / stats.totalVotes) * 100
                                    : 0

                                return (
                                    <div key={candidate.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    Kandidat {candidate.orderNumber}: {candidate.name}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {candidate.class}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {candidate.voteCount}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {percentage.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}