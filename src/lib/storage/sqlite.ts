/**
 * SQLite Storage Provider
 *
 * Stores files directly in the SQLite database as base64-encoded data.
 * This is simple and portable - no external dependencies required.
 *
 * Files are stored in a dedicated FileStorage table and served via API route.
 * The trade-off is database size, but for small to medium photo albums this works well.
 */

import { StorageProvider, UploadedFile, UploadOptions, DeleteOptions } from './types'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

/**
 * Convert a File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return buffer.toString('base64')
}

/**
 * Get image dimensions from a File (basic implementation)
 */
async function getImageDimensions(
    file: File
): Promise<{ width: number; height: number } | null> {
    // For server-side, we'd need sharp or similar
    // For now, return null and let the client provide dimensions if needed
    return null
}

export class SqliteStorageProvider implements StorageProvider {
    readonly name = 'sqlite'

    private getPublicUrl(key: string): string {
        // Files are served via the photos plugin API
        return `/api/p/photos/file/${key}`
    }

    async upload(file: File, options?: UploadOptions): Promise<UploadedFile> {
        const key = `${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const base64Data = await fileToBase64(file)
        const dimensions = await getImageDimensions(file)

        // Store in database
        await prisma.fileStorage.create({
            data: {
                key,
                filename: file.name,
                mimeType: file.type,
                size: file.size,
                data: base64Data,
                width: dimensions?.width,
                height: dimensions?.height,
            },
        })

        return {
            key,
            url: this.getPublicUrl(key),
            name: file.name,
            size: file.size,
            type: file.type,
            width: dimensions?.width,
            height: dimensions?.height,
        }
    }

    async uploadMany(files: File[], options?: UploadOptions): Promise<UploadedFile[]> {
        const results: UploadedFile[] = []
        for (const file of files) {
            const result = await this.upload(file, options)
            results.push(result)
        }
        return results
    }

    async delete(key: string, options?: DeleteOptions): Promise<void> {
        await prisma.fileStorage.delete({
            where: { key },
        }).catch(() => {
            // Ignore if file doesn't exist
        })
    }

    async deleteMany(keys: string[], options?: DeleteOptions): Promise<void> {
        await prisma.fileStorage.deleteMany({
            where: { key: { in: keys } },
        })
    }

    getUrl(key: string): string {
        return this.getPublicUrl(key)
    }

    async exists(key: string): Promise<boolean> {
        const file = await prisma.fileStorage.findUnique({
            where: { key },
            select: { key: true },
        })
        return file !== null
    }

    async getMetadata(key: string): Promise<Partial<UploadedFile> | null> {
        const file = await prisma.fileStorage.findUnique({
            where: { key },
            select: {
                key: true,
                filename: true,
                mimeType: true,
                size: true,
                width: true,
                height: true,
            },
        })

        if (!file) return null

        return {
            key: file.key,
            url: this.getPublicUrl(file.key),
            name: file.filename,
            size: file.size,
            type: file.mimeType,
            width: file.width || undefined,
            height: file.height || undefined,
        }
    }

    /**
     * Get the raw file data (used by the file serving API route)
     */
    async getFileData(key: string): Promise<{ data: Buffer; mimeType: string } | null> {
        const file = await prisma.fileStorage.findUnique({
            where: { key },
            select: { data: true, mimeType: true },
        })

        if (!file) return null

        return {
            data: Buffer.from(file.data, 'base64'),
            mimeType: file.mimeType,
        }
    }
}

/**
 * Helper to get file data from SQLite storage
 * Used by the file serving API route
 */
export async function getStoredFileData(
    key: string
): Promise<{ data: Buffer; mimeType: string } | null> {
    const provider = new SqliteStorageProvider()
    return provider.getFileData(key)
}
