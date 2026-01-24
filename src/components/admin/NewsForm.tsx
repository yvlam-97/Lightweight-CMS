'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface NewsPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  imageUrl: string | null
  published: boolean
  featured: boolean
}

interface Props {
  post?: NewsPost
}

export function NewsForm({ post }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    imageUrl: post?.imageUrl || '',
    published: post?.published || false,
    featured: post?.featured || false,
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

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
      const url = post ? `/api/admin/news/${post.id}` : '/api/admin/news'
      const method = post ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      router.push('/admin/news')
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
          <label htmlFor="title" className="label">Title</label>
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
          <p className="text-sm text-gray-500 mt-1">URL: /news/{formData.slug || 'your-slug'}</p>
        </div>

        <div>
          <label htmlFor="excerpt" className="label">Excerpt</label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            className="input"
            rows={2}
            required
          />
          <p className="text-sm text-gray-500 mt-1">A short summary shown in listings</p>
        </div>

        <div>
          <label htmlFor="content" className="label">Content (Markdown)</label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="input font-mono"
            rows={15}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Supports: # headers, **bold**, *italic*, - lists, [links](url)
          </p>
        </div>

        <div>
          <label htmlFor="imageUrl" className="label">Image URL (optional)</label>
          <input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
            className="input"
            placeholder="https://example.com/image.jpg"
          />
          {formData.imageUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <img 
                src={formData.imageUrl} 
                alt="Preview" 
                className="max-h-48 rounded-lg border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
            />
            <span>Published</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
            />
            <span>Featured</span>
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </button>
        <Link href="/admin/news" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  )
}
