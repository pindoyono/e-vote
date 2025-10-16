'use client'

import { useState, useEffect } from 'react'
import { Trash2, RefreshCw, AlertTriangle, User, RotateCcw } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

interface Voter {
    id: string
    name: string
    nisn: string
    class: string
    hasVoted: boolean
    votes?: Array<{
        candidate: {
            name: string
            orderNumber: number
        }
    }>
}

interface Candidate {
    id: string
    name: string
    candidateNumber: number
}

interface VotingStats {
    totalVoters: number
    totalVoted: number
    totalNotVoted: number
    votesByCandidate: Array<{
        candidateId: string
        candidateName: string
        candidateNumber: number
        voteCount: number
    }>
}

export default function VoteManagementPage() {
    const [voters, setVoters] = useState<Voter[]>([])
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [stats, setStats] = useState<VotingStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [resetLoading, setResetLoading] = useState(false)
    const [selectedVoter, setSelectedVoter] = useState<string | null>(null)
    const [showConfirmResetAll, setShowConfirmResetAll] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [votersRes, candidatesRes, statsRes] = await Promise.all([
                fetch('/api/admin/voters'),
                fetch('/api/admin/candidates'),
                fetch('/api/admin/voting-stats')
            ])

            if (!votersRes.ok || !candidatesRes.ok || !statsRes.ok) {
                throw new Error('Failed to fetch data')
            }

            const votersData = await votersRes.json()
            const candidatesData = await candidatesRes.json()
            const statsData = await statsRes.json()

            setVoters(votersData.voters || [])
            setCandidates(candidatesData.candidates || [])
            setStats(statsData)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching data:', error)
            alert('Gagal memuat data. Silakan refresh halaman.')
            setLoading(false)
        }
    }

    const handleResetAllVotes = async () => {
        if (!showConfirmResetAll) {
            setShowConfirmResetAll(true)
            return
        }

        setResetLoading(true)
        try {
            const response = await fetch('/api/admin/votes/reset', {
                method: 'DELETE'
            })

            if (response.ok) {
                await fetchData()
                alert('Semua vote berhasil direset!')
            } else {
                const error = await response.json()
                alert('Error: ' + error.message)
            }
        } catch (error) {
            alert('Terjadi kesalahan saat reset vote')
        } finally {
            setResetLoading(false)
            setShowConfirmResetAll(false)
        }
    }

    const handleResetVoterVote = async (voterId: string, voterName: string) => {
        if (!confirm(`Yakin ingin reset vote untuk ${voterName}?`)) {
            return
        }

        setSelectedVoter(voterId)
        try {
            const response = await fetch(`/api/admin/votes/reset/${voterId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                await fetchData()
                alert(`Vote untuk ${voterName} berhasil direset!`)
            } else {
                const error = await response.json()
                alert('Error: ' + error.message)
            }
        } catch (error) {
            alert('Terjadi kesalahan saat reset vote')
        } finally {
            setSelectedVoter(null)
        }
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-gray-600">Memuat data...</p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    const votedVoters = voters.filter(voter => voter.hasVoted)
    const notVotedVoters = voters.filter(voter => !voter.hasVoted)

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Manajemen Vote
                    </h1>
                    <p className="text-gray-600">
                        Kelola dan reset vote pemilih
                    </p>
                </div>

                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <User className="w-8 h-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Pemilih</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalVoters}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Sudah Vote</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.totalVoted}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Belum Vote</p>
                                    <p className="text-2xl font-bold text-orange-600">{stats.totalNotVoted}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Tingkat Partisipasi</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {stats.totalVoters > 0 ? Math.round((stats.totalVoted / stats.totalVoters) * 100) : 0}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reset All Votes Section */}
                <div className="bg-white rounded-lg shadow mb-8 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Reset Semua Vote
                            </h2>
                            <p className="text-gray-600">
                                Hapus semua vote yang sudah masuk dan reset status pemilih
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            {showConfirmResetAll && (
                                <button
                                    onClick={() => setShowConfirmResetAll(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                            )}
                            <button
                                onClick={handleResetAllVotes}
                                disabled={resetLoading || votedVoters.length === 0}
                                className={`px-6 py-2 rounded-md flex items-center space-x-2 ${showConfirmResetAll
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-300'
                                    }`}
                            >
                                {resetLoading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Mereset...</span>
                                    </>
                                ) : showConfirmResetAll ? (
                                    <>
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>Konfirmasi Reset</span>
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw className="w-4 h-4" />
                                        <span>Reset Semua Vote</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    {showConfirmResetAll && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                                <p className="text-red-800 font-medium">
                                    PERINGATAN: Aksi ini akan menghapus semua {votedVoters.length} vote yang sudah masuk dan tidak dapat dibatalkan!
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Voted Users Section */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Pemilih yang Sudah Vote ({votedVoters.length})
                        </h2>
                    </div>
                    <div className="p-6">
                        {votedVoters.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                Belum ada pemilih yang vote
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {votedVoters.map((voter) => (
                                    <div key={voter.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{voter.name}</p>
                                                    <p className="text-sm text-gray-500">{voter.nisn} - {voter.class}</p>
                                                </div>
                                                {voter.votes && voter.votes.length > 0 && (
                                                    <div className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                                                        Vote: {voter.votes[0].candidate.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleResetVoterVote(voter.id, voter.name)}
                                            disabled={selectedVoter === voter.id}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 flex items-center space-x-2"
                                        >
                                            {selectedVoter === voter.id ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    <span>Reset...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Reset Vote</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Not Voted Users Section */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Pemilih yang Belum Vote ({notVotedVoters.length})
                        </h2>
                    </div>
                    <div className="p-6">
                        {notVotedVoters.length === 0 ? (
                            <p className="text-green-600 text-center py-8 font-medium">
                                Semua pemilih sudah vote! 🎉
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {notVotedVoters.map((voter) => (
                                    <div key={voter.id} className="p-4 border border-gray-200 rounded-lg">
                                        <p className="font-medium text-gray-900">{voter.name}</p>
                                        <p className="text-sm text-gray-500">{voter.nisn} - {voter.class}</p>
                                        <div className="mt-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                Belum Vote
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}