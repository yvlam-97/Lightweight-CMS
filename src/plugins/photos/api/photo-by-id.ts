import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/storage/server'
import { ApiRouteHandler } from '@/lib/plugins/types'

/**
 * GET /api/p/photos/photo/[photoId] - Get single photo
 */
export const GET: ApiRouteHandler = async (req, context) => {
    try {
        const { photoId } = await context.params

        const photo = await prisma.photo.findUnique({
            where: { id: photoId },
            include: { album: true },
        })

        if (!photo) {
            return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
        }

        return NextResponse.json(photo)
    } catch (error) {
        console.error('Failed to fetch photo:', error)
        return NextResponse.json(
            { error: 'Failed to fetch photo' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/p/photos/photo/[photoId] - Update photo metadata
 */
export const PUT: ApiRouteHandler = async (req, context) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { photoId } = await context.params
        const data = await req.json()

        const photo = await prisma.photo.update({
            where: { id: photoId },
            data: {
                title: data.title,
                caption: data.caption,
                altText: data.altText,
                order: data.order,
            },
        })

        return NextResponse.json(photo)
    } catch (error) {
        console.error('Failed to update photo:', error)
        return NextResponse.json(
            { error: 'Failed to update photo' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/p/photos/photo/[photoId] - Delete photo
 */
export const DELETE: ApiRouteHandler = async (req, context) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { photoId } = await context.params

        // Get photo to delete from storage
        const photo = await prisma.photo.findUnique({
            where: { id: photoId },
        })

        if (!photo) {
            return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
        }

        // Delete from storage provider
        try {
            await deleteFile(photo.storageKey)
        } catch (error) {
            console.error('Failed to delete photo from storage:', error)
            // Continue even if storage deletion fails
        }

        // Delete from database
        await prisma.photo.delete({
            where: { id: photoId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete photo:', error)
        return NextResponse.json(
            { error: 'Failed to delete photo' },
            { status: 500 }
        )
    }
}
