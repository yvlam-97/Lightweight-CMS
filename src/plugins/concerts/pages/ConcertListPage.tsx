'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { DeleteButton } from '@/components/admin/DeleteButton'

interface Concert {
  id: string
  title: string
  venue: string
  city: string
  date: string
  time: string
  published: boolean
}

interface Props {
  params?: Record<string, string>
  pluginId: string
}

export function ConcertListPage({ pluginId }: Props) {
  const [concerts, setConcerts] = useState<Concert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConcerts() {
      try {
        const res = await fetch('/api/p/concerts')
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Concerts
        </h1>
        <Link href="/admin/p/concerts/new" className="btn-primary">
          Add Concert
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                Event
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                Venue
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                Date
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                Status
              </th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {concerts.map((concert) => {
              const isPast = new Date(concert.date) < new Date()
              return (
                <tr
                  key={concert.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${isPast ? 'opacity-60' : ''}`}
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {concert.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {concert.city}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {concert.venue}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(concert.date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {concert.time}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${isPast
                          ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          : concert.published
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}
                    >
                      {isPast ? 'Past' : concert.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/p/concerts/${concert.id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        id={concert.id}
                        type="news"
                        name={concert.title}
                        apiPath={`/api/p/concerts/${concert.id}`}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
            {concerts.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  No concerts yet. Add your first concert!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
