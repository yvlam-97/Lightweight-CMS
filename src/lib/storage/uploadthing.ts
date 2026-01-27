/**
 * Uploadthing Storage Provider Implementation
 *
 * This implements the StorageProvider interface using Uploadthing.
 * To switch providers, create a new implementation and update the storage index.
 */

import {
    StorageProvider,
    UploadedFile,
    UploadOptions,
    DeleteOptions,
} from './types'
import { UTApi } from 'uploadthing/server'

/**
 * Uploadthing storage provider
 */
export class UploadthingStorageProvider implements StorageProvider {
    readonly name = 'uploadthing'
    private utapi: UTApi

    constructor() {
        this.utapi = new UTApi()
    }

    /**
     * Upload a single file using Uploadthing server API
     */
    async upload(file: File, options?: UploadOptions): Promise<UploadedFile> {
        const results = await this.uploadMany([file], options)
        if (results.length === 0) {
            throw new Error('Upload failed')
        }
        return results[0]
    }

    /**
     * Upload multiple files using Uploadthing server API
     */
    async uploadMany(
        files: File[],
        options?: UploadOptions
    ): Promise<UploadedFile[]> {
        const uploadResults = await this.utapi.uploadFiles(files)

        return uploadResults
            .filter((result) => result.data)
            .map((result) => {
                const data = result.data!
                return {
                    key: data.key,
                    url: data.url,
                    name: data.name,
                    size: data.size,
                    type: data.type || 'application/octet-stream',
                }
            })
    }

    /**
     * Delete a file from Uploadthing
     */
    async delete(key: string, options?: DeleteOptions): Promise<void> {
        await this.utapi.deleteFiles([key])
    }

    /**
     * Delete multiple files from Uploadthing
     */
    async deleteMany(keys: string[], options?: DeleteOptions): Promise<void> {
        if (keys.length === 0) return
        await this.utapi.deleteFiles(keys)
    }

    /**
     * Get the public URL for an Uploadthing file
     */
    getUrl(key: string): string {
        return `https://utfs.io/f/${key}`
    }

    /**
     * Check if a file exists (by attempting to fetch metadata)
     */
    async exists(key: string): Promise<boolean> {
        try {
            const response = await fetch(this.getUrl(key), { method: 'HEAD' })
            return response.ok
        } catch {
            return false
        }
    }

    /**
     * Get file metadata from Uploadthing
     */
    async getMetadata(key: string): Promise<Partial<UploadedFile> | null> {
        try {
            const response = await fetch(this.getUrl(key), { method: 'HEAD' })
            if (response.ok) {
                const contentType = response.headers.get('content-type') || ''
                const contentLength = response.headers.get('content-length')
                return {
                    key,
                    url: this.getUrl(key),
                    type: contentType,
                    size: contentLength ? parseInt(contentLength, 10) : undefined,
                }
            }
            return null
        } catch {
            return null
        }
    }
}

/**
 * Helper to convert Uploadthing response to our UploadedFile format
 * @deprecated Use the storage provider's uploadMany method instead
 */
export function toUploadedFile(
    utFile: {
        key: string
        url: string
        name: string
        size: number
        type?: string
    },
    dimensions?: { width: number; height: number }
): UploadedFile {
    return {
        key: utFile.key,
        url: utFile.url,
        name: utFile.name,
        size: utFile.size,
        type: utFile.type || 'application/octet-stream',
        width: dimensions?.width,
        height: dimensions?.height,
    }
}
