'use client'

import { useParams } from 'next/navigation'
import MonitoringView from '@/components/MonitoringView'

export default function SchoolMonitoringPage() {
    const params = useParams()
    return <MonitoringView npsn={params.npsn as string} />
}
