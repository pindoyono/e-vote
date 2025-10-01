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

export default function CommitteePage() {
    const [user, setUser] = useState<User | null>(null)
    const [voters, setVoters] = useState<Voter[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [generatingToken, setGeneratingToken] = useState<string | null>(null)
    const [voteUrl, setVoteUrl] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
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

        setUser(parsedUser)
        fetchVoters()
    }, [router])

    const fetchVoters = async () => {
        try {
            const response = await fetch('/api/voters')
            if (response.ok) {
                const data = await response.json()
                setVoters(data)
            }
        } catch (error) {
            console.error('Error fetching voters:', error)
        } finally {
            setLoading(false)
        }
    }

    const generateVoteToken = async (voterId: string) => {
        setGeneratingToken(voterId)
        try {
            const response = await fetch(`/api/voters/${voterId}/generate-token`, {
                method: 'POST'
            })

            if (response.ok) {
                const data = await response.json()
                setVoteUrl(`${window.location.origin}${data.voteUrl}`)
                fetchVoters() // Refresh data
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to generate vote token')
            }
        } catch (error) {
            console.error('Error generating token:', error)
            alert('Network error. Please try again.')
        } finally {
            setGeneratingToken(null)
        }
    }

    const copyToClipboard = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url)
            alert('URL berhasil disalin ke clipboard!')
        } catch (error) {
            console.error('Failed to copy:', error)
            alert('Gagal menyalin URL')
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

    const filteredVoters = voters.filter(voter =>
        voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.studentId.includes(searchTerm) ||
        voter.class.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                                Panel Panitia - E-Vote OSIS
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

                    {/* Statistics */}
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
                                <h3 className="text-lg font-medium text-gray-900">Belum Memilih</h3>
                                <p className="text-3xl font-bold text-orange-600">
                                    {voters.filter(v => !v.hasVoted).length}
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Voter Verification */}
                    <Card title="Verifikasi Pemilih">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium">Cari dan Verifikasi Pemilih</h4>
                                <Button size="sm" onClick={() => router.push('/committee/dashboard')}>
                                    Dashboard Real-time
                                </Button>
                            </div>

                            <Input
                                placeholder="Cari berdasarkan nama, NIS, atau kelas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <div className="max-h-96 overflow-y-auto space-y-3">
                                {filteredVoters.map((voter) => (
                                    <div key={voter.id} className="flex justify-between items-center p-4 border rounded-lg bg-white">
                                        <div>
                                            <h5 className="font-medium">{voter.name}</h5>
                                            <p className="text-sm text-gray-600">
                                                NIS: {voter.studentId} | Kelas: {voter.class}
                                            </p>
                                            <div className="flex items-center mt-1">
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${voter.hasVoted
                                                        ? 'bg-green-100 text-green-800'
                                                        : voter.voteToken && !voter.tokenUsed
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {voter.hasVoted
                                                        ? 'Sudah Memilih'
                                                        : voter.voteToken && !voter.tokenUsed
                                                            ? 'Token Dibuat'
                                                            : 'Belum Memilih'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            {!voter.hasVoted && !voter.voteToken && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => generateVoteToken(voter.id)}
                                                    disabled={generatingToken === voter.id}
                                                >
                                                    {generatingToken === voter.id ? 'Generating...' : 'Generate URL Vote'}
                                                </Button>
                                            )}
                                            {voter.voteToken && !voter.tokenUsed && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => copyToClipboard(`${window.location.origin}/vote/${voter.voteToken}`)}
                                                >
                                                    Copy URL Vote
                                                </Button>
                                            )}
                                            {voter.hasVoted && (
                                                <span className="text-sm text-green-600 font-medium">
                                                    ✓ Voting Complete
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {filteredVoters.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        {searchTerm ? 'Tidak ada pemilih yang ditemukan' : 'Tidak ada data pemilih'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Generated Vote URL Modal */}
                    {voteUrl && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                <h3 className="text-lg font-bold mb-4">URL Voting Berhasil Dibuat</h3>
                                <div className="bg-gray-100 p-3 rounded-lg mb-4">
                                    <p className="text-sm break-all">{voteUrl}</p>
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        className="flex-1"
                                        onClick={() => copyToClipboard(voteUrl)}
                                    >
                                        Copy URL
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        variant="secondary"
                                        onClick={() => setVoteUrl(null)}
                                    >
                                        Tutup
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}