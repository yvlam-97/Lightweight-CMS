import { NextResponse } from 'next/server'
import { getStoredFileData } from '@/lib/storage/server'

/**
 * GET /api/p/photos/file/[key]
 *
 * Serves files stored in SQLite storage.
 * This endpoint returns the actual file data with proper Content-Type headers.
 */
export async function GET(
    req: Request,
    context: { params: Promise<Record<string, string>> }
) {
    const params = await context.params
    const key = params.key

    if (!key) {
        return NextResponse.json({ error: 'File key required' }, { status: 400 })
    }

    try {
        const fileData = await getStoredFileData(key)

        if (!fileData) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 })
        }

        // Convert Buffer to Uint8Array for NextResponse compatibility
        const uint8Array = new Uint8Array(fileData.data)

        // Return the file with proper headers
        return new NextResponse(uint8Array, {
            status: 200,
            headers: {
                'Content-Type': fileData.mimeType,
                'Content-Length': fileData.data.length.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    } catch (error) {
        console.error('Error serving file:', error)
        return NextResponse.json(
            { error: 'Failed to serve file' },
            { status: 500 }
        )
    }
}
