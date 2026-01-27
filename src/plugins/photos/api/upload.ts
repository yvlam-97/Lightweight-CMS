import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadFiles } from '@/lib/storage/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/p/photos/upload
 *
 * Server-side upload endpoint that:
 * 1. Uploads files to storage provider via facade
 * 2. Saves photo metadata to database
 *
 * Uses the storage facade so the actual provider can be swapped out.
 */
export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await req.formData()
        const files = formData.getAll('files') as File[]
        const albumId = formData.get('albumId') as string

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 })
        }

        if (!albumId) {
            return NextResponse.json({ error: 'Album ID required' }, { status: 400 })
        }

        // Verify album exists
        const album = await prisma.album.findUnique({
            where: { id: albumId },
            include: { _count: { select: { photos: true } } },
        })

        if (!album) {
            return NextResponse.json({ error: 'Album not found' }, { status: 404 })
        }

        // Filter for images only
        const imageFiles = files.filter((file) => file.type.startsWith('image/'))

        if (imageFiles.length === 0) {
            return NextResponse.json(
                { error: 'No valid image files provided' },
                { status: 400 }
            )
        }

        // Upload via storage facade
        const uploadedFiles = await uploadFiles(imageFiles)

        // Save to database
        const currentOrder = album._count.photos
        await prisma.photo.createMany({
            data: uploadedFiles.map((file, index) => ({
                albumId,
                storageKey: file.key,
                url: file.url,
                thumbnailUrl: file.thumbnailUrl || null,
                filename: file.name,
                size: file.size,
                mimeType: file.type,
                width: file.width || null,
                height: file.height || null,
                order: currentOrder + index,
            })),
        })

        return NextResponse.json({ photos: uploadedFiles, albumId })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Failed to upload files' },
            { status: 500 }
        )
    }
}
