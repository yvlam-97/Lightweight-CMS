import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import { PluginProvider } from '@/lib/plugins/context'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Site',
  description: 'My lightweight CMS website',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <NextIntlClientProvider messages={messages}>
              <PluginProvider>{children}</PluginProvider>
            </NextIntlClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
