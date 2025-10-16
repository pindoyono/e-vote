'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import VoterModal from '@/components/VoterModal'
import {
    Plus,
    Search,
    Download,
    Upload,
    Edit,
    Trash2,
    FileSpreadsheet
} from 'lucide-react'
import { VoterForm } from '@/lib/validations'

interface Voter {
    id: string
    name: string
    class: string
    nisn: string
    isVerified: boolean
    hasVoted: boolean
    createdAt: string
}

export default function VotersPage() {
    const [voters, setVoters] = useState<Voter[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingVoter, setEditingVoter] = useState<Voter | null>(null)

    const fetchVoters = async () => {
        try {
            const response = await fetch('/api/admin/voters')
            const data = await response.json()
            setVoters(data)
        } catch (error) {
            console.error('Error fetching voters:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVoters()
    }, [])

    const filteredVoters = voters.filter(voter =>
        voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.nisn.includes(searchTerm)
    )

    const exportToCSV = () => {
        const csvContent = [
            ['Nama', 'Kelas', 'NISN', 'Status Verifikasi', 'Sudah Vote'],
            ...voters.map(voter => [
                voter.name,
                voter.class,
                voter.nisn,
                voter.isVerified ? 'Terverifikasi' : 'Belum Verifikasi',
                voter.hasVoted ? 'Sudah' : 'Belum'
            ])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'data-pemilih.csv'
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Reset input
        event.target.value = ''

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/admin/voters/import', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (response.ok) {
                fetchVoters()

                let message = result.message
                if (result.errors && result.errors.length > 0) {
                    message += '\n\nPeringatan:\n' + result.errors.slice(0, 5).join('\n')
                    if (result.errors.length > 5) {
                        message += `\n... dan ${result.errors.length - 5} error lainnya`
                    }
                }

                alert(message)
            } else {
                let errorMessage = result.error || 'Gagal mengimport data'
                if (result.details && result.details.length > 0) {
                    errorMessage += '\n\nDetail error:\n' + result.details.slice(0, 5).join('\n')
                    if (result.details.length > 5) {
                        errorMessage += `\n... dan ${result.details.length - 5} error lainnya`
                    }
                }
                alert(errorMessage)
            }
        } catch (error) {
            console.error('Import error:', error)
            alert('Terjadi kesalahan saat mengimport data')
        }
    }

    const deleteVoter = async (id: string) => {
        if (!confirm('Yakin ingin menghapus data pemilih ini?')) return

        try {
            const response = await fetch(`/api/admin/voters/${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                fetchVoters()
            } else {
                alert('Gagal menghapus data')
            }
        } catch (error) {
            console.error('Delete error:', error)
            alert('Terjadi kesalahan saat menghapus data')
        }
    }

    const handleSaveVoter = async (voterData: VoterForm) => {
        try {
            const url = editingVoter
                ? `/api/admin/voters/${editingVoter.id}`
                : '/api/admin/voters'

            const method = editingVoter ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(voterData),
            })

            if (response.ok) {
                fetchVoters()
                setEditingVoter(null)
                setShowAddModal(false)
            } else {
                const error = await response.json()
                alert(error.error || 'Gagal menyimpan data')
            }
        } catch (error) {
            console.error('Save voter error:', error)
            alert('Terjadi kesalahan saat menyimpan data')
        }
    }

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
                    <h1 className="text-2xl font-bold text-gray-900">Data Pemilih</h1>
                    <div className="flex space-x-3">
                        <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
                            <Upload className="h-4 w-4 mr-2" />
                            Import CSV
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                        <button
                            onClick={exportToCSV}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Pemilih
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-3">
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Pencarian Data Pemilih
                        </label>
                        <p className="text-xs text-gray-600 mb-3">
                            Ketik nama lengkap, kelas, atau nomor NISN untuk mencari pemilih dalam database
                        </p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Contoh: Siti Aminah atau XII IPA 1 atau 0123456789"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 font-medium"
                        />
                    </div>
                    {searchTerm && (
                        <div className="mt-2 text-sm text-blue-600">
                            Menampilkan {filteredVoters.length} dari {voters.length} pemilih untuk "{searchTerm}"
                        </div>
                    )}
                </div>

                {/* Voters Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Daftar Pemilih ({filteredVoters.length})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nama
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kelas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        NISN
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vote
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredVoters.map((voter) => (
                                    <tr key={voter.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {voter.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {voter.class}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {voter.nisn}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${voter.isVerified
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {voter.isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${voter.hasVoted
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {voter.hasVoted ? 'Sudah Vote' : 'Belum Vote'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setEditingVoter(voter)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteVoter(voter.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Template Download */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <FileSpreadsheet className="h-5 w-5 text-blue-600 mr-2" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">
                                    Template Import CSV
                                </p>
                                <p className="text-sm text-blue-700">
                                    Format: Nama, Kelas, NISN (tanpa header)
                                </p>
                            </div>
                        </div>
                        <a
                            href="/api/admin/voters/template"
                            download="template-pemilih.csv"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download Template
                        </a>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <VoterModal
                isOpen={showAddModal || !!editingVoter}
                onClose={() => {
                    setShowAddModal(false)
                    setEditingVoter(null)
                }}
                onSave={handleSaveVoter}
                voter={editingVoter}
            />
        </AdminLayout>
    )
}