'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Vote, CheckCircle } from 'lucide-react'

interface Candidate {
    id: string
    name: string
    class: string
    vision: string
    mission: string
    orderNumber: number
    photo?: string
}

interface VoterInfo {
    id: string
    name: string
    class: string
    hasVoted: boolean
}

export default function VotingPage() {
    const params = useParams()
    const router = useRouter()
    const [voter, setVoter] = useState<VoterInfo | null>(null)
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const voteToken = params.token as string

    useEffect(() => {
        const fetchVotingData = async () => {
            try {
                const response = await fetch(`/api/vote/${voteToken}`)

                if (!response.ok) {
                    throw new Error('Token tidak valid atau sudah kadaluarsa')
                }

                const data = await response.json()
                setVoter(data.voter)
                setCandidates(data.candidates)

                if (data.voter.hasVoted) {
                    // Redirect to thank you page if already voted
                    router.push(`/vote/${voteToken}/thank-you`)
                    return
                }
            } catch (error) {
                console.error('Error fetching voting data:', error)
                setError('Token tidak valid atau terjadi kesalahan')
            } finally {
                setLoading(false)
            }
        }

        if (voteToken) {
            fetchVotingData()
        }
    }, [voteToken, router])

    const handleVote = async () => {
        if (!selectedCandidate) {
            alert('Silakan pilih kandidat terlebih dahulu')
            return
        }

        if (!confirm('Apakah Anda yakin dengan pilihan ini? Pilihan tidak dapat diubah.')) {
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/vote/${voteToken}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    candidateId: selectedCandidate,
                }),
            })

            if (response.ok) {
                router.push(`/vote/${voteToken}/thank-you`)
            } else {
                const error = await response.json()
                alert(error.message || 'Terjadi kesalahan saat menyimpan suara')
            }
        } catch (error) {
            console.error('Vote submission error:', error)
            alert('Terjadi kesalahan saat menyimpan suara')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Memuat data voting...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="bg-white rounded-lg p-8 max-w-md">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                        <p className="text-gray-700 mb-4">{error}</p>
                        <p className="text-sm text-gray-500">
                            Silakan hubungi panitia jika masalah berlanjut.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 pt-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        E-VOTE PEMILIHAN KETUA OSIS
                    </h1>
                    <h2 className="text-2xl font-semibold text-blue-200 mb-4">
                        SMK NEGERI 2 MALINAU
                    </h2>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
                        <p className="text-blue-100">
                            <span className="font-semibold">Pemilih:</span> {voter?.name}
                        </p>
                        <p className="text-blue-100">
                            <span className="font-semibold">Kelas:</span> {voter?.class}
                        </p>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Petunjuk Voting:</h3>
                    <ol className="list-decimal list-inside text-blue-100 space-y-2">
                        <li>Baca dengan teliti profil setiap kandidat</li>
                        <li>Pilih salah satu kandidat dengan mengklik tombol "PILIH"</li>
                        <li>Konfirmasi pilihan Anda</li>
                        <li>Pilihan tidak dapat diubah setelah dikonfirmasi</li>
                    </ol>
                </div>

                {/* Candidates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8 max-w-7xl mx-auto">
                    {candidates.map((candidate) => (
                        <div
                            key={candidate.id}
                            className={`bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-102 ${selectedCandidate === candidate.id
                                ? 'ring-4 ring-yellow-400 scale-102'
                                : ''
                                }`}
                        >
                            {/* Candidate Photo */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center" style={{ aspectRatio: '904/1280' }}>
                                {candidate.photo ? (
                                    <img
                                        src={candidate.photo}
                                        alt={`Kandidat ${candidate.orderNumber}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-8xl font-bold text-gray-500">
                                        {candidate.orderNumber}
                                    </div>
                                )}
                                {/* Candidate Number Badge */}
                                <div className="absolute top-4 left-4 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-2xl shadow-lg">
                                    {candidate.orderNumber}
                                </div>
                            </div>

                            <div className="p-4">
                                <button
                                    onClick={() => setSelectedCandidate(candidate.id)}
                                    className={`w-full py-4 px-6 rounded-lg font-semibold text-xl transition-all duration-200 ${selectedCandidate === candidate.id
                                        ? 'bg-yellow-500 text-yellow-900 shadow-lg'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    {selectedCandidate === candidate.id ? (
                                        <span className="flex items-center justify-center">
                                            <CheckCircle className="h-6 w-6 mr-2" />
                                            TERPILIH
                                        </span>
                                    ) : (
                                        'PILIH'
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                {selectedCandidate && (
                    <div className="text-center">
                        <button
                            onClick={handleVote}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Menyimpan Suara...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <Vote className="h-5 w-5 mr-2" />
                                    SUBMIT SUARA
                                </span>
                            )}
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center mt-12 pb-8">
                    <p className="text-blue-200 text-sm">
                        © 2025 SMK Negeri 2 Malinau - Sistem E-Voting
                    </p>
                </div>
            </div>
        </div>
    )
}