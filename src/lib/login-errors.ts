// Pesan untuk kode error dari authorize() (result.error di signIn); dipakai juga di halaman login (client)
export const LOGIN_ERRORS: Record<string, string> = {
    SCHOOL_PENDING: 'Pendaftaran sekolah masih menunggu persetujuan pengelola platform.',
    SCHOOL_REJECTED: 'Pendaftaran sekolah ditolak. Hubungi pengelola platform.',
    SCHOOL_SUSPENDED: 'Akun sekolah sedang dinonaktifkan. Hubungi pengelola platform.',
}

export function loginErrorMessage(code: string | undefined, fallback: string) {
    return (code && LOGIN_ERRORS[code]) || fallback
}

// NPSN terakhir yang dipakai login di perangkat ini, agar tidak perlu diketik ulang
export function rememberedNpsn(): string {
    if (typeof window === 'undefined') return ''
    const fromQuery = new URLSearchParams(window.location.search).get('npsn')
    if (fromQuery) return fromQuery.toUpperCase()
    try {
        return localStorage.getItem('evote:npsn') || ''
    } catch {
        return ''
    }
}

export function rememberNpsn(npsn: string) {
    try {
        localStorage.setItem('evote:npsn', npsn.trim().toUpperCase())
    } catch {
        // abaikan jika storage tidak tersedia
    }
}
