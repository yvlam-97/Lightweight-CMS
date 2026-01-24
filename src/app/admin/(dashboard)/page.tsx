import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerEnabledPlugins } from '@/lib/plugins/server'

async function getStats() {
  const [newsCount, pagesCount] = await Promise.all([
    prisma.newsPost.count(),
    prisma.page.count(),
  ])

  return { newsCount, pagesCount }
}

async function getConcertStats() {
  // Only get concert stats if the plugin exists in schema
  try {
    const [concertsCount, upcomingConcerts] = await Promise.all([
      prisma.concert.count(),
      prisma.concert.count({
        where: {
          date: { gte: new Date() },
          published: true,
        },
      }),
    ])
    return { concertsCount, upcomingConcerts }
  } catch {
    return null
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()
  const enabledPlugins = await getServerEnabledPlugins()
  const concertPluginEnabled = enabledPlugins.some((p) => p.id === 'concerts')
  const concertStats = concertPluginEnabled ? await getConcertStats() : null

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="News Posts"
          value={stats.newsCount}
          href="/admin/news"
          color="bg-blue-600"
        />
        <StatCard
          title="Pages"
          value={stats.pagesCount}
          href="/admin/pages"
          color="bg-green-600"
        />
        {concertStats && (
          <>
            <StatCard
              title="Concerts"
              value={concertStats.concertsCount}
              href="/admin/p/concerts"
              color="bg-purple-600"
            />
            <StatCard
              title="Upcoming Shows"
              value={concertStats.upcomingConcerts}
              href="/admin/p/concerts"
              color="bg-orange-600"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/news/new" className="btn-primary">
            New Post
          </Link>
          {concertPluginEnabled && (
            <Link href="/admin/p/concerts/new" className="btn-primary">
              Add Concert
            </Link>
          )}
          <Link href="/admin/pages/new" className="btn-secondary">
            New Page
          </Link>
          <Link href="/admin/settings" className="btn-secondary">
            Settings
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  href,
  color,
}: {
  title: string
  value: number
  href: string
  color: string
}) {
  return (
    <Link href={href} className="card p-6 hover:shadow-lg transition-shadow">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
        <span className="text-white text-xl font-bold">{value}</span>
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </Link>
  )
}
