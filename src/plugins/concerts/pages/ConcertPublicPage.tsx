'use client'

import { useEffect, useState } from 'react'
import { format, isBefore, startOfDay } from 'date-fns'

interface Concert {
  id: string
  title: string
  venue: string
  city: string
  date: string
  time: string
  description: string | null
  ticketUrl: string | null
  imageUrl: string | null
  published: boolean
}

interface Props {
  params?: Record<string, string>
  pluginId: string
  publicPath: string
}

export function ConcertPublicPage({ pluginId }: Props) {
  const [concerts, setConcerts] = useState<Concert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConcerts() {
      try {
        // Use the public API endpoint - only returns published concerts
        const res = await fetch('/api/p/concerts?published=true')
        if (!res.ok) throw new Error('Failed to fetch concerts')
        const data = await res.json()
        setConcerts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load concerts')
      } finally {
        setLoading(false)
      }
    }

    fetchConcerts()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  const today = startOfDay(new Date())
  const upcomingConcerts = concerts.filter(
    (c) => !isBefore(new Date(c.date), today)
  )
  const pastConcerts = concerts.filter((c) => isBefore(new Date(c.date), today))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Concerts
      </h1>

      {/* Upcoming Concerts */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Upcoming Shows
        </h2>

        {upcomingConcerts.length > 0 ? (
          <div className="space-y-4">
            {upcomingConcerts.map((concert) => (
              <div
                key={concert.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col md:flex-row border-l-4 border-primary-600"
              >
                {/* Image */}
                {concert.imageUrl && (
                  <div className="md:w-48 h-32 md:h-auto flex-shrink-0">
                    <img
                      src={concert.imageUrl}
                      alt={concert.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6 flex flex-col md:flex-row md:items-center gap-4 flex-1">
                  {/* Date */}
                  <div className="flex-shrink-0 text-center md:w-24">
                    <div className="text-3xl font-bold text-primary-600">
                      {format(new Date(concert.date), 'd')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                      {format(new Date(concert.date), 'MMM yyyy')}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 md:border-l md:border-gray-200 dark:md:border-gray-700 md:pl-6">
                    <h3 className="font-bold text-xl mb-1 text-gray-900 dark:text-white">
                      {concert.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {concert.venue}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {concert.city} • {concert.time}
                    </p>
                    {concert.description && (
                      <p className="text-gray-600 dark:text-gray-300 mt-2">
                        {concert.description}
                      </p>
                    )}
                  </div>

                  {/* Ticket Button */}
                  {concert.ticketUrl && (
                    <div className="flex-shrink-0">
                      <a
                        href={concert.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                      >
                        Get Tickets
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No upcoming shows scheduled.
            </p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">
              Check back soon for new dates!
            </p>
          </div>
        )}
      </section>

      {/* Past Concerts */}
      {pastConcerts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Past Shows
          </h2>
          <div className="space-y-3">
            {pastConcerts.map((concert) => (
              <div
                key={concert.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col md:flex-row opacity-60"
              >
                {/* Image */}
                {concert.imageUrl && (
                  <div className="md:w-32 h-24 md:h-auto flex-shrink-0">
                    <img
                      src={concert.imageUrl}
                      alt={concert.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4 flex flex-col md:flex-row md:items-center gap-4 flex-1">
                  <div className="flex-shrink-0 md:w-24 text-center">
                    <div className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                      {format(new Date(concert.date), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="flex-1 md:border-l md:border-gray-200 dark:md:border-gray-700 md:pl-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {concert.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {concert.venue} • {concert.city}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
