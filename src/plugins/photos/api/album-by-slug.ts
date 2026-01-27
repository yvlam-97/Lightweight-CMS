import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ApiRouteHandler } from '@/lib/plugins/types'

/**
 * GET /api/p/photos/album/[slug] - Get album by slug (for public pages)
 */
export const GET: ApiRouteHandler = async (req, context) => {
    try {
        const { slug } = await context.params
        const { searchParams } = new URL(req.url)
        const requirePublished = searchParams.get('published') !== 'false'

        const album = await prisma.album.findUnique({
            where: { slug },
            include: {
                photos: {
                    orderBy: { order: 'asc' },
                },
            },
        })

        if (!album) {
            return NextResponse.json({ error: 'Album not found' }, { status: 404 })
        }

        // Check if album is published (for public access)
        if (requirePublished && !album.published) {
            // Check if user is authenticated (can view unpublished)
            const session = await getServerSession(authOptions)
            if (!session) {
                return NextResponse.json({ error: 'Album not found' }, { status: 404 })
            }
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
