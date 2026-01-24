'use client'

import { ConcertForm } from '../components/ConcertForm'

interface Props {
  params?: Record<string, string>
  pluginId: string
}

export function ConcertNewPage({ pluginId }: Props) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Add Concert
      </h1>
      <ConcertForm />
    </div>
  )
}
