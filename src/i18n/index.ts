import createMiddleware from 'next-intl/middleware'

// Re-export locale utilities for convenience
export { locales, defaultLocale, localeNames, localeFlags, type Locale } from './config'
export { getLocale, setLocale } from './actions'
