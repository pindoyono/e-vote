'use client'

import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { voterSchema, type VoterForm } from '@/lib/validations'

interface VoterModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (voter: VoterForm) => void
    voter?: {
        id: string
        name: string
        class: string
        nisn: string
    } | null
}

export default function VoterModal({ isOpen, onClose, onSave, voter }: VoterModalProps) {
    const [formData, setFormData] = useState<VoterForm>({
        name: voter?.name || '',
        class: voter?.class || '',
        nisn: voter?.nisn || ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})
        setSaving(true)

        try {
            const validatedData = voterSchema.parse(formData)
            await onSave(validatedData)
            onClose()
            setFormData({ name: '', class: '', nisn: '' })
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'errors' in error) {
                const zodError = error as { errors: Array<{ path: string[]; message: string }> }
                const fieldErrors: Record<string, string> = {}
                zodError.errors.forEach((err) => {
                    fieldErrors[err.path[0]] = err.message
                })
                setErrors(fieldErrors)
            }
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {voter ? 'Edit Pemilih' : 'Tambah Pemilih'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Masukkan nama lengkap"
                        />
                        {errors.name && (
                            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kelas
                        </label>
                        <input
                            type="text"
                            value={formData.class}
                            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Contoh: XII RPL 1"
                        />
                        {errors.class && (
                            <p className="text-red-600 text-sm mt-1">{errors.class}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            NISN
                        </label>
                        <input
                            type="text"
                            value={formData.nisn}
                            onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="10 digit NISN"
                            maxLength={10}
                        />
                        {errors.nisn && (
                            <p className="text-red-600 text-sm mt-1">{errors.nisn}</p>
                        )}
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}