import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { format, Locale } from 'date-fns'
import { HomepageSectionProps } from '@/lib/plugins/types'
import { getTranslations, getLocale } from 'next-intl/server'
import { nl, enGB } from 'date-fns/locale'

const dateLocales: Record<string, Locale> = {
    en: enGB,
    nl: nl,
}

async function getUpcomingConcerts() {
    try {
        const concerts = await prisma.concert.findMany({
            where: {
                published: true,
                date: { gte: new Date() },
            },
            orderBy: { date: 'asc' },
            take: 4,
        })
        return concerts
    } catch {
        return []
    }
}

export async function ConcertsHomepageSection({ publicPath }: HomepageSectionProps) {
    const concerts = await getUpcomingConcerts()
    const t = await getTranslations('concerts')
    const tCommon = await getTranslations('common')
    const locale = await getLocale()
    const dateLocale = dateLocales[locale] || enGB

    return (
        <section className="py-16 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t('upcomingConcerts')}
                    </h2>
                    <Link
                        href={publicPath}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        {tCommon('viewAll')} →
                    </Link>
                </div>

                {concerts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {concerts.map((concert) => (
                            <div
                                key={concert.id}
                                className="card p-6 hover:shadow-lg transition-shadow border-l-4 border-primary-600"
                            >
                                <div className="text-primary-600 font-bold text-sm mb-2">
                                    {format(new Date(concert.date), 'd MMM yyyy', { locale: dateLocale })}
                                </div>
                                <h3 className="font-bold text-lg mb-1 dark:text-white">
                                    {concert.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                    {concert.venue}
                                </p>
                                <p className="text-gray-500 dark:text-gray-500 text-sm">
                                    {concert.city}
                                </p>
                                <p className="text-gray-500 dark:text-gray-500 text-sm">
                                    {concert.time}
                                </p>
                                {concert.ticketUrl && (
                                    <a
                                        href={concert.ticketUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
                                    >
                                        {t('getTickets')} →
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        {t('noUpcoming')}
                    </p>
                )}
            </div>
        </section>
    )
}
