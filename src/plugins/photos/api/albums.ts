import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ApiRouteHandler } from '@/lib/plugins/types'

/**
 * GET /api/p/photos - List all albums
 * Query params:
 *   - published=true: Only return published albums (for public pages)
 */
export const GET: ApiRouteHandler = async (req) => {
    try {
        const { searchParams } = new URL(req.url)
        const publishedOnly = searchParams.get('published') === 'true'

        const albums = await prisma.album.findMany({
            where: publishedOnly ? { published: true } : undefined,
            include: {
                photos: {
                    orderBy: { order: 'asc' },
                    take: 1, // Just get first photo for thumbnail
                },
                _count: {
                    select: { photos: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        // Transform to include photo count and cover image
        const albumsWithMeta = albums.map((album) => ({
            id: album.id,
            title: album.title,
            slug: album.slug,
            description: album.description,
            published: album.published,
            photoCount: album._count.photos,
            coverImage: album.coverPhotoId
                ? album.photos.find((p) => p.id === album.coverPhotoId)?.url ||
                album.photos[0]?.url
                : album.photos[0]?.url || null,
            createdAt: album.createdAt,
            updatedAt: album.updatedAt,
        }))

        return NextResponse.json(albumsWithMeta)
    } catch (error) {
        console.error('Failed to fetch albums:', error)
        return NextResponse.json(
            { error: 'Failed to fetch albums' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/p/photos - Create a new album
 */
export const POST: ApiRouteHandler = async (req) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await req.json()

        // Validate required fields
        if (!data.title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }

        // Generate slug if not provided
        const slug =
            data.slug ||
            data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')

        // Check if slug already exists
        const existingAlbum = await prisma.album.findUnique({
            where: { slug },
        })

        if (existingAlbum) {
            return NextResponse.json(
                { error: 'An album with this slug already exists' },
                { status: 400 }
            )
        }

        const album = await prisma.album.create({
            data: {
                title: data.title,
                slug,
                description: data.description || null,
                published: data.published || false,
            },
        })

        return NextResponse.json(album)
    } catch (error) {
        console.error('Failed to create album:', error)
        return NextResponse.json(
            { error: 'Failed to create album' },
            { status: 500 }
        )
    }
}
