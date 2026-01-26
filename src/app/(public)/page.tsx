import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { getEnabledHomepageSections, getServerEnabledPlugins } from '@/lib/plugins/server'
import { getTranslations, getLocale } from 'next-intl/server'
import { nl, enGB } from 'date-fns/locale'

const dateLocales = {
  en: enGB,
  nl: nl,
}

async function getData() {
  const [settings, news] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 'main' } }),
    prisma.newsPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ])

  return { settings, news }
}

export default async function HomePage() {
  const { settings, news } = await getData()
  const enabledPlugins = await getServerEnabledPlugins()
  const homepageSections = await getEnabledHomepageSections()
  const t = await getTranslations('home')
  const tNews = await getTranslations('news')
  const tCommon = await getTranslations('common')
  const locale = await getLocale() as 'en' | 'nl'
  const dateLocale = dateLocales[locale]

  // Get primary CTA link from enabled plugins (first one with a public path)
  const primaryPlugin = enabledPlugins.find(p => p.defaultPublicPath || p.customPublicPath)
  const primaryCtaPath = primaryPlugin
    ? (primaryPlugin.customPublicPath || primaryPlugin.defaultPublicPath)
    : null
  const primaryCtaLabel = primaryPlugin?.adminNavigation?.name
    ? `View ${primaryPlugin.adminNavigation.name}`
    : null

  const primaryColor = settings?.primaryColor || '#dc2626'
  const heroImageUrl = settings?.heroImageUrl

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative text-white min-h-[500px] flex items-center"
        style={{
          background: heroImageUrl
            ? `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${heroImageUrl}) center/cover no-repeat`
            : `linear-gradient(to bottom right, #111827, ${primaryColor}22, #000000)`
        }}
      >
        {!heroImageUrl && <div className="absolute inset-0 bg-black/40" />}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {settings?.siteName || 'Welcome'}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              {settings?.tagline || 'Welcome to our site'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryCtaPath && primaryCtaLabel && (
                <Link
                  href={primaryCtaPath}
                  className="btn-primary text-lg px-8 py-3"
                >
                  {primaryCtaLabel}
                </Link>
              )}
              <Link
                href="/news"
                className="btn bg-white/10 text-white hover:bg-white/20 text-lg px-8 py-3 border border-white/30"
              >
                {t('latestNews')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Plugin Homepage Sections - Dynamically rendered */}
      {homepageSections.map(({ pluginId, publicPath, component: SectionComponent }) => (
        <SectionComponent
          key={pluginId}
          pluginId={pluginId}
          publicPath={publicPath}
        />
      ))}

      {/* Latest News Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{t('latestNews')}</h2>
            <Link href="/news" className="text-primary-600 hover:text-primary-700 font-medium">
              {tCommon('viewAll')} →
            </Link>
          </div>

          {news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {news.map((post) => (
                <Link key={post.id} href={`/news/${post.slug}`} className="card group">
                  {post.imageUrl && (
                    <div className="aspect-video bg-gray-200 overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="text-sm text-gray-500 mb-2">
                      {format(new Date(post.createdAt), 'MMMM d, yyyy', { locale: dateLocale })}
                    </div>
                    <h3 className="font-bold text-xl mb-2 group-hover:text-primary-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{tNews('noNews')}</p>
          )}
        </div>
      </section>
    </div>
  )
}
