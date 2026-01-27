'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateSlug } from '@/lib/utils'

interface Album {
    id: string
    title: string
    slug: string
    description: string | null
    coverPhotoId: string | null
    published: boolean
}

interface Props {
    album?: Album
}

export function AlbumForm({ album }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        title: album?.title || '',
        slug: album?.slug || '',
        description: album?.description || '',
        published: album?.published || false,
    })

    const handleTitleChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            title: value,
            // Only auto-generate slug for new albums
            slug: album ? prev.slug : generateSlug(value),
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const url = album ? `/api/p/photos/${album.id}` : '/api/p/photos'
            const method = album ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Something went wrong')
            }

            const savedAlbum = await res.json()

            // For new albums, redirect to edit page to add photos
            if (!album) {
                router.push(`/admin/p/photos/${savedAlbum.id}`)
            } else {
                router.push('/admin/p/photos')
            }
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
            )}

            <div className="card p-6 space-y-6">
                <div>
                    <label htmlFor="title" className="label">
                        Album Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="input"
                        placeholder="Summer Vacation 2024"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="slug" className="label">
                        URL Slug
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">/photos/</span>
                        <input
                            id="slug"
                            type="text"
                            value={formData.slug}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, slug: e.target.value }))
                            }
                            className="input flex-1"
                            placeholder="summer-vacation-2024"
                            required
                        />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        The URL-friendly version of the album name
                    </p>
                </div>

                <div>
                    <label htmlFor="description" className="label">
                        Description (optional)
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        className="input"
                        rows={3}
                        placeholder="A brief description of this album..."
                    />
                </div>

                <div className="flex items-center gap-3">
                    <input
                        id="published"
                        type="checkbox"
                        checked={formData.published}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, published: e.target.checked }))
                        }
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="published" className="label !mb-0">
                        Published
                    </label>
                </div>
                <p className="text-sm text-gray-500 -mt-4">
                    Unpublished albums are only visible to admins
                </p>
            </div>

            <div className="flex gap-4">
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : album ? 'Save Changes' : 'Create Album'}
                </button>
                <Link href="/admin/p/photos" className="btn-secondary">
                    Cancel
                </Link>
            </div>
        </form>
    )
}
