'use client'

import { useEffect, useState } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeLoaded, setThemeLoaded] = useState(false)

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const response = await fetch('/api/theme')
                if (response.ok) {
                    const theme = await response.json()

                    // Apply CSS variables
                    document.documentElement.style.setProperty('--color-primary', theme.themePrimary || '#1e40af')
                    document.documentElement.style.setProperty('--color-secondary', theme.themeSecondary || '#3b82f6')
                    document.documentElement.style.setProperty('--color-accent', theme.themeAccent || '#eab308')
                    document.documentElement.style.setProperty('--color-success', theme.themeSuccess || '#16a34a')
                }
            } catch (error) {
                console.error('Failed to load theme:', error)
            } finally {
                setThemeLoaded(true)
            }
        }

        loadTheme()
    }, [])

    // Prevent flash of unstyled content
    if (!themeLoaded) {
        return null
    }

    return <>{children}</>
}
