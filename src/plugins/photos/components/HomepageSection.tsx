import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { HomepageSectionProps } from '@/lib/plugins/types'
import { getTranslations } from 'next-intl/server'

async function getRecentAlbums() {
    try {
        const albums = await prisma.album.findMany({
            where: { published: true },
            include: {
                coverPhoto: true,
                photos: {
                    orderBy: { order: 'asc' },
                    take: 4,
                },
                _count: {
                    select: { photos: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 3,
        })
        return albums
    } catch {
        return []
    }
}

export async function PhotosHomepageSection({ publicPath }: HomepageSectionProps) {
    const albums = await getRecentAlbums()
    const t = await getTranslations('photos')
    const tCommon = await getTranslations('common')

    if (albums.length === 0) return null

    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t('title')}
                    </h2>
                    <Link
                        href={publicPath}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        {tCommon('viewAll')} →
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {albums.map((album) => {
                        const coverPhoto = album.coverPhoto || album.photos[0]
                        const imageSrc = coverPhoto ? (coverPhoto.thumbnailUrl || coverPhoto.url) : null

                        return (
                            <Link
                                key={album.id}
                                href={`${publicPath}/${album.slug}`}
                                className="group block"
                            >
                                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                                    {imageSrc ? (
                                        <img
                                            src={imageSrc}
                                            alt={album.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg
                                                className="w-16 h-16 text-gray-400"
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
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                                    {/* Album info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                        <h3 className="font-bold text-lg">{album.title}</h3>
                                        <p className="text-white/80 text-sm">
                                            {album._count.photos}{' '}
                                            {album._count.photos === 1 ? 'photo' : 'photos'}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
