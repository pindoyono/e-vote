'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

interface Voter {
    name: string
    studentId: string
    class: string
}

interface Candidate {
    id: string
    name: string
    class: string
    vision: string
    mission: string
    orderNumber: number
    photo?: string
}

export default function VotePage() {
    const params = useParams()
    const router = useRouter()
    const token = params.token as string

    const [voter, setVoter] = useState<Voter | null>(null)
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (token) {
            verifyToken()
            fetchCandidates()
        }
    }, [token])

    const verifyToken = async () => {
        try {
            const response = await fetch(`/api/vote/verify/${token}`)
            const data = await response.json()

            if (response.ok) {
                setVoter(data.voter)
            } else {
                setError(data.error || 'Token tidak valid')
            }
        } catch (error) {
            setError('Network error. Please try again.')
        }
    }

    const fetchCandidates = async () => {
        try {
            const response = await fetch('/api/candidates')
            if (response.ok) {
                const data = await response.json()
                setCandidates(data)
            }
        } catch (error) {
            console.error('Error fetching candidates:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleVote = async () => {
        if (!selectedCandidate) {
            alert('Silakan pilih kandidat terlebih dahulu')
            return
        }

        setSubmitting(true)
        try {
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    voteToken: token,
                    candidateId: selectedCandidate
                })
            })

            const data = await response.json()

            if (response.ok) {
                // Redirect to thank you page
                router.push(`/vote/thank-you?candidate=${encodeURIComponent(data.candidate)}`)
            } else {
                setError(data.error || 'Failed to submit vote')
            }
        } catch (error) {
            setError('Network error. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat halaman voting...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={() => router.push('/')}>
                            Kembali ke Beranda
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    if (!voter) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        E-VOTE OSIS
                    </h1>
                    <h2 className="text-2xl font-semibold text-blue-600 mb-4">
                        SMK N 2 MALINAU
                    </h2>
                    <div className="bg-white rounded-lg shadow-md p-4 inline-block">
                        <p className="text-lg font-medium text-gray-900">Pemilih:</p>
                        <p className="text-xl font-bold text-blue-600">{voter.name}</p>
                        <p className="text-gray-600">{voter.studentId} - {voter.class}</p>
                    </div>
                </div>

                {/* Instructions */}
                <Card className="max-w-2xl mx-auto mb-8">
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Petunjuk Pemilihan
                        </h3>
                        <div className="text-left space-y-2 text-gray-700">
                            <p>1. Pilih salah satu kandidat dengan mengklik tombol &quot;PILIH&quot;</p>
                            <p>2. Pastikan pilihan Anda sudah benar</p>
                            <p>3. Klik tombol &quot;VOTE&quot; untuk mengonfirmasi pilihan</p>
                            <p>4. Anda hanya dapat memilih sekali</p>
                        </div>
                    </div>
                </Card>

                {/* Candidates */}
                <div className="max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
                        PILIH KANDIDAT KETUA OSIS
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {candidates.map((candidate) => (
                            <Card
                                key={candidate.id}
                                className={`cursor-pointer transition-all duration-200 transform hover:scale-105 ${selectedCandidate === candidate.id
                                    ? 'ring-4 ring-blue-500 bg-blue-50'
                                    : 'hover:shadow-lg'
                                    }`}
                                onClick={() => setSelectedCandidate(candidate.id)}
                            >
                                <div className="text-center">
                                    {/* Candidate Photo Placeholder */}
                                    <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                                        {candidate.photo ? (
                                            <img
                                                src={candidate.photo}
                                                alt={candidate.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-6xl text-gray-400">👤</span>
                                        )}
                                    </div>

                                    {/* Candidate Info */}
                                    <div className="mb-4">
                                        <div className="text-3xl font-bold text-blue-600 mb-2">
                                            {candidate.orderNumber}
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-1">
                                            {candidate.name}
                                        </h4>
                                        <p className="text-gray-600 mb-4">{candidate.class}</p>
                                    </div>

                                    {/* Vision & Mission */}
                                    <div className="text-left mb-6">
                                        <div className="mb-3">
                                            <h5 className="font-semibold text-gray-900 mb-1">VISI:</h5>
                                            <p className="text-sm text-gray-700">{candidate.vision}</p>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-gray-900 mb-1">MISI:</h5>
                                            <p className="text-sm text-gray-700">{candidate.mission}</p>
                                        </div>
                                    </div>

                                    {/* Select Button */}
                                    <Button
                                        variant={selectedCandidate === candidate.id ? 'primary' : 'secondary'}
                                        className="w-full"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedCandidate(candidate.id)
                                        }}
                                    >
                                        {selectedCandidate === candidate.id ? '✓ DIPILIH' : 'PILIH'}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Vote Button */}
                    <div className="text-center">
                        <Card className="max-w-md mx-auto">
                            {selectedCandidate ? (
                                <div>
                                    <p className="text-lg font-medium text-gray-900 mb-4">
                                        Kandidat yang dipilih:
                                    </p>
                                    <p className="text-xl font-bold text-blue-600 mb-6">
                                        {candidates.find(c => c.id === selectedCandidate)?.orderNumber}. {' '}
                                        {candidates.find(c => c.id === selectedCandidate)?.name}
                                    </p>
                                    <Button
                                        size="lg"
                                        className="w-full text-xl py-4"
                                        onClick={handleVote}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'MENGIRIM VOTE...' : '🗳️ VOTE SEKARANG'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <p className="text-lg mb-4">Silakan pilih kandidat terlebih dahulu</p>
                                    <Button size="lg" className="w-full" disabled>
                                        🗳️ VOTE SEKARANG
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-12 text-gray-600">
                    <p>Sistem Pemilihan Ketua OSIS SMK N 2 MALINAU</p>
                    <p className="text-sm">Pastikan pilihan Anda sudah benar sebelum voting</p>
                </div>
            </div>
        </div>
    )
}