'use client'

import { useCallback, useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { ShieldCheck, LogOut, ExternalLink } from 'lucide-react'

type Status = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED'

interface SchoolRow {
    id: string
    npsn: string
    name: string
    shortName: string
    level: string
    address: string | null
    city: string | null
    province: string | null
    contactName: string
    contactPhone: string
    contactEmail: string | null
    status: Status
    statusNote: string | null
    createdAt: string
    admins: Array<{ name: string; username: string }>
    _count: { voters: number; candidates: number; votes: number }
}

const STATUS_LABEL: Record<Status, string> = {
    PENDING: 'Menunggu',
    ACTIVE: 'Aktif',
    REJECTED: 'Ditolak',
    SUSPENDED: 'Nonaktif',
}

const STATUS_STYLE: Record<Status, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    SUSPENDED: 'bg-gray-200 text-gray-800',
}

export default function SuperAdminPage() {
    const { data: session } = useSession()
    const [filter, setFilter] = useState<Status | ''>('PENDING')
    const [schools, setSchools] = useState<SchoolRow[]>([])
    const [counts, setCounts] = useState<Partial<Record<Status, number>>>({})
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        setLoading(true)
        const res = await fetch(`/api/superadmin/schools${filter ? `?status=${filter}` : ''}`)
        if (res.ok) {
            const data = await res.json()
            setSchools(data.schools)
            setCounts(data.counts)
        }
        setLoading(false)
    }, [filter])

    useEffect(() => {
        load()
    }, [load])

    const changeStatus = async (school: SchoolRow, status: Status) => {
        let statusNote: string | undefined
        if (status === 'REJECTED' || status === 'SUSPENDED') {
            const note = prompt(`Alasan ${STATUS_LABEL[status].toLowerCase()} untuk ${school.name}:`)
            if (note === null) return
            statusNote = note
        } else if (!confirm(`${status === 'ACTIVE' ? 'Setujui/aktifkan' : 'Ubah status'} ${school.name} (NPSN ${school.npsn})?`)) {
            return
        }

        const res = await fetch(`/api/superadmin/schools/${school.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, statusNote })
        })
        if (!res.ok) {
            alert((await res.json()).error || 'Gagal mengubah status')
        }
        await load()
    }

    const tabs: Array<{ value: Status | ''; label: string }> = [
        { value: 'PENDING', label: `Menunggu (${counts.PENDING || 0})` },
        { value: 'ACTIVE', label: `Aktif (${counts.ACTIVE || 0})` },
        { value: 'SUSPENDED', label: `Nonaktif (${counts.SUSPENDED || 0})` },
        { value: 'REJECTED', label: `Ditolak (${counts.REJECTED || 0})` },
        { value: '', label: 'Semua' },
    ]

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-lg font-semibold flex items-center">
                        <ShieldCheck className="h-6 w-6 mr-2" />
                        Pengelola Platform E-Vote
                    </h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-300">@{session?.user?.username}</span>
                        <button onClick={() => signOut({ callbackUrl: '/superadmin/login' })} className="flex items-center text-sm text-gray-300 hover:text-white">
                            <LogOut className="h-4 w-4 mr-1" /> Keluar
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-wrap gap-2 mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.label}
                            onClick={() => setFilter(tab.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === tab.value ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p className="text-gray-600">Memuat...</p>
                ) : schools.length === 0 ? (
                    <p className="text-gray-600">Tidak ada sekolah pada daftar ini.</p>
                ) : (
                    <div className="space-y-4">
                        {schools.map(school => (
                            <div key={school.id} className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="text-lg font-bold text-gray-900">{school.name}</h2>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_STYLE[school.status]}`}>{STATUS_LABEL[school.status]}</span>
                                            <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">{school.level}</span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            NPSN <span className="font-mono font-semibold">{school.npsn}</span> ·{' '}
                                            <a
                                                href={`https://referensi.data.kemdikbud.go.id/pendidikan/npsn/${school.npsn}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline inline-flex items-center"
                                            >
                                                cek di Referensi Kemendikdasmen <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {[school.address, school.city, school.province].filter(Boolean).join(', ')}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Penanggung jawab: {school.contactName} · {school.contactPhone}
                                            {school.contactEmail ? ` · ${school.contactEmail}` : ''}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Admin: {school.admins.map(a => `${a.name} (@${a.username})`).join(', ') || '-'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Daftar {new Date(school.createdAt).toLocaleString('id-ID')} · {school._count.voters} pemilih · {school._count.candidates} kandidat · {school._count.votes} suara
                                        </p>
                                        {school.statusNote && <p className="text-sm text-red-700">Catatan: {school.statusNote}</p>}
                                    </div>
                                    <div className="flex flex-wrap gap-2 lg:justify-end">
                                        {school.status !== 'ACTIVE' && (
                                            <button onClick={() => changeStatus(school, 'ACTIVE')} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                                                {school.status === 'PENDING' ? 'Setujui' : 'Aktifkan'}
                                            </button>
                                        )}
                                        {school.status === 'PENDING' && (
                                            <button onClick={() => changeStatus(school, 'REJECTED')} className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                                                Tolak
                                            </button>
                                        )}
                                        {school.status === 'ACTIVE' && (
                                            <>
                                                <a href={`/s/${school.npsn}`} target="_blank" rel="noopener noreferrer" className="bg-white border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50">
                                                    Lihat halaman
                                                </a>
                                                <button onClick={() => changeStatus(school, 'SUSPENDED')} className="bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                                                    Nonaktifkan
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
