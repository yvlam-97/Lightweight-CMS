'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { ConcertForm } from '../components/ConcertForm'

interface Concert {
  id: string
  title: string
  venue: string
  city: string
  date: Date
  time: string
  description: string | null
  ticketUrl: string | null
  imageUrl: string | null
  published: boolean
}

interface Props {
  params?: Record<string, string>
  pluginId: string
}

export function ConcertEditPage({ params }: Props) {
  const id = params?.id
  const [concert, setConcert] = useState<Concert | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConcert() {
      if (!id) {
        setError('not-found')
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/p/concerts/${id}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError('not-found')
          } else {
            throw new Error('Failed to fetch concert')
          }
          return
        }
        const data = await res.json()
        setConcert(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load concert')
      } finally {
        setLoading(false)
      }
    }

    fetchConcert()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error === 'not-found') {
    notFound()
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!concert) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Edit Concert
      </h1>
      <ConcertForm concert={concert} />
    </div>
  )
}
