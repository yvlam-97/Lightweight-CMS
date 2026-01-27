'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DeleteButton } from '@/components/admin/DeleteButton'

interface Album {
    id: string
    title: string
    slug: string
    description: string | null
    published: boolean
    photoCount: number
    coverImage: string | null
    createdAt: string
}

interface Props {
    params?: Record<string, string>
    pluginId: string
}

export function AlbumListPage({ pluginId }: Props) {
    const [albums, setAlbums] = useState<Album[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchAlbums() {
            try {
                const res = await fetch('/api/p/photos')
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

    const handleAlbumDeleted = (albumId: string) => {
        setAlbums((prev) => prev.filter((album) => album.id !== albumId))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
                    Photo Albums
                </h1>
                <Link href="/admin/p/photos/new" className="btn-primary">
                    Create Album
                </Link>
            </div>

            {albums.length === 0 ? (
                <div className="card p-12 text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No albums yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Create your first photo album to get started.
                    </p>
                    <Link href="/admin/p/photos/new" className="btn-primary">
                        Create Album
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {albums.map((album) => (
                        <div
                            key={album.id}
                            className="card overflow-hidden group"
                        >
                            {/* Cover image */}
                            <div className="relative aspect-[16/10] bg-gray-100 dark:bg-gray-800">
                                {album.coverImage ? (
                                    <img
                                        src={album.coverImage}
                                        alt={album.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg
                                            className="w-12 h-12 text-gray-400"
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

                                {/* Status badge */}
                                <div className="absolute top-2 right-2">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded ${album.published
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}
                                    >
                                        {album.published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                            </div>

                            {/* Album info */}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    {album.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {album.photoCount} {album.photoCount === 1 ? 'photo' : 'photos'}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                                    <Link
                                        href={`/admin/p/photos/${album.id}`}
                                        className="btn-secondary text-sm flex-1 text-center"
                                    >
                                        Edit
                                    </Link>
                                    <DeleteButton
                                        id={album.id}
                                        type="page"
                                        name={album.title}
                                        apiPath={`/api/p/photos/${album.id}`}
                                        onDeleted={() => handleAlbumDeleted(album.id)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
