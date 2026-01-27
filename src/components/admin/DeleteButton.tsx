'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  type: 'news' | 'page'
  name: string
  apiPath?: string
  onDeleted?: () => void
}

export function DeleteButton({ id, type, name, apiPath, onDeleted }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    startTransition(async () => {
      const url = apiPath || `/api/admin/${type}/${id}`

      const res = await fetch(url, {
        method: 'DELETE',
      })

      if (res.ok) {
        if (onDeleted) {
          onDeleted()
        } else {
          router.refresh()
        }
        setShowConfirm(false)
      }
    })
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          {isPending ? 'Deleting...' : 'Confirm'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-700"
    >
      Delete
    </button>
  )
}
