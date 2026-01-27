'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { PhotoGrid, Lightbox } from '../components'

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
    publicPath: string
}

export function AlbumViewPage({ params, publicPath }: Props) {
    const slug = params?.slug
    const [album, setAlbum] = useState<Album | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
    const t = useTranslations('photos')

    useEffect(() => {
        async function fetchAlbum() {
            if (!slug) return

            try {
                const res = await fetch(`/api/p/photos/album/${slug}`)
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error('Album not found')
                    }
                    throw new Error('Failed to fetch album')
                }
                const data = await res.json()
                setAlbum(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load album')
            } finally {
                setLoading(false)
            }
        }

        fetchAlbum()
    }, [slug])

    const handlePhotoClick = (photo: Photo, index: number) => {
        setLightboxIndex(index)
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            </div>
        )
    }

    if (error || !album) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error || 'Album not found'}</p>
                    <Link
                        href={publicPath}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        ← Back to albums
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Breadcrumb */}
            <nav className="mb-6">
                <Link
                    href={publicPath}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                >
                    ← {t('title')}
                </Link>
            </nav>

            {/* Album Header */}
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {album.title}
                </h1>
                {album.description && (
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        {album.description}
                    </p>
                )}
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {album.photos.length} {album.photos.length === 1 ? 'photo' : 'photos'}
                </p>
            </header>

            {/* Photo Grid */}
            {album.photos.length === 0 ? (
                <div className="text-center py-12">
                    <svg
                        className="mx-auto h-16 w-16 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">{t('emptyAlbum')}</p>
                </div>
            ) : (
                <PhotoGrid
                    photos={album.photos}
                    onPhotoClick={handlePhotoClick}
                    editable={false}
                />
            )}

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <Lightbox
                    photos={album.photos}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </div>
    )
}
