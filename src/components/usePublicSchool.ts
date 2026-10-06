'use client'

import { useEffect, useState } from 'react'

export interface PublicSchoolInfo {
    npsn: string
    level: string
    schoolName: string
    schoolShortName: string
    eventTitle: string
    eventYear: string
}

// Ambil info publik sekolah aktif berdasarkan NPSN
export function usePublicSchool(npsn: string) {
    const [school, setSchool] = useState<PublicSchoolInfo | null>(null)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        if (!npsn) return
        fetch(`/api/public/schools/${encodeURIComponent(npsn)}`)
            .then(res => {
                if (!res.ok) throw new Error('not found')
                return res.json()
            })
            .then(setSchool)
            .catch(() => setNotFound(true))
    }, [npsn])

    return { school, notFound }
}
