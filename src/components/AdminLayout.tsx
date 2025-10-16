'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import {
    Users,
    UserCheck,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    RotateCcw
} from 'lucide-react'
import { useState } from 'react'

interface AdminLayoutProps {
    children: ReactNode
}

const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/voters', label: 'Data Pemilih', icon: Users },
    { href: '/admin/candidates', label: 'Kandidat', icon: UserCheck },
    { href: '/admin/verification', label: 'Verifikasi', icon: UserCheck },
    { href: '/admin/vote-management', label: 'Manajemen Vote', icon: RotateCcw },
    { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { data: session } = useSession()
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-center justify-between h-16 px-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">E-Vote Admin</h2>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="mt-6">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Icon className="mr-3 h-5 w-5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-6 border-t">
                    <div className="flex items-center mb-4">
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">
                                {session?.user?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                @{session?.user?.username}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Keluar
                    </button>
                </div>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 lg:ml-0">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="flex items-center justify-between h-16 px-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="flex-1 lg:ml-0">
                            <h1 className="text-lg font-semibold text-gray-900">
                                SMK Negeri 2 Malinau - Pemilihan Ketua OSIS 2025
                            </h1>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}