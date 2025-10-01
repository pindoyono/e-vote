'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Card } from '@/components/Card'

interface User {
    id: string
    username: string
    role: string
}

interface Candidate {
    id: string
    name: string
    class: string
    vision: string
    mission: string
    photo?: string
    orderNumber: number
    _count: {
        votes: number
    }
    createdAt: string
}

export default function AdminCandidatesPage() {
    const [user, setUser] = useState<User | null>(null)
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newCandidate, setNewCandidate] = useState({
        name: '',
        class: '',
        vision: '',
        mission: '',
        orderNumber: 1,
        photo: ''
    })
    const [adding, setAdding] = useState(false)
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
        fetchCandidates()
    }, [router])

    const fetchCandidates = async () => {
        try {
            const response = await fetch('/api/candidates')
            if (response.ok) {
                const data = await response.json()
                setCandidates(data)
                // Set next order number
                const maxOrder = Math.max(...data.map((c: Candidate) => c.orderNumber), 0)
                setNewCandidate(prev => ({ ...prev, orderNumber: maxOrder + 1 }))
            }
        } catch (error) {
            console.error('Error fetching candidates:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddCandidate = async (e: React.FormEvent) => {
        e.preventDefault()
        setAdding(true)

        try {
            const response = await fetch('/api/candidates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newCandidate)
            })

            if (response.ok) {
                const candidate = await response.json()
                setCandidates([...candidates, { ...candidate, _count: { votes: 0 } }])
                setNewCandidate({
                    name: '',
                    class: '',
                    vision: '',
                    mission: '',
                    orderNumber: newCandidate.orderNumber + 1,
                    photo: ''
                })
                setShowAddForm(false)
                alert('Kandidat berhasil ditambahkan!')
            } else {
                const errorData = await response.json()
                alert(errorData.error || 'Gagal menambahkan kandidat')
            }
        } catch {
            alert('Network error. Please try again.')
        } finally {
            setAdding(false)
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

    const getTotalVotes = () => {
        return candidates.reduce((total, candidate) => total + candidate._count.votes, 0)
    }

    const getPercentage = (votes: number) => {
        const total = getTotalVotes()
        return total > 0 ? Math.round((votes / total) * 100 * 100) / 100 : 0
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
                                Kelola Data Kandidat
                            </h1>
                            <p className="text-gray-600">SMK N 2 MALINAU</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Welcome, {user.username}
                            </span>
                            <Button variant="secondary" onClick={() => router.push('/admin')}>
                                Kembali ke Admin
                            </Button>
                            <Button variant="secondary" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">Total Kandidat</h3>
                                <p className="text-3xl font-bold text-blue-600">{candidates.length}</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">Total Vote Masuk</h3>
                                <p className="text-3xl font-bold text-green-600">{getTotalVotes()}</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">Kandidat Terdepan</h3>
                                <p className="text-2xl font-bold text-purple-600">
                                    {candidates.length > 0
                                        ? candidates.sort((a, b) => b._count.votes - a._count.votes)[0]?.orderNumber || '-'
                                        : '-'
                                    }
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Actions */}
                    <Card className="mb-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Manajemen Kandidat</h3>
                            <Button onClick={() => setShowAddForm(true)}>
                                + Tambah Kandidat
                            </Button>
                        </div>
                    </Card>

                    {/* Add Candidate Form */}
                    {showAddForm && (
                        <Card className="mb-8">
                            <h3 className="text-lg font-bold mb-4">Tambah Kandidat Baru</h3>
                            <form onSubmit={handleAddCandidate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Nomor Urut"
                                        type="number"
                                        value={newCandidate.orderNumber}
                                        onChange={(e) => setNewCandidate({ ...newCandidate, orderNumber: parseInt(e.target.value) })}
                                        required
                                        disabled={adding}
                                    />
                                    <Input
                                        label="Nama Lengkap"
                                        value={newCandidate.name}
                                        onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                                        required
                                        disabled={adding}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Kelas"
                                        value={newCandidate.class}
                                        onChange={(e) => setNewCandidate({ ...newCandidate, class: e.target.value })}
                                        required
                                        disabled={adding}
                                    />
                                    <Input
                                        label="URL Foto (Opsional)"
                                        value={newCandidate.photo}
                                        onChange={(e) => setNewCandidate({ ...newCandidate, photo: e.target.value })}
                                        disabled={adding}
                                        placeholder="https://example.com/photo.jpg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Visi
                                    </label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        value={newCandidate.vision}
                                        onChange={(e) => setNewCandidate({ ...newCandidate, vision: e.target.value })}
                                        required
                                        disabled={adding}
                                        placeholder="Tuliskan visi kandidat..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Misi
                                    </label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={4}
                                        value={newCandidate.mission}
                                        onChange={(e) => setNewCandidate({ ...newCandidate, mission: e.target.value })}
                                        required
                                        disabled={adding}
                                        placeholder="Tuliskan misi kandidat..."
                                    />
                                </div>

                                <div className="flex space-x-2">
                                    <Button type="submit" disabled={adding}>
                                        {adding ? 'Menambahkan...' : 'Tambah Kandidat'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowAddForm(false)}
                                        disabled={adding}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {/* Candidates List */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {candidates.map((candidate) => (
                            <Card key={candidate.id} className="h-full">
                                <div className="flex flex-col h-full">
                                    {/* Candidate Header */}
                                    <div className="text-center mb-4">
                                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                                            {candidate.photo ? (
                                                <img
                                                    src={candidate.photo}
                                                    alt={candidate.name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-4xl text-gray-400">👤</span>
                                            )}
                                        </div>
                                        <div className="text-2xl font-bold text-blue-600 mb-2">
                                            {candidate.orderNumber}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {candidate.name}
                                        </h3>
                                        <p className="text-gray-600">{candidate.class}</p>
                                    </div>

                                    {/* Vote Stats */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-600">
                                                {candidate._count.votes}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {getPercentage(candidate._count.votes)}% dari total suara
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${getPercentage(candidate._count.votes)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vision & Mission */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">VISI:</h4>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {candidate.vision}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">MISI:</h4>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {candidate.mission}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-6 pt-4 border-t">
                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="secondary" className="flex-1">
                                                Edit
                                            </Button>
                                            <Button size="sm" variant="danger" className="flex-1">
                                                Hapus
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {candidates.length === 0 && (
                        <Card>
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🗳️</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Belum Ada Kandidat
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Tambahkan kandidat untuk memulai pemilihan
                                </p>
                                <Button onClick={() => setShowAddForm(true)}>
                                    + Tambah Kandidat Pertama
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    )
}