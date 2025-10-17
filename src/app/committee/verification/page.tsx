'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CommitteeLayout from '@/components/CommitteeLayout'
import { Search, UserCheck, ExternalLink, Copy, LogOut, User } from 'lucide-react'

interface Voter {
    id: string
    name: string
    class: string
    nisn: string
    isVerified: boolean
    hasVoted: boolean
    voteToken?: string
}

export default function CommitteeVerificationPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [voters, setVoters] = useState<Voter[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [verifyingId, setVerifyingId] = useState<string | null>(null)
    const [verifyingAll, setVerifyingAll] = useState(false)

    // Redirect if not committee
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/committee/login')
        } else if (status === 'authenticated' && session?.user?.role !== 'committee') {
            router.push('/committee/login')
        }
    }, [status, session, router])

    const fetchUnverifiedVoters = async () => {
        try {
            const response = await fetch('/api/admin/voters/unverified')
            const data = await response.json()
            setVoters(data)
        } catch (error) {
            console.error('Error fetching voters:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session?.user?.role === 'committee') {
            fetchUnverifiedVoters()
        }
    }, [session])

    const verifyVoter = async (voterId: string) => {
        setVerifyingId(voterId)
        try {
            const response = await fetch(`/api/admin/voters/${voterId}/verify`, {
                method: 'POST',
            })

            if (response.ok) {
                const updatedVoter = await response.json()
                setVoters(voters.map(v => v.id === voterId ? updatedVoter : v))

                // Show the generated URL
                const voteToken = updatedVoter.voteToken
                const url = `${window.location.origin}/vote/${voteToken}`

                alert(`Pemilih berhasil diverifikasi!\n\nURL Voting:\n${url}\n\nURL telah disalin ke clipboard.`)

                try {
                    await navigator.clipboard.writeText(url)
                } catch (error) {
                    console.error('Copy error:', error)
                }

                // Refresh data
                fetchUnverifiedVoters()
            } else {
                alert('Gagal memverifikasi pemilih')
            }
        } catch (error) {
            console.error('Error verifying voter:', error)
            alert('Terjadi kesalahan')
        } finally {
            setVerifyingId(null)
        }
    }

    const copyToClipboard = async (voteToken: string) => {
        const url = `${window.location.origin}/vote/${voteToken}`
        try {
            await navigator.clipboard.writeText(url)
            alert('URL berhasil disalin!')
        } catch (error) {
            console.error('Copy error:', error)
        }
    }

    const verifyAllVoters = async () => {
        const unverifiedVoters = voters.filter(v => !v.isVerified)
        
        if (unverifiedVoters.length === 0) {
            alert('Semua pemilih sudah diverifikasi!')
            return
        }

        const confirmMessage = `Anda akan memverifikasi ${unverifiedVoters.length} pemilih sekaligus.\n\nApakah Anda yakin?`
        if (!confirm(confirmMessage)) {
            return
        }

        setVerifyingAll(true)
        
        try {
            let successCount = 0
            let failCount = 0

            // Verifikasi satu per satu
            for (const voter of unverifiedVoters) {
                try {
                    const response = await fetch(`/api/admin/voters/${voter.id}/verify`, {
                        method: 'POST',
                    })

                    if (response.ok) {
                        successCount++
                    } else {
                        failCount++
                    }
                } catch (error) {
                    failCount++
                    console.error(`Error verifying ${voter.name}:`, error)
                }
            }

            // Refresh data
            await fetchUnverifiedVoters()

            alert(`Verifikasi selesai!\n\nBerhasil: ${successCount}\nGagal: ${failCount}`)
        } catch (error) {
            console.error('Error in bulk verification:', error)
            alert('Terjadi kesalahan saat verifikasi massal')
        } finally {
            setVerifyingAll(false)
        }
    }

    const filteredVoters = voters.filter(voter =>
        voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.nisn.includes(searchTerm)
    )

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
            </div>
        )
    }

    if (status === 'unauthenticated' || session?.user?.role !== 'committee') {
        return null // Will redirect
    }

    return (
        <CommitteeLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Verifikasi Pemilih</h1>
                            <p className="text-gray-600 mt-1">
                                Selamat datang, <span className="font-semibold">{session.user.name}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600">
                                {filteredVoters.filter(v => !v.isVerified).length} pemilih belum diverifikasi
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                                Role: Panitia Verifikasi
                            </div>
                        </div>
                    </div>
                    
                    {/* Verify All Button */}
                    {voters.filter(v => !v.isVerified).length > 0 && (
                        <div className="pt-4 border-t border-gray-200">
                            <button
                                onClick={verifyAllVoters}
                                disabled={verifyingAll}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-6 rounded-lg flex items-center justify-center transition-colors font-semibold shadow-lg"
                            >
                                {verifyingAll ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Memverifikasi {voters.filter(v => !v.isVerified).length} pemilih...
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="h-5 w-5 mr-2" />
                                        Verifikasi Semua ({voters.filter(v => !v.isVerified).length} Pemilih)
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                Verifikasi semua pemilih yang belum terverifikasi sekaligus
                            </p>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">
                        Panduan Verifikasi Pemilih:
                    </h3>
                    <ol className="list-decimal list-inside text-sm text-green-800 space-y-1">
                        <li>Periksa identitas pemilih sesuai dengan data yang tertera</li>
                        <li>Pastikan nama, kelas, dan NISN sesuai dengan dokumen identitas</li>
                        <li>Klik tombol &quot;Verifikasi&quot; untuk mengonfirmasi data pemilih</li>
                        <li>Sistem akan menghasilkan URL unik untuk voting</li>
                        <li>Bagikan URL tersebut kepada pemilih yang sudah terverifikasi</li>
                    </ol>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-3">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Pencarian Data Pemilih
                        </label>
                        <p className="text-xs text-gray-600 mb-3">
                            Ketik nama lengkap, kelas, atau nomor NISN untuk mencari pemilih
                        </p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Contoh: Ahmad Fajar atau XI DKV A atau 1234567890"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 text-gray-900 font-medium"
                        />
                    </div>
                    {searchTerm && (
                        <div className="mt-2 text-sm text-green-600">
                            Menampilkan {filteredVoters.length} hasil pencarian untuk &quot;{searchTerm}&quot;
                        </div>
                    )}
                </div>

                {/* Voters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVoters.map((voter) => (
                        <div
                            key={voter.id}
                            className={`bg-white rounded-lg shadow-sm border-2 p-6 ${voter.isVerified
                                ? 'border-green-200 bg-green-50'
                                : 'border-gray-200'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {voter.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">{voter.class}</p>
                                    <p className="text-sm text-gray-600">NISN: {voter.nisn}</p>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${voter.isVerified
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {voter.isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
                                    </span>
                                    {voter.hasVoted && (
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            Sudah Vote
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {!voter.isVerified ? (
                                    <button
                                        onClick={() => verifyVoter(voter.id)}
                                        disabled={verifyingId === voter.id}
                                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                                    >
                                        {verifyingId === voter.id ? (
                                            <>Memverifikasi...</>
                                        ) : (
                                            <>
                                                <UserCheck className="h-4 w-4 mr-2" />
                                                Verifikasi Pemilih
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        {/* Token Display */}
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                            <p className="text-xs text-gray-500 mb-1">Token Pemilih:</p>
                                            <div className="flex items-center justify-between">
                                                <code className="text-sm font-mono font-semibold text-gray-900">
                                                    {voter.voteToken}
                                                </code>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(voter.voteToken!);
                                                        alert('Token berhasil dicopy!');
                                                    }}
                                                    className="text-blue-600 hover:text-blue-700"
                                                    title="Copy Token"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => copyToClipboard(voter.voteToken!)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy URL
                                        </button>
                                        <a
                                            href={`/vote/${voter.voteToken}`}
                                            target="_blank"
                                            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Buka URL
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredVoters.length === 0 && (
                    <div className="text-center py-12">
                        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'Tidak ada hasil pencarian' : 'Semua pemilih sudah diverifikasi'}
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm
                                ? `Tidak ditemukan pemilih dengan kata kunci &quot;${searchTerm}&quot;`
                                : 'Semua pemilih dalam database sudah melalui proses verifikasi'
                            }
                        </p>
                    </div>
                )}
            </div>
        </CommitteeLayout>
    )
}