'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface Album {
    id: string
    title: string
    slug: string
    description: string | null
    published: boolean
    photoCount: number
    coverImage: string | null
}

interface Props {
    params?: Record<string, string>
    pluginId: string
    publicPath: string
}

export function GalleryPage({ publicPath }: Props) {
    const [albums, setAlbums] = useState<Album[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const t = useTranslations('photos')

    useEffect(() => {
        async function fetchAlbums() {
            try {
                const res = await fetch('/api/p/photos?published=true')
                if (!res.ok) throw new Error('Failed to fetch albums')
                const data = await res.json()
                setAlbums(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load albums')
            } finally {
                setLoading(false)
            }
        }

        fetchAlbums()
    }, [])

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
                {t('title')}
            </h1>

            {albums.length === 0 ? (
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
                    <p className="text-gray-500 dark:text-gray-400">{t('noAlbums')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {albums.map((album) => (
                        <Link
                            key={album.id}
                            href={`${publicPath}/${album.slug}`}
                            className="group block"
                        >
                            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-lg">
                                {album.coverImage ? (
                                    <img
                                        src={album.coverImage}
                                        alt={album.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg
                                            className="w-20 h-20 text-gray-400"
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
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                                {/* Album info */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <h2 className="font-bold text-xl mb-1 group-hover:text-primary-300 transition-colors">
                                        {album.title}
                                    </h2>
                                    {album.description && (
                                        <p className="text-white/80 text-sm line-clamp-2 mb-2">
                                            {album.description}
                                        </p>
                                    )}
                                    <p className="text-white/60 text-sm">
                                        {album.photoCount} {album.photoCount === 1 ? 'photo' : 'photos'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
