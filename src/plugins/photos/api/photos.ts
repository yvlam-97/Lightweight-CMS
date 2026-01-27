import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/storage/server'
import { ApiRouteHandler } from '@/lib/plugins/types'

/**
 * GET /api/p/photos/[id]/photos - Get all photos in an album
 */
export const GET: ApiRouteHandler = async (req, context) => {
    try {
        const { id } = await context.params

        const photos = await prisma.photo.findMany({
            where: { albumId: id },
            orderBy: { order: 'asc' },
        })

        return NextResponse.json(photos)
    } catch (error) {
        console.error('Failed to fetch photos:', error)
        return NextResponse.json(
            { error: 'Failed to fetch photos' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/p/photos/[id]/photos - Add photos to album
 * Expects an array of photo data (from client-side upload)
 */
export const POST: ApiRouteHandler = async (req, context) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id: albumId } = await context.params
        const data = await req.json()

        // Check if album exists
        const album = await prisma.album.findUnique({
            where: { id: albumId },
            include: { _count: { select: { photos: true } } },
        })

        if (!album) {
            return NextResponse.json({ error: 'Album not found' }, { status: 404 })
        }

        // Get current max order
        const currentOrder = album._count.photos

        // Handle single photo or array of photos
        const photosData = Array.isArray(data) ? data : [data]

        const photos = await prisma.photo.createMany({
            data: photosData.map((photo, index) => ({
                albumId,
                storageKey: photo.storageKey || photo.key,
                url: photo.url,
                thumbnailUrl: photo.thumbnailUrl || null,
                filename: photo.filename || photo.name,
                size: photo.size,
                mimeType: photo.mimeType || photo.type || 'image/jpeg',
                width: photo.width || null,
                height: photo.height || null,
                order: currentOrder + index,
                title: photo.title || null,
                caption: photo.caption || null,
                altText: photo.altText || null,
            })),
        })

        return NextResponse.json({ count: photos.count })
    } catch (error) {
        console.error('Failed to add photos:', error)
        return NextResponse.json(
            { error: 'Failed to add photos' },
            { status: 500 }
        )
    }
}
