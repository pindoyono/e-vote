'use client'

import { useEffect, useState } from 'react'
import { Users, Trash2, UserPlus } from 'lucide-react'

interface Committee {
    id: string
    name: string
    username: string
    isActive: boolean
}

// Kelola akun panitia (verifikator) sekolah: tambah & hapus
export default function CommitteeManager() {
    const [committees, setCommittees] = useState<Committee[]>([])
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const load = async () => {
        const res = await fetch('/api/admin/committees')
        if (res.ok) setCommittees(await res.json())
    }

    useEffect(() => {
        load()
    }, [])

    const create = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        try {
            const res = await fetch('/api/admin/committees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, password })
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Gagal membuat akun panitia')
                return
            }
            setName('')
            setUsername('')
            setPassword('')
            await load()
        } finally {
            setSaving(false)
        }
    }

    const remove = async (committee: Committee) => {
        if (!confirm(`Hapus akun panitia ${committee.name} (@${committee.username})?`)) return
        const res = await fetch(`/api/admin/committees/${committee.id}`, { method: 'DELETE' })
        if (res.ok) {
            await load()
        } else {
            alert((await res.json()).error || 'Gagal menghapus akun panitia')
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <Users className="h-7 w-7 mr-3 text-green-600" />
                Akun Panitia
            </h2>
            <p className="text-gray-600 mb-6">
                Panitia login di halaman Panitia dengan NPSN sekolah ini, lalu memverifikasi pemilih dan membagikan token.
            </p>

            {committees.length === 0 ? (
                <p className="text-gray-500 mb-6">Belum ada akun panitia.</p>
            ) : (
                <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg mb-6">
                    {committees.map(c => (
                        <li key={c.id} className="flex items-center justify-between px-4 py-3">
                            <div>
                                <p className="font-medium text-gray-900">{c.name}</p>
                                <p className="text-sm text-gray-500">@{c.username}</p>
                            </div>
                            <button
                                onClick={() => remove(c)}
                                className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                                title="Hapus akun"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama panitia"
                    className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                    required
                />
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                    autoComplete="off"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min. 8 karakter)"
                    className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                    autoComplete="new-password"
                    minLength={8}
                    required
                />
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center"
                >
                    <UserPlus className="h-5 w-5 mr-2" />
                    {saving ? 'Menyimpan...' : 'Tambah'}
                </button>
            </form>
            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>
    )
}
