import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import { PluginProvider } from '@/lib/plugins/context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Site',
  description: 'My lightweight CMS website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <PluginProvider>{children}</PluginProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
