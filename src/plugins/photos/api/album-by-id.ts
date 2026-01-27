import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/storage/server'
import { ApiRouteHandler } from '@/lib/plugins/types'

/**
 * GET /api/p/photos/[id] - Get album by ID with all photos
 */
export const GET: ApiRouteHandler = async (req, context) => {
    try {
        const { id } = await context.params

        const album = await prisma.album.findUnique({
            where: { id },
            include: {
                photos: {
                    orderBy: { order: 'asc' },
                },
            },
        })

        if (!album) {
            return NextResponse.json({ error: 'Album not found' }, { status: 404 })
        }

        return NextResponse.json(album)
    } catch (error) {
        console.error('Failed to fetch album:', error)
        return NextResponse.json(
            { error: 'Failed to fetch album' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/p/photos/[id] - Update album
 */
export const PUT: ApiRouteHandler = async (req, context) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await context.params
        const data = await req.json()

        // Check if album exists
        const existingAlbum = await prisma.album.findUnique({
            where: { id },
        })

        if (!existingAlbum) {
            return NextResponse.json({ error: 'Album not found' }, { status: 404 })
        }

        // If slug is being changed, check for conflicts
        if (data.slug && data.slug !== existingAlbum.slug) {
            const slugConflict = await prisma.album.findUnique({
                where: { slug: data.slug },
            })

            if (slugConflict) {
                return NextResponse.json(
                    { error: 'An album with this slug already exists' },
                    { status: 400 }
                )
            }
        }

        const album = await prisma.album.update({
            where: { id },
            data: {
                title: data.title,
                slug: data.slug,
                description: data.description,
                coverPhotoId: data.coverPhotoId,
                published: data.published,
            },
        })

        return NextResponse.json(album)
    } catch (error) {
        console.error('Failed to update album:', error)
        return NextResponse.json(
            { error: 'Failed to update album' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/p/photos/[id] - Delete album and all its photos
 */
export const DELETE: ApiRouteHandler = async (req, context) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await context.params

        // Get album with all photos to delete from storage
        const album = await prisma.album.findUnique({
            where: { id },
            include: { photos: true },
        })

        if (!album) {
            return NextResponse.json({ error: 'Album not found' }, { status: 404 })
        }

        // Delete photos from storage provider
        for (const photo of album.photos) {
            try {
                await deleteFile(photo.storageKey)
            } catch (error) {
                console.error(`Failed to delete photo ${photo.id} from storage:`, error)
                // Continue even if storage deletion fails
            }
        }

        // Delete album (cascade will delete photos from DB)
        await prisma.album.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete album:', error)
        return NextResponse.json(
            { error: 'Failed to delete album' },
            { status: 500 }
        )
    }
}
