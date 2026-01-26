'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setLocale } from '@/i18n/actions'
import { locales, localeFlags, localeNames, type Locale } from '@/i18n/config'

interface LanguageSwitcherProps {
    currentLocale: Locale
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleLocaleChange = (newLocale: Locale) => {
        if (newLocale === currentLocale) return

        startTransition(async () => {
            await setLocale(newLocale)
            router.refresh()
        })
    }

    return (
        <div className="flex items-center gap-1">
            {locales.map((locale) => (
                <button
                    key={locale}
                    onClick={() => handleLocaleChange(locale)}
                    disabled={isPending}
                    className={`
            relative p-1.5 rounded-md transition-all duration-200
            ${currentLocale === locale
                            ? 'bg-primary-500/20 ring-2 ring-primary-500'
                            : 'hover:bg-gray-700/50 opacity-60 hover:opacity-100'
                        }
            ${isPending ? 'cursor-wait' : 'cursor-pointer'}
          `}
                    title={localeNames[locale]}
                    aria-label={`Switch to ${localeNames[locale]}`}
                >
                    <span className="text-xl leading-none" role="img" aria-label={localeNames[locale]}>
                        {localeFlags[locale]}
                    </span>
                </button>
            ))}
        </div>
    )
}
