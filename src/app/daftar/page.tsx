'use client'

import Link from 'next/link'
import { useState } from 'react'
import { School, CheckCircle } from 'lucide-react'

const LEVELS = ['SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'SMK', 'SLB', 'Lainnya']

const initialForm = {
    npsn: '',
    name: '',
    shortName: '',
    level: '',
    address: '',
    city: '',
    province: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    eventTitle: 'Pemilihan Ketua OSIS',
    adminName: '',
    adminUsername: '',
    adminPassword: '',
    website: '',
}

type FormKey = keyof typeof initialForm

export default function RegisterSchoolPage() {
    const [form, setForm] = useState(initialForm)
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [error, setError] = useState('')
    const [errorField, setErrorField] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [registeredNpsn, setRegisteredNpsn] = useState('')

    const set = (key: FormKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm({ ...form, [key]: key === 'npsn' ? e.target.value.toUpperCase() : e.target.value })

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setErrorField('')

        if (form.adminPassword !== passwordConfirm) {
            setError('Konfirmasi password tidak sama')
            setErrorField('adminPassword')
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (!res.ok) {
                setError(res.status === 429 ? 'Terlalu banyak percobaan, coba lagi beberapa menit lagi.' : data.error || 'Pendaftaran gagal')
                setErrorField(data.field || '')
                return
            }
            setRegisteredNpsn(data.npsn)
        } catch {
            setError('Terjadi kesalahan jaringan. Silakan coba lagi.')
        } finally {
            setSubmitting(false)
        }
    }

    const inputClass = (key: string) =>
        `w-full px-4 py-3 border-2 rounded-lg text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500 ${errorField === key ? 'border-red-400' : 'border-gray-300'}`

    if (registeredNpsn) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran terkirim</h1>
                    <p className="text-gray-700 mb-4">
                        Sekolah dengan NPSN <span className="font-mono font-bold">{registeredNpsn}</span> sedang
                        menunggu persetujuan pengelola platform. Setelah disetujui, admin bisa login dengan NPSN,
                        username, dan password yang tadi didaftarkan.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">Pengelola dapat menghubungi nomor penanggung jawab untuk verifikasi.</p>
                    <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg">
                        Kembali ke beranda
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <School className="h-14 w-14 text-white mx-auto mb-3" />
                    <h1 className="text-3xl font-bold text-white mb-2">Daftarkan Sekolah</h1>
                    <p className="text-blue-200">Untuk semua jenjang: SD/MI, SMP/MTs, SMA/MA/SMK, SLB, dan lainnya</p>
                </div>

                <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">1. Data Sekolah</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">NPSN *</label>
                                <input value={form.npsn} onChange={set('npsn')} maxLength={8} placeholder="8 karakter" className={`${inputClass('npsn')} font-mono tracking-wider`} required />
                                <p className="text-xs text-gray-500 mt-1">NPSN menjadi identitas sekolah dan dipakai saat login.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Jenjang *</label>
                                <select value={form.level} onChange={set('level')} className={inputClass('level')} required>
                                    <option value="">Pilih jenjang</option>
                                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Nama sekolah lengkap *</label>
                                <input value={form.name} onChange={set('name')} placeholder="Contoh: SD Negeri 1 Malinau Kota" className={inputClass('name')} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Nama singkat *</label>
                                <input value={form.shortName} onChange={set('shortName')} placeholder="Contoh: SDN 1 Malinau" className={inputClass('shortName')} required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Alamat</label>
                                <input value={form.address} onChange={set('address')} className={inputClass('address')} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Kabupaten/Kota *</label>
                                <input value={form.city} onChange={set('city')} className={inputClass('city')} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Provinsi *</label>
                                <input value={form.province} onChange={set('province')} className={inputClass('province')} required />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">2. Penanggung Jawab</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Nama *</label>
                                <input value={form.contactName} onChange={set('contactName')} className={inputClass('contactName')} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">No. HP/WA *</label>
                                <input value={form.contactPhone} onChange={set('contactPhone')} inputMode="tel" className={inputClass('contactPhone')} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Email</label>
                                <input type="email" value={form.contactEmail} onChange={set('contactEmail')} className={inputClass('contactEmail')} />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">3. Pemilihan &amp; Akun Admin</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Judul pemilihan *</label>
                                <input value={form.eventTitle} onChange={set('eventTitle')} placeholder="Contoh: Pemilihan Ketua OSIS" className={inputClass('eventTitle')} required />
                                <p className="text-xs text-gray-500 mt-1">Bisa diubah kapan saja di menu Pengaturan.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Nama admin *</label>
                                <input value={form.adminName} onChange={set('adminName')} className={inputClass('adminName')} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Username admin *</label>
                                <input value={form.adminUsername} onChange={set('adminUsername')} autoComplete="username" className={inputClass('adminUsername')} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Password *</label>
                                <input type="password" value={form.adminPassword} onChange={set('adminPassword')} minLength={8} autoComplete="new-password" className={inputClass('adminPassword')} required />
                                <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1">Ulangi password *</label>
                                <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} minLength={8} autoComplete="new-password" className={inputClass('adminPassword')} required />
                            </div>
                        </div>
                    </section>

                    {/* Honeypot anti-bot: tersembunyi dari manusia */}
                    <input
                        value={form.website}
                        onChange={set('website')}
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        className="hidden"
                    />

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-lg text-lg"
                    >
                        {submitting ? 'Mengirim pendaftaran...' : 'Kirim Pendaftaran'}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        Sudah terdaftar? <Link href="/admin/login" className="text-blue-600 font-medium hover:underline">Masuk sebagai admin</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
