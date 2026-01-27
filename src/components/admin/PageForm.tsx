'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateSlug } from '@/lib/utils'

interface Page {
  id: string
  title: string
  slug: string
  content: string
  published: boolean
}

interface Props {
  page?: Page
}

export function PageForm({ page }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || '',
    published: page?.published || false,
  })

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = page ? `/api/admin/page/${page.id}` : '/api/admin/page'
      const method = page ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      router.push('/admin/pages')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="card p-6 space-y-6">
        <div>
          <label htmlFor="title" className="label">Page Title</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={handleTitleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label htmlFor="slug" className="label">Slug</label>
          <input
            id="slug"
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            className="input"
            required
          />
          <p className="text-sm text-gray-500 mt-1">URL: /page/{formData.slug || 'your-slug'}</p>
        </div>

        <div>
          <label htmlFor="content" className="label">Content (Markdown)</label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="input font-mono"
            rows={20}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Supports: # headers, **bold**, *italic*, - lists, [links](url)
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
            />
            <span>Published</span>
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : page ? 'Update Page' : 'Create Page'}
        </button>
        <Link href="/admin/pages" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  )
}
