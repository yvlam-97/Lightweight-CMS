'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PhotoUploader, PhotoGrid } from '../components'

interface Photo {
    id: string
    url: string
    thumbnailUrl: string | null
    filename: string
    title: string | null
    caption: string | null
    altText: string | null
    width: number | null
    height: number | null
    order: number
}

interface Album {
    id: string
    title: string
    slug: string
    description: string | null
    coverPhotoId: string | null
    published: boolean
    photos: Photo[]
}

interface Props {
    params?: Record<string, string>
    pluginId: string
}

export function AlbumEditPage({ params, pluginId }: Props) {
    const router = useRouter()
    const albumId = params?.id

    const [album, setAlbum] = useState<Album | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        published: false,
        coverPhotoId: null as string | null,
    })

    const fetchAlbum = useCallback(async () => {
        if (!albumId) return

        try {
            const res = await fetch(`/api/p/photos/${albumId}`)
            if (!res.ok) throw new Error('Failed to fetch album')
            const data = await res.json()
            setAlbum(data)
            setFormData({
                title: data.title,
                slug: data.slug,
                description: data.description || '',
                published: data.published,
                coverPhotoId: data.coverPhotoId,
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load album')
        } finally {
            setLoading(false)
        }
    }, [albumId])

    useEffect(() => {
        fetchAlbum()
    }, [fetchAlbum])

    const handleSave = async () => {
        if (!albumId) return
        setSaving(true)
        setError(null)

        try {
            const res = await fetch(`/api/p/photos/${albumId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to save album')
            }

            router.push('/admin/p/photos')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save album')
        } finally {
            setSaving(false)
        }
    }

    const handleUploadComplete = () => {
        fetchAlbum() // Refresh to show new photos
    }

    const handleReorder = async (photoIds: string[]) => {
        if (!albumId) return

        // Optimistic update
        setAlbum((prev) => {
            if (!prev) return prev
            const reordered = photoIds.map(
                (id, index) =>
                    ({ ...prev.photos.find((p) => p.id === id)!, order: index } as Photo)
            )
            return { ...prev, photos: reordered }
        })

        // Save to server
        await fetch(`/api/p/photos/${albumId}/reorder`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photoIds }),
        })
    }

    const handleDeletePhoto = async (photoId: string) => {
        if (!album) return

        // Save original state for rollback
        const originalPhotos = album.photos

        // Optimistic update
        setAlbum((prev) => {
            if (!prev) return prev
            return {
                ...prev,
                photos: prev.photos.filter((p) => p.id !== photoId),
            }
        })

        try {
            // Delete from server
            const res = await fetch(`/api/p/photos/photo/${photoId}`, {
                method: 'DELETE',
            })

            if (!res.ok) {
                throw new Error('Failed to delete photo')
            }

            // If deleted photo was the cover, clear cover
            if (formData.coverPhotoId === photoId) {
                setFormData((prev) => ({ ...prev, coverPhotoId: null }))
            }
        } catch (err) {
            // Rollback on error
            setAlbum((prev) => {
                if (!prev) return prev
                return { ...prev, photos: originalPhotos }
            })
            setError(err instanceof Error ? err.message : 'Failed to delete photo')
        }
    }

    const handleSetCover = async (photoId: string) => {
        if (!albumId) return

        // Save previous cover for rollback
        const previousCoverPhotoId = formData.coverPhotoId

        // Optimistic update
        setFormData((prev) => ({ ...prev, coverPhotoId: photoId }))

        try {
            // Build updated formData with new cover photo
            const updatedData = {
                ...formData,
                coverPhotoId: photoId,
            }

            const res = await fetch(`/api/p/photos/${albumId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            })

            if (!res.ok) {
                throw new Error('Failed to set cover photo')
            }
        } catch (err) {
            // Rollback on error
            setFormData((prev) => ({ ...prev, coverPhotoId: previousCoverPhotoId }))
            setError(err instanceof Error ? err.message : 'Failed to set cover photo')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (!album) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{error || 'Album not found'}</p>
                <Link href="/admin/p/photos" className="btn-secondary mt-4">
                    Back to Albums
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Edit Album
                </h1>
                <div className="flex gap-4">
                    <Link href="/admin/p/photos" className="btn-secondary">
                        Cancel
                    </Link>
                    <button
                        onClick={handleSave}
                        className="btn-primary"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
            )}

            {/* Album Details */}
            <div className="card p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Album Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="title" className="label">
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, title: e.target.value }))
                            }
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="slug" className="label">
                            URL Slug
                        </label>
                        <input
                            id="slug"
                            type="text"
                            value={formData.slug}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, slug: e.target.value }))
                            }
                            className="input"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="label">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        className="input"
                        rows={3}
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
            </div>

            {/* Upload Photos */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Upload Photos
                </h2>
                <PhotoUploader
                    albumId={albumId!}
                    onUploadComplete={handleUploadComplete}
                    onError={(err) => setError(err)}
                />
            </div>

            {/* Photo Grid */}
            <div className="card p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Photos ({album.photos.length})
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Drag to reorder • Click star to set cover
                    </p>
                </div>
                <PhotoGrid
                    photos={album.photos}
                    coverPhotoId={formData.coverPhotoId}
                    editable
                    onReorder={handleReorder}
                    onDelete={handleDeletePhoto}
                    onSetCover={handleSetCover}
                />
            </div>
        </div>
    )
}
