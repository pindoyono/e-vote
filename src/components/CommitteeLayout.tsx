'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
    Users,
    UserCheck,
    LogOut,
    User,
    Home,
    Shield
} from 'lucide-react'
import Link from 'next/link'

interface CommitteeLayoutProps {
    children: React.ReactNode
}

export default function CommitteeLayout({ children }: CommitteeLayoutProps) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [config, setConfig] = useState({
        schoolShortName: 'SMK N2 Malinau',
        eventYear: '2025'
    })

    useEffect(() => {
        fetch('/api/admin/config')
            .then(res => res.json())
            .then(data => {
                setConfig({
                    schoolShortName: data.schoolShortName || 'SMK N2 Malinau',
                    eventYear: data.eventYear || '2025'
                })
            })
            .catch(err => console.error('Failed to load config:', err))
    }, [])

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/committee/login')
        } else if (status === 'authenticated' && session?.user?.role !== 'committee') {
            router.push('/committee/login')
        }
    }, [status, session, router])

    const handleLogout = async () => {
        await signOut({
            redirect: true,
            callbackUrl: '/committee/login'
        })
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
            </div>
        )
    }

    if (status === 'unauthenticated' || session?.user?.role !== 'committee') {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-green-600 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo & Title */}
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/20 rounded-lg p-2">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white">
                                    Portal Panitia
                                </h1>
                                <p className="text-green-100 text-xs">
                                    {config.schoolShortName}
                                </p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link
                                href="/committee/verification"
                                className="flex items-center space-x-2 text-green-100 hover:text-white transition-colors"
                            >
                                <UserCheck className="h-4 w-4" />
                                <span>Verifikasi</span>
                            </Link>
                            <Link
                                href="/monitoring"
                                className="flex items-center space-x-2 text-green-100 hover:text-white transition-colors"
                            >
                                <Shield className="h-4 w-4" />
                                <span>Monitor</span>
                            </Link>
                            <Link
                                href="/"
                                className="flex items-center space-x-2 text-green-100 hover:text-white transition-colors"
                            >
                                <Home className="h-4 w-4" />
                                <span>Beranda</span>
                            </Link>
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:block text-right">
                                <p className="text-white text-sm font-medium">
                                    {session.user.name}
                                </p>
                                <p className="text-green-100 text-xs">
                                    Panitia Verifikasi
                                </p>
                            </div>
                            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 text-green-100 hover:text-white transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden md:inline">Keluar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            <nav className="md:hidden bg-green-700 px-4 py-3">
                <div className="flex justify-center space-x-6">
                    <Link
                        href="/committee/verification"
                        className="flex items-center space-x-2 text-green-100 hover:text-white transition-colors"
                    >
                        <UserCheck className="h-4 w-4" />
                        <span className="text-sm">Verifikasi</span>
                    </Link>
                    <Link
                        href="/monitoring"
                        className="flex items-center space-x-2 text-green-100 hover:text-white transition-colors"
                    >
                        <Shield className="h-4 w-4" />
                        <span className="text-sm">Monitor</span>
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center space-x-2 text-green-100 hover:text-white transition-colors"
                    >
                        <Home className="h-4 w-4" />
                        <span className="text-sm">Beranda</span>
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600 text-sm">
                            © {config.eventYear} {config.schoolShortName} - Portal Panitia E-Vote
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                            <span className="text-green-600 font-medium">
                                Sistem Verifikasi Pemilih
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}