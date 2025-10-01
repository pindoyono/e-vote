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

interface DashboardStats {
    totalVoters: number
    votersWhoVoted: number
    totalVotes: number
    votingProgress: number
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
        voterName: string
        voterClass: string
        candidateName: string
        candidateNumber: number
        createdAt: string
    }>
}

interface Voter {
    id: string
    studentId: string
    name: string
    class: string
    hasVoted: boolean
    vote?: {
        candidate: {
            name: string
            orderNumber: number
        }
        createdAt: string
    }
}

export default function AdminReportsPage() {
    const [user, setUser] = useState<User | null>(null)
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [voters, setVoters] = useState<Voter[]>([])
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
            const [statsRes, votersRes] = await Promise.all([
                fetch('/api/dashboard/stats'),
                fetch('/api/voters')
            ])

            if (statsRes.ok) {
                const statsData = await statsRes.json()
                setStats(statsData)
            }

            if (votersRes.ok) {
                const votersData = await votersRes.json()
                setVoters(votersData)
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

    const exportDetailedReport = () => {
        if (!stats) return

        const headers = [
            'No',
            'NIS',
            'Nama Pemilih',
            'Kelas',
            'Status',
            'Kandidat Dipilih',
            'Nomor Kandidat',
            'Waktu Vote'
        ]

        const csvData = voters.map((voter, index) => [
            index + 1,
            voter.studentId,
            voter.name,
            voter.class,
            voter.hasVoted ? 'Sudah Memilih' : 'Belum Memilih',
            voter.vote ? voter.vote.candidate.name : '-',
            voter.vote ? voter.vote.candidate.orderNumber : '-',
            voter.vote ? new Date(voter.vote.createdAt).toLocaleString('id-ID') : '-'
        ])

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `laporan-pemilihan-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }

    const exportResultsSummary = () => {
        if (!stats) return

        const headers = [
            'Nomor Urut',
            'Nama Kandidat',
            'Kelas',
            'Jumlah Suara',
            'Persentase (%)',
            'Ranking'
        ]

        const sortedCandidates = [...stats.candidates].sort((a, b) => b.voteCount - a.voteCount)

        const csvData = sortedCandidates.map((candidate, index) => [
            candidate.orderNumber,
            candidate.name,
            candidate.class,
            candidate.voteCount,
            candidate.percentage,
            index + 1
        ])

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `hasil-pemilihan-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }

    const printReport = () => {
        if (!stats) return

        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const sortedCandidates = [...stats.candidates].sort((a, b) => b.voteCount - a.voteCount)

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Pemilihan OSIS SMK N 2 MALINAU</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-item { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .winner { background-color: #d4edda; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAPORAN HASIL PEMILIHAN KETUA OSIS</h1>
          <h2>SMK N 2 MALINAU</h2>
          <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
        </div>
        
        <div class="stats">
          <div class="stat-item">
            <h3>${stats.totalVoters}</h3>
            <p>Total Pemilih</p>
          </div>
          <div class="stat-item">
            <h3>${stats.votersWhoVoted}</h3>
            <p>Sudah Memilih</p>
          </div>
          <div class="stat-item">
            <h3>${stats.votingProgress}%</h3>
            <p>Partisipasi</p>
          </div>
        </div>

        <h3>Hasil Pemilihan:</h3>
        <table>
          <thead>
            <tr>
              <th>Ranking</th>
              <th>No. Urut</th>
              <th>Nama Kandidat</th>
              <th>Kelas</th>
              <th>Jumlah Suara</th>
              <th>Persentase</th>
            </tr>
          </thead>
          <tbody>
            ${sortedCandidates.map((candidate, index) => `
              <tr class="${index === 0 ? 'winner' : ''}">
                <td>${index + 1}</td>
                <td>${candidate.orderNumber}</td>
                <td>${candidate.name}</td>
                <td>${candidate.class}</td>
                <td>${candidate.voteCount}</td>
                <td>${candidate.percentage}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${sortedCandidates.length > 0 && sortedCandidates[0].voteCount > 0 ? `
          <div style="margin: 30px 0; padding: 20px; background-color: #d4edda; border-radius: 5px;">
            <h3>🎉 PEMENANG PEMILIHAN:</h3>
            <p style="font-size: 18px; font-weight: bold;">
              ${sortedCandidates[0].orderNumber}. ${sortedCandidates[0].name} (${sortedCandidates[0].class})
            </p>
            <p>Dengan perolehan ${sortedCandidates[0].voteCount} suara (${sortedCandidates[0].percentage}%)</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>Laporan ini digenerate secara otomatis oleh Sistem E-Vote OSIS SMK N 2 MALINAU</p>
          <p>${new Date().toLocaleString('id-ID')}</p>
        </div>
      </body>
      </html>
    `)

        printWindow.document.close()
        printWindow.print()
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

    if (!user || !stats) {
        return null
    }

    const sortedCandidates = [...stats.candidates].sort((a, b) => b.voteCount - a.voteCount)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Laporan Pemilihan
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

                    {/* Summary Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">Total Pemilih</h3>
                                <p className="text-3xl font-bold text-blue-600">{stats.totalVoters}</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">Sudah Memilih</h3>
                                <p className="text-3xl font-bold text-green-600">{stats.votersWhoVoted}</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">Belum Memilih</h3>
                                <p className="text-3xl font-bold text-orange-600">
                                    {stats.totalVoters - stats.votersWhoVoted}
                                </p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900">Partisipasi</h3>
                                <p className="text-3xl font-bold text-purple-600">{stats.votingProgress}%</p>
                            </div>
                        </Card>
                    </div>

                    {/* Export Actions */}
                    <Card className="mb-8">
                        <h3 className="text-lg font-bold mb-4">Export & Print Laporan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button onClick={exportDetailedReport} className="w-full">
                                📊 Export Detail Pemilih (CSV)
                            </Button>
                            <Button onClick={exportResultsSummary} className="w-full">
                                🏆 Export Hasil Pemilihan (CSV)
                            </Button>
                            <Button onClick={printReport} className="w-full" variant="secondary">
                                🖨️ Print Laporan Lengkap
                            </Button>
                        </div>
                    </Card>

                    {/* Winner Announcement */}
                    {sortedCandidates.length > 0 && stats.totalVotes > 0 && (
                        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🏆</div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    PEMENANG PEMILIHAN KETUA OSIS
                                </h2>
                                <div className="bg-white rounded-lg p-6 inline-block shadow-md">
                                    <div className="text-4xl font-bold text-blue-600 mb-2">
                                        {sortedCandidates[0].orderNumber}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {sortedCandidates[0].name}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{sortedCandidates[0].class}</p>
                                    <div className="text-3xl font-bold text-green-600">
                                        {sortedCandidates[0].voteCount} Suara
                                    </div>
                                    <div className="text-lg text-gray-700">
                                        ({sortedCandidates[0].percentage}% dari total suara)
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Detailed Results */}
                    <Card title="Hasil Detail Pemilihan">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ranking
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            No. Urut
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kandidat
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Jumlah Suara
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Persentase
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Grafik
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedCandidates.map((candidate, index) => (
                                        <tr key={candidate.id} className={index === 0 && stats.totalVotes > 0 ? 'bg-green-50' : 'hover:bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-2xl">
                                                    {index === 0 && stats.totalVotes > 0 ? '🥇' :
                                                        index === 1 ? '🥈' :
                                                            index === 2 ? '🥉' : `${index + 1}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {candidate.orderNumber}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {candidate.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {candidate.class}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {candidate.voteCount}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-lg font-semibold text-gray-700">
                                                    {candidate.percentage}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="w-32">
                                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                                        <div
                                                            className={`h-4 rounded-full transition-all duration-500 ${index === 0 ? 'bg-green-500' :
                                                                    index === 1 ? 'bg-blue-500' :
                                                                        'bg-purple-500'
                                                                }`}
                                                            style={{ width: `${candidate.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Activity Log Summary */}
                    <Card title="Aktivitas Voting Terbaru">
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {stats.recentVotes.map((vote) => (
                                <div key={vote.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{vote.voterName}</p>
                                        <p className="text-sm text-gray-600">{vote.voterClass}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">→ Kandidat {vote.candidateNumber}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(vote.createdAt).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {stats.recentVotes.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    Belum ada aktivitas voting
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}