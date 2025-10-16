import Link from 'next/link'
import { Vote, Users, BarChart3, Shield } from 'lucide-react'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
            {/* Hero Section */}
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Logo/Icon */}
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-2xl mb-6">
                            <Vote className="w-12 h-12 text-blue-600" />
                        </div>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                        E-VOTE
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-semibold text-blue-200 mb-6">
                        Pemilihan Ketua OSIS
                    </h2>
                    <h3 className="text-xl md:text-2xl text-blue-300 mb-8">
                        SMK Negeri 2 Malinau
                    </h3>

                    {/* Description */}
                    <p className="text-lg text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Sistem pemilihan elektronik yang aman, transparan, dan modern untuk
                        memilih ketua OSIS periode 2025. Setiap suara berharga dan akan dihitung
                        dengan akurat.
                    </p>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                            <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
                            <h4 className="text-xl font-semibold text-white mb-2">Aman</h4>
                            <p className="text-blue-200 text-sm">
                                Sistem keamanan berlapis dengan verifikasi identitas
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                            <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                            <h4 className="text-xl font-semibold text-white mb-2">Transparan</h4>
                            <p className="text-blue-200 text-sm">
                                Monitoring hasil secara realtime dan akurat
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                            <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                            <h4 className="text-xl font-semibold text-white mb-2">Modern</h4>
                            <p className="text-blue-200 text-sm">
                                Interface yang mudah digunakan dan responsive
                            </p>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
                        <Link
                            href="/admin/login"
                            className="bg-white hover:bg-gray-100 text-blue-900 font-bold py-4 px-6 rounded-lg transition-colors duration-200 shadow-lg flex items-center justify-center space-x-2"
                        >
                            <Shield className="h-5 w-5" />
                            <span>Admin Panel</span>
                        </Link>
                        <Link
                            href="/committee/login"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 shadow-lg flex items-center justify-center space-x-2"
                        >
                            <Users className="h-5 w-5" />
                            <span>Portal Panitia</span>
                        </Link>
                        <Link
                            href="/monitoring"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 shadow-lg flex items-center justify-center space-x-2"
                        >
                            <BarChart3 className="h-5 w-5" />
                            <span>Monitoring</span>
                        </Link>
                    </div>

                    {/* Role Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <h4 className="text-lg font-semibold text-white mb-2">Administrator</h4>
                            <p className="text-blue-200 text-sm">
                                Kelola data pemilih, atur sistem, dan kontrol penuh aplikasi
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <h4 className="text-lg font-semibold text-white mb-2">Panitia</h4>
                            <p className="text-blue-200 text-sm">
                                Verifikasi pemilih dan generate URL voting untuk siswa
                            </p>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="mt-12 bg-yellow-100 border border-yellow-300 rounded-lg p-6 text-yellow-800">
                        <h4 className="font-semibold mb-2">Informasi Penting:</h4>
                        <ul className="text-sm space-y-1 text-left max-w-lg mx-auto">
                            <li>• Pemilihan dilakukan secara online dengan URL unik</li>
                            <li>• Setiap pemilih harus diverifikasi terlebih dahulu oleh panitia</li>
                            <li>• Satu pemilih hanya dapat memberikan satu suara</li>
                            <li>• Hasil dapat dipantau secara realtime</li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="mt-16 pt-8 border-t border-white/20">
                        <p className="text-blue-300 text-sm">
                            © 2025 SMK Negeri 2 Malinau - Sistem E-Voting Pemilihan Ketua OSIS
                        </p>
                        <p className="text-blue-400 text-xs mt-2">
                            Dikembangkan dengan teknologi Next.js dan keamanan tingkat tinggi
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}