'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Search, UserCheck, ExternalLink, Copy, RotateCcw, AlertTriangle } from 'lucide-react'

interface Voter {
    id: string
    name: string
    class: string
    nisn: string
    isVerified: boolean
    hasVoted: boolean
    voteToken?: string
}

export default function VerificationPage() {
    const [voters, setVoters] = useState<Voter[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [verifyingId, setVerifyingId] = useState<string | null>(null)
    const [resettingId, setResettingId] = useState<string | null>(null)
    const [resettingAll, setResettingAll] = useState(false)
    const [showConfirmResetAll, setShowConfirmResetAll] = useState(false)

    const fetchUnverifiedVoters = async () => {
        try {
            const response = await fetch('/api/admin/voters')
            const data = await response.json()
            setVoters(data.voters || [])
        } catch (error) {
            console.error('Error fetching voters:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUnverifiedVoters()
    }, [])

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
                const voteUrl = `${window.location.origin}/vote/${updatedVoter.voteToken}`

                // Create modal or alert with the URL
                const modal = document.createElement('div')
                modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
                modal.innerHTML = `
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold mb-4">URL Voting Generated</h3>
            <p class="text-sm text-gray-600 mb-4">
              URL voting untuk ${updatedVoter.name} telah dibuat:
            </p>
            <div class="bg-gray-100 p-3 rounded border mb-4">
              <code class="text-sm break-all">${voteUrl}</code>
            </div>
            <div class="flex space-x-2">
              <button 
                onclick="navigator.clipboard.writeText('${voteUrl}'); alert('URL copied!')"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Copy URL
              </button>
              <button 
                onclick="window.open('${voteUrl}', '_blank')"
                class="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Open URL
              </button>
            </div>
            <button 
              onclick="document.body.removeChild(this.parentElement.parentElement)"
              class="w-full mt-2 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        `
                document.body.appendChild(modal)
            } else {
                alert('Gagal memverifikasi pemilih')
            }
        } catch (error) {
            console.error('Verify error:', error)
            alert('Terjadi kesalahan saat memverifikasi')
        } finally {
            setVerifyingId(null)
        }
    }

    const resetVerification = async (voterId: string, voterName: string) => {
        if (!confirm(`Yakin ingin reset verifikasi untuk ${voterName}?`)) {
            return
        }

        setResettingId(voterId)
        try {
            const response = await fetch(`/api/admin/voters/${voterId}/reset-verification`, {
                method: 'POST',
            })

            if (response.ok) {
                const result = await response.json()
                // Update the voter in the list
                setVoters(voters.map(v =>
                    v.id === voterId
                        ? { ...v, isVerified: false, voteToken: undefined }
                        : v
                ))
                alert(`Verifikasi untuk ${voterName} berhasil direset!`)
            } else {
                const error = await response.json()
                alert('Error: ' + error.message)
            }
        } catch (error) {
            console.error('Reset verification error:', error)
            alert('Terjadi kesalahan saat reset verifikasi')
        } finally {
            setResettingId(null)
        }
    }

    const resetAllVerifications = async () => {
        if (!showConfirmResetAll) {
            setShowConfirmResetAll(true)
            return
        }

        setResettingAll(true)
        try {
            const response = await fetch('/api/admin/voters/reset-all-verifications', {
                method: 'POST'
            })

            if (response.ok) {
                const result = await response.json()
                // Update all voters to unverified
                setVoters(voters.map(v => ({
                    ...v,
                    isVerified: false,
                    voteToken: undefined
                })))
                alert(`Semua verifikasi berhasil direset! ${result.count} pemilih terpengaruh.`)
            } else {
                const error = await response.json()
                alert('Error: ' + error.message)
            }
        } catch (error) {
            console.error('Reset all verifications error:', error)
            alert('Terjadi kesalahan saat reset semua verifikasi')
        } finally {
            setResettingAll(false)
            setShowConfirmResetAll(false)
        }
    }

    const copyVoteUrl = async (voteToken: string) => {
        const url = `${window.location.origin}/vote/${voteToken}`
        try {
            await navigator.clipboard.writeText(url)
            alert('URL berhasil disalin!')
        } catch (error) {
            console.error('Copy error:', error)
        }
    }

    const filteredVoters = voters.filter(voter =>
        voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.nisn.includes(searchTerm)
    )

    const unverifiedVoters = filteredVoters.filter(v => !v.isVerified)
    const verifiedVoters = filteredVoters.filter(v => v.isVerified)

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Verifikasi Pemilih</h1>
                        <div className="text-sm text-gray-600 mt-1">
                            {unverifiedVoters.length} belum diverifikasi • {verifiedVoters.length} sudah diverifikasi
                        </div>
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
                            onClick={resetAllVerifications}
                            disabled={resettingAll || verifiedVoters.length === 0}
                            className={`px-6 py-2 rounded-md flex items-center space-x-2 ${showConfirmResetAll
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-300'
                                }`}
                        >
                            {resettingAll ? (
                                <>
                                    <RotateCcw className="w-4 h-4 animate-spin" />
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
                                    <span>Reset Semua Verifikasi</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {showConfirmResetAll && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                            <p className="text-red-800 font-medium">
                                PERINGATAN: Aksi ini akan mereset status verifikasi dari {verifiedVoters.length} pemilih yang sudah diverifikasi dan tidak dapat dibatalkan!
                            </p>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Cara Verifikasi:</h3>
                    <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                        <li>Pastikan identitas pemilih sesuai dengan data yang valid</li>
                        <li>Klik tombol "Verifikasi" untuk mengonfirmasi data pemilih</li>
                        <li>Sistem akan menggenerate URL unik untuk voting</li>
                        <li>Berikan URL tersebut kepada pemilih untuk melakukan voting</li>
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
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 font-medium"
                        />
                    </div>
                    {searchTerm && (
                        <div className="mt-2 text-sm text-blue-600">
                            Menampilkan {filteredVoters.length} hasil pencarian untuk "{searchTerm}"
                        </div>
                    )}
                </div>

                {/* Voters Grid */}
                {/* Verified Voters Section - Moved to Top */}
                {verifiedVoters.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Pemilih Sudah Diverifikasi ({verifiedVoters.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {verifiedVoters.map((voter) => (
                                <div
                                    key={voter.id}
                                    className="bg-green-50 border-2 border-green-200 rounded-lg p-4"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{voter.name}</h3>
                                            <p className="text-sm text-gray-600">{voter.class}</p>
                                            <p className="text-xs text-gray-500">NISN: {voter.nisn}</p>
                                        </div>
                                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                            Verified
                                        </span>
                                    </div>

                                    {voter.hasVoted && (
                                        <div className="mb-3">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                                Sudah Vote
                                            </span>
                                        </div>
                                    )}

                                    {voter.voteToken && (
                                        <div className="mb-3">
                                            <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                                                <span className="font-medium">Vote URL:</span>
                                                <br />
                                                <code className="break-all">
                                                    /vote/{voter.voteToken}
                                                </code>
                                            </div>
                                            <div className="flex space-x-2 mt-2">
                                                <button
                                                    onClick={() => copyVoteUrl(voter.voteToken!)}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm flex items-center justify-center"
                                                >
                                                    <Copy className="h-3 w-3 mr-1" />
                                                    Copy
                                                </button>
                                                <button
                                                    onClick={() => window.open(`/vote/${voter.voteToken}`, '_blank')}
                                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-2 rounded text-sm flex items-center justify-center"
                                                >
                                                    <ExternalLink className="h-3 w-3 mr-1" />
                                                    Open
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => resetVerification(voter.id, voter.name)}
                                        disabled={resettingId === voter.id}
                                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-2 px-4 rounded flex items-center justify-center"
                                    >
                                        {resettingId === voter.id ? (
                                            <>
                                                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                                                Mereset...
                                            </>
                                        ) : (
                                            <>
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Reset Verifikasi
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Unverified Voters Section - Moved to Bottom */}
                {unverifiedVoters.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Pemilih Belum Diverifikasi ({unverifiedVoters.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {unverifiedVoters.map((voter) => (
                                <div
                                    key={voter.id}
                                    className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{voter.name}</h3>
                                            <p className="text-sm text-gray-600">{voter.class}</p>
                                            <p className="text-xs text-gray-500">NISN: {voter.nisn}</p>
                                        </div>
                                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                                            Belum Verifikasi
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => verifyVoter(voter.id)}
                                        disabled={verifyingId === voter.id}
                                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2 px-4 rounded flex items-center justify-center"
                                    >
                                        {verifyingId === voter.id ? (
                                            <>
                                                <UserCheck className="h-4 w-4 mr-2 animate-pulse" />
                                                Memverifikasi...
                                            </>
                                        ) : (
                                            <>
                                                <UserCheck className="h-4 w-4 mr-2" />
                                                Verifikasi
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {filteredVoters.length === 0 && (
                    <div className="text-center py-12">
                        <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Tidak ada data pemilih
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm ? 'Tidak ada pemilih yang sesuai dengan pencarian' : 'Belum ada pemilih yang terdaftar'}
                        </p>
                    </div>
                )}

                {unverifiedVoters.length === 0 && verifiedVoters.length === 0 && !searchTerm && (
                    <div className="text-center py-12">
                        <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Belum ada pemilih terdaftar
                        </h3>
                        <p className="text-gray-600">
                            Silakan tambah data pemilih terlebih dahulu
                        </p>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}