'use client'

import { useEffect, useState } from 'react'

export default function TestPage() {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/voters')
            .then(res => res.json())
            .then(data => {
                console.log('Voters API Response:', data)
                setData(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('API Error:', err)
                setError(err.message)
                setLoading(false)
            })
    }, [])

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">API Test</h1>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    )
}