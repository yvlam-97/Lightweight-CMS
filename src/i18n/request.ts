import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { defaultLocale, locales, type Locale } from './config'
import { getPluginTranslations } from '@/lib/plugins/server'
import { prisma } from '@/lib/prisma'

async function getDefaultLocaleFromDb(): Promise<Locale> {
    try {
        const settings = await prisma.siteSettings.findUnique({
            where: { id: 'main' },
            select: { defaultLocale: true },
        })
        const dbLocale = settings?.defaultLocale as Locale | undefined
        if (dbLocale && locales.includes(dbLocale)) {
            return dbLocale
        }
    } catch {
        // Database might not be initialized yet
    }
    return defaultLocale
}

export default getRequestConfig(async () => {
    // Get locale from cookie first
    const cookieStore = await cookies()
    const cookieLocale = cookieStore.get('locale')?.value as Locale | undefined

    // If no cookie, use database setting, then fallback to config default
    let locale: Locale
    if (cookieLocale && locales.includes(cookieLocale)) {
        locale = cookieLocale
    } else {
        locale = await getDefaultLocaleFromDb()
    }

    // Load core translations
    const coreMessages = (await import(`./messages/${locale}.json`)).default

    // Load and merge plugin translations
    const pluginMessages = await getPluginTranslations(locale)

    return {
        locale,
        messages: {
            ...coreMessages,
            ...pluginMessages,
        },
    }
})
