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
    vote?: {
        candidate: {
            name: string
            orderNumber: number
        }
    }
}

export default function AdminVotersPage() {
    const [user, setUser] = useState<User | null>(null)
    const [voters, setVoters] = useState<Voter[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [showImportForm, setShowImportForm] = useState(false)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [importing, setImporting] = useState(false)
    const [newVoter, setNewVoter] = useState({
        studentId: '',
        name: '',
        class: ''
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

    const handleAddVoter = async (e: React.FormEvent) => {
        e.preventDefault()
        setAdding(true)

        try {
            const response = await fetch('/api/voters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newVoter)
            })

            if (response.ok) {
                const voter = await response.json()
                setVoters([voter, ...voters])
                setNewVoter({ studentId: '', name: '', class: '' })
                setShowAddForm(false)
                alert('Pemilih berhasil ditambahkan!')
            } else {
                const errorData = await response.json()
                alert(errorData.error || 'Gagal menambahkan pemilih')
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

    const exportToCSV = () => {
        const headers = ['NIS', 'Nama', 'Kelas', 'Status Voting', 'Kandidat Dipilih', 'Waktu Vote']
        const csvData = voters.map(voter => [
            voter.studentId,
            voter.name,
            voter.class,
            voter.hasVoted ? 'Sudah Memilih' : 'Belum Memilih',
            voter.vote ? `${voter.vote.candidate.orderNumber}. ${voter.vote.candidate.name}` : '-',
            voter.hasVoted ? new Date(voter.createdAt).toLocaleString('id-ID') : '-'
        ])

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `data-pemilih-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }

    const handleImportExcel = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!importFile) {
            alert('Silakan pilih file Excel terlebih dahulu')
            return
        }

        setImporting(true)

        try {
            // Import the xlsx library dynamically
            const XLSX = await import('xlsx')

            const reader = new FileReader()
            reader.onload = async (event) => {
                try {
                    const data = event.target?.result
                    const workbook = XLSX.read(data, { type: 'array' })
                    const sheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[sheetName]
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

                    // Skip header row and process data
                    const votersData = jsonData.slice(1).filter(row => row.length >= 3).map(row => ({
                        studentId: String(row[0] || '').trim().replace(/"/g, ''),
                        name: String(row[1] || '').trim().replace(/"/g, ''),
                        class: String(row[2] || '').trim().replace(/"/g, '')
                    })).filter(voter => voter.studentId && voter.name && voter.class)

                    if (votersData.length === 0) {
                        alert('Tidak ada data valid yang ditemukan dalam file Excel')
                        return
                    }

                    // Send data to API
                    let successCount = 0
                    let errorCount = 0
                    const errors: string[] = []

                    for (const voterData of votersData) {
                        try {
                            const response = await fetch('/api/voters', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(voterData)
                            })

                            if (response.ok) {
                                successCount++
                            } else {
                                const errorData = await response.json()
                                errors.push(`${voterData.studentId}: ${errorData.error}`)
                                errorCount++
                            }
                        } catch {
                            errors.push(`${voterData.studentId}: Network error`)
                            errorCount++
                        }
                    }

                    // Show results
                    let message = `Import selesai!\n✅ Berhasil: ${successCount} pemilih`
                    if (errorCount > 0) {
                        message += `\n❌ Gagal: ${errorCount} pemilih`
                        if (errors.length > 0) {
                            message += `\n\nError details:\n${errors.slice(0, 5).join('\n')}`
                            if (errors.length > 5) {
                                message += `\n... dan ${errors.length - 5} error lainnya`
                            }
                        }
                    }

                    alert(message)

                    if (successCount > 0) {
                        fetchVoters() // Refresh data
                        setShowImportForm(false)
                        setImportFile(null)
                    }

                } catch (error) {
                    console.error('Error processing Excel file:', error)
                    alert('Error: File Excel tidak valid atau rusak')
                }
            }

            reader.readAsArrayBuffer(importFile)

        } catch (error) {
            console.error('Error importing Excel:', error)
            alert('Error: Gagal memproses file Excel')
        } finally {
            setImporting(false)
        }
    }

    const downloadTemplate = () => {
        const headers = ['NIS', 'Nama', 'Kelas']
        const sampleData = [
            ['2023001', 'Contoh Nama 1', 'X RPL 1'],
            ['2023002', 'Contoh Nama 2', 'X TKJ 1'],
            ['2023003', 'Contoh Nama 3', 'X MM 1']
        ]

        const csvContent = [headers, ...sampleData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'template-import-pemilih.csv'
        link.click()
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
                                Kelola Data Pemilih
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

                    {/* Actions */}
                    <Card className="mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                            <div className="flex space-x-4">
                                <Button onClick={() => setShowAddForm(true)}>
                                    + Tambah Pemilih
                                </Button>
                                <Button variant="secondary" onClick={exportToCSV}>
                                    📥 Export CSV
                                </Button>
                                <Button variant="secondary" onClick={() => setShowImportForm(true)}>
                                    📤 Import Excel
                                </Button>
                            </div>
                            <div className="w-full md:w-64">
                                <Input
                                    placeholder="Cari pemilih..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Add Voter Form */}
                    {showAddForm && (
                        <Card className="mb-8">
                            <h3 className="text-lg font-bold mb-4">Tambah Pemilih Baru</h3>
                            <form onSubmit={handleAddVoter} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="NIS"
                                    value={newVoter.studentId}
                                    onChange={(e) => setNewVoter({ ...newVoter, studentId: e.target.value })}
                                    required
                                    disabled={adding}
                                />
                                <Input
                                    label="Nama Lengkap"
                                    value={newVoter.name}
                                    onChange={(e) => setNewVoter({ ...newVoter, name: e.target.value })}
                                    required
                                    disabled={adding}
                                />
                                <Input
                                    label="Kelas"
                                    value={newVoter.class}
                                    onChange={(e) => setNewVoter({ ...newVoter, class: e.target.value })}
                                    required
                                    disabled={adding}
                                />
                                <div className="md:col-span-3 flex space-x-2">
                                    <Button type="submit" disabled={adding}>
                                        {adding ? 'Menambahkan...' : 'Tambah Pemilih'}
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

                    {/* Import Excel Form */}
                    {showImportForm && (
                        <Card className="mb-8">
                            <h3 className="text-lg font-bold mb-4">Import Data Pemilih dari Excel</h3>
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 mb-2">Format File Excel:</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Kolom A: NIS</li>
                                        <li>• Kolom B: Nama Lengkap</li>
                                        <li>• Kolom C: Kelas</li>
                                        <li>• Baris pertama adalah header (akan diabaikan)</li>
                                        <li>• Format file: .xlsx atau .csv</li>
                                    </ul>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="mt-3"
                                        onClick={downloadTemplate}
                                    >
                                        📄 Download Template
                                    </Button>
                                </div>

                                <form onSubmit={handleImportExcel} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pilih File Excel
                                        </label>
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={importing}
                                        />
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button type="submit" disabled={importing || !importFile}>
                                            {importing ? 'Mengimpor...' : 'Import Data'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => {
                                                setShowImportForm(false)
                                                setImportFile(null)
                                            }}
                                            disabled={importing}
                                        >
                                            Batal
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </Card>
                    )}

                    {/* Voters Table */}
                    <Card title="Daftar Pemilih">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pemilih
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kelas
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pilihan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal Vote
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredVoters.map((voter) => (
                                        <tr key={voter.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {voter.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        NIS: {voter.studentId}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {voter.class}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${voter.hasVoted
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
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {voter.vote ? (
                                                    <span className="font-medium">
                                                        {voter.vote.candidate.orderNumber}. {voter.vote.candidate.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {voter.hasVoted ? (
                                                    new Date(voter.createdAt).toLocaleString('id-ID')
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredVoters.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    {searchTerm ? 'Tidak ada pemilih yang ditemukan' : 'Belum ada data pemilih'}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}