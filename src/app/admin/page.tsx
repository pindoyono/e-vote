'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

interface User {
    id: string
    username: string
    role: string
}

interface Voter {
    id: string
    studentId: string
    name: string
    class: string
    hasVoted: boolean
    voteToken: string | null
    tokenUsed: boolean
    createdAt: string
}

interface Candidate {
    id: string
    name: string
    class: string
    vision: string
    mission: string
    orderNumber: number
    _count: {
        votes: number
    }
}

export default function AdminPage() {
    const [user, setUser] = useState<User | null>(null)
    const [voters, setVoters] = useState<Voter[]>([])
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (!userData) {
            router.push('/login')
            return
        }

        const parsedUser = JSON.parse(userData)
        if (parsedUser.role !== 'ADMIN') {
            router.push('/login')
            return
        }

        setUser(parsedUser)
        fetchData()
    }, [router])

    const fetchData = async () => {
        try {
            const [votersRes, candidatesRes] = await Promise.all([
                fetch('/api/voters'),
                fetch('/api/candidates')
            ])

            if (votersRes.ok) {
                const votersData = await votersRes.json()
                setVoters(votersData)
            }

            if (candidatesRes.ok) {
                const candidatesData = await candidatesRes.json()
                setCandidates(candidatesData)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            localStorage.removeItem('user')
            router.push('/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Admin Panel - E-Vote OSIS
                            </h1>
                            <p className="text-gray-600">SMK N 2 MALINAU</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Welcome, {user.username}
                            </span>
                            <Button variant="secondary" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">Total Pemilih</h3>
                                <p className="text-3xl font-bold text-blue-600">{voters.length}</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">Sudah Memilih</h3>
                                <p className="text-3xl font-bold text-green-600">
                                    {voters.filter(v => v.hasVoted).length}
                                </p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">Kandidat</h3>
                                <p className="text-3xl font-bold text-purple-600">{candidates.length}</p>
                            </div>
                        </Card>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Voters List */}
                        <Card title="Data Pemilih">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Daftar Pemilih</h4>
                                    <Button size="sm">+ Tambah Pemilih</Button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {voters.map((voter) => (
                                        <div key={voter.id} className="flex justify-between items-center py-2 border-b">
                                            <div>
                                                <p className="font-medium">{voter.name}</p>
                                                <p className="text-sm text-gray-600">{voter.studentId} - {voter.class}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${voter.hasVoted
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {voter.hasVoted ? 'Sudah Memilih' : 'Belum Memilih'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Candidates List */}
                        <Card title="Data Kandidat">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Daftar Kandidat</h4>
                                    <Button size="sm">+ Tambah Kandidat</Button>
                                </div>
                                <div className="space-y-4">
                                    {candidates.map((candidate) => (
                                        <div key={candidate.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-medium">
                                                        {candidate.orderNumber}. {candidate.name}
                                                    </h5>
                                                    <p className="text-sm text-gray-600">{candidate.class}</p>
                                                    <p className="text-sm mt-1">{candidate.vision}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {candidate._count.votes}
                                                    </p>
                                                    <p className="text-xs text-gray-600">suara</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8">
                        <Card title="Aksi Cepat">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Button className="w-full" onClick={() => router.push('/admin/voters')}>
                                    Kelola Pemilih
                                </Button>
                                <Button className="w-full" onClick={() => router.push('/admin/candidates')}>
                                    Kelola Kandidat
                                </Button>
                                <Button className="w-full" onClick={() => router.push('/admin/dashboard')}>
                                    Dashboard Real-time
                                </Button>
                                <Button className="w-full" onClick={() => router.push('/admin/reports')}>
                                    Laporan
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}