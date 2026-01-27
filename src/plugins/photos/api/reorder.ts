import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ApiRouteHandler } from '@/lib/plugins/types'

/**
 * PUT /api/p/photos/[id]/reorder - Reorder photos in an album
 * Expects: { photoIds: string[] } - array of photo IDs in new order
 */
export const PUT: ApiRouteHandler = async (req, context) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id: albumId } = await context.params
        const { photoIds } = await req.json()

        if (!Array.isArray(photoIds)) {
            return NextResponse.json(
                { error: 'photoIds must be an array' },
                { status: 400 }
            )
        }

        // Update order for each photo
        await prisma.$transaction(
            photoIds.map((photoId, index) =>
                prisma.photo.update({
                    where: { id: photoId, albumId },
                    data: { order: index },
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to reorder photos:', error)
        return NextResponse.json(
            { error: 'Failed to reorder photos' },
            { status: 500 }
        )
    }
}
