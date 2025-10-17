'use client'

import { useEffect, useState, useRef } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { Plus, Edit, Trash, Upload } from 'lucide-react'

interface Candidate {
    id: string
    name: string
    class: string
    vision: string
    mission: string
    photo?: string
    orderNumber: number
}

export default function AdminCandidatesPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<Candidate | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const fetchCandidates = async () => {
        try {
            const res = await fetch('/api/admin/candidates')
            const data = await res.json()
            setCandidates(data)
        } catch (error) {
            console.error('Error fetching candidates', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCandidates()
    }, [])

    const openCreate = () => {
        setEditing(null)
        setPreview(null)
        setShowModal(true)
    }

    const openEdit = (c: Candidate) => {
        setEditing(c)
        setPreview(c.photo ?? null)
        setShowModal(true)
    }

    const handleDelete = async (c: Candidate) => {
        if (!confirm(`Hapus kandidat &quot;${c.name}&quot;? Tindakan ini tidak dapat dibatalkan.`)) return
        try {
            const res = await fetch(`/api/admin/candidates/${c.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Gagal menghapus kandidat')
            await fetchCandidates()
        } catch (err) {
            console.error(err)
            alert('Gagal menghapus kandidat')
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        setFormError(null)
        if (!file) {
            setPreview(editing?.photo ?? null)
            return
        }
        // basic validation
        if (!file.type.startsWith('image/')) {
            setFormError('Hanya file gambar yang diperbolehkan')
            fileInputRef.current && (fileInputRef.current.value = '')
            return
        }
        if (file.size > 2 * 1024 * 1024) {
            setFormError('Ukuran maksimum gambar adalah 2MB')
            fileInputRef.current && (fileInputRef.current.value = '')
            return
        }
        const url = URL.createObjectURL(file)
        setPreview(url)
    }

    useEffect(() => {
        return () => {
            // revoke preview URL when component unmounts
            if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preview])

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manajemen Kandidat</h1>
                <button onClick={openCreate} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Kandidat
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="text-lg text-gray-600">Memuat kandidat...</div>
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-lg text-gray-600 mb-2">Belum ada kandidat</div>
                            <div className="text-sm text-gray-500">Klik &quot;Tambah Kandidat&quot; untuk menambahkan kandidat pertama</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {candidates.map(c => (
                                <div key={c.id} className="border border-gray-200 rounded-lg p-6 flex flex-col items-start bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-full flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 tracking-wide">{c.name}</h3>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openEdit(c)}
                                                className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors"
                                                title="Edit kandidat"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c)}
                                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus kandidat"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {c.photo ? (
                                        <img src={c.photo} alt={c.name} className="w-full h-40 object-cover rounded-lg mb-4 border border-gray-100" />
                                    ) : (
                                        <div className="w-full h-40 bg-gray-50 rounded-lg mb-4 flex items-center justify-center text-gray-400 border border-gray-100">
                                            <Upload className="h-10 w-10" />
                                        </div>
                                    )}
                                    <div className="w-full space-y-2">
                                        <p className="text-sm font-medium text-gray-700">Kelas: <span className="font-normal text-gray-900">{c.class}</span></p>
                                        <p className="text-sm font-medium text-gray-700">Nomor Urut: <span className="font-bold text-blue-600">{c.orderNumber}</span></p>
                                        <p className="text-sm font-medium text-gray-700">Visi:</p>
                                        <p className="text-sm text-gray-600 leading-relaxed">{c.vision}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal skeleton - we'll implement form and upload next */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editing ? 'Edit Data Kandidat' : 'Tambah Kandidat Baru'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => { setShowModal(false); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault()
                                setFormError(null)
                                setSubmitting(true)
                                try {
                                    const form = e.target as HTMLFormElement
                                    const formData = new FormData(form)

                                    // append orderNumber as number if it's empty
                                    const orderValue = formData.get('orderNumber')
                                    if (!orderValue) formData.set('orderNumber', '0')

                                    const method = editing ? 'PUT' : 'POST'
                                    const url = editing ? `/api/admin/candidates/${editing.id}` : '/api/admin/candidates'

                                    const res = await fetch(url, { method, body: formData })
                                    if (!res.ok) {
                                        const text = await res.text()
                                        throw new Error(text || 'Server error')
                                    }

                                    await fetchCandidates()
                                    setShowModal(false)
                                    // clear file input and preview
                                    if (fileInputRef.current) fileInputRef.current.value = ''
                                    setPreview(null)
                                } catch (err: unknown) {
                                    console.error(err)
                                    const errorMessage = err && typeof err === 'object' && 'message' in err
                                        ? String(err.message)
                                        : 'Gagal menyimpan kandidat'
                                    setFormError(errorMessage)
                                } finally {
                                    setSubmitting(false)
                                }
                            }}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2">
                                            Nama Lengkap Kandidat <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="name"
                                            defaultValue={editing?.name ?? ''}
                                            required
                                            placeholder="Masukkan nama lengkap kandidat"
                                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2">
                                            Kelas <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="class"
                                            defaultValue={editing?.class ?? ''}
                                            required
                                            placeholder="Contoh: XII IPA 1"
                                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2">
                                            Nomor Urut Kandidat
                                        </label>
                                        <input
                                            name="orderNumber"
                                            type="number"
                                            defaultValue={editing?.orderNumber ?? 0}
                                            placeholder="Nomor urut (1, 2, 3, dst)"
                                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2">
                                            Visi Kandidat <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="vision"
                                            defaultValue={editing?.vision ?? ''}
                                            required
                                            placeholder="Masukkan visi kandidat untuk OSIS"
                                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                                            rows={4}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2">
                                            Misi Kandidat <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="mission"
                                            defaultValue={editing?.mission ?? ''}
                                            required
                                            placeholder="Masukkan misi atau program kerja kandidat"
                                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 border-t pt-8">
                                <label className="block text-sm font-bold text-gray-800 mb-4">
                                    Foto Kandidat
                                </label>
                                <div className="flex flex-col lg:flex-row items-start gap-6">
                                    <div className="flex flex-col items-center">
                                        <div className="w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden flex items-center justify-center">
                                            {preview ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center text-gray-400">
                                                    <Upload className="h-12 w-12 mx-auto mb-2" />
                                                    <p className="text-xs">Preview Foto</p>
                                                </div>
                                            )}
                                        </div>
                                        {preview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreview(editing?.photo ?? null)
                                                    if (fileInputRef.current) fileInputRef.current.value = ''
                                                }}
                                                className="mt-2 text-xs text-red-600 hover:text-red-800"
                                            >
                                                Hapus Preview
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-4">
                                            <input
                                                ref={fileInputRef}
                                                name="photo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                                            />
                                        </div>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="font-medium text-blue-900 mb-2">Petunjuk Upload Foto:</h4>
                                            <ul className="text-sm text-blue-800 space-y-1">
                                                <li>• Ukuran maksimal: 2MB</li>
                                                <li>• Format yang didukung: JPG, PNG, GIF</li>
                                                <li>• Disarankan foto formal dan jelas</li>
                                                <li>• Jika edit tanpa pilih foto baru, foto lama akan dipertahankan</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {formError && (
                                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <div className="text-red-600 font-medium">Error:</div>
                                        <div className="ml-2 text-red-700">{formError}</div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setPreview(null);
                                        if (fileInputRef.current) fileInputRef.current.value = ''
                                    }}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center min-w-[120px]"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        editing ? 'Update Kandidat' : 'Simpan Kandidat'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}
