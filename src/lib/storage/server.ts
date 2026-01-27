/**
 * Server-side Storage Operations
 *
 * This module provides the server-side storage provider implementation.
 * Use this in API routes and server components.
 *
 * For types and client-safe exports, use './types' instead.
 */

import { StorageProvider, StorageConfig } from './types'
import { SqliteStorageProvider } from './sqlite'

export * from './types'
export { getStoredFileData } from './sqlite'

// Singleton instance
let storageInstance: StorageProvider | null = null

/**
 * Get the current storage provider configuration from environment
 */
function getStorageConfig(): StorageConfig {
    // Default to SQLite for simplicity - no external dependencies needed
    const provider = (process.env.STORAGE_PROVIDER || 'sqlite') as StorageConfig['provider']

    return {
        provider,
        config: {
            // Provider-specific config can be added here
        },
    }
}

/**
 * Create a storage provider instance based on configuration
 */
async function createStorageProvider(config: StorageConfig): Promise<StorageProvider> {
    switch (config.provider) {
        case 'sqlite':
            return new SqliteStorageProvider()

        case 'uploadthing': {
            const { UploadthingStorageProvider } = await import('./uploadthing')
            return new UploadthingStorageProvider()
        }

        case 'local': {
            // Dynamic import with webpack ignore comment prevents bundling
            // This module will only be loaded at runtime on Node.js server
            const mod = await import(/* webpackIgnore: true */ './local.js')
            return new mod.LocalStorageProvider()
        }

        case 's3':
            // Placeholder for S3 implementation
            throw new Error(
                'S3 storage provider not implemented. Create S3StorageProvider class and add it here.'
            )

        case 'cloudinary':
            // Placeholder for Cloudinary implementation
            throw new Error(
                'Cloudinary storage provider not implemented. Create CloudinaryStorageProvider class and add it here.'
            )

        default:
            throw new Error(`Unknown storage provider: ${config.provider}`)
    }
}

/**
 * Get the configured storage provider instance (singleton)
 */
export async function getStorageProvider(): Promise<StorageProvider> {
    if (!storageInstance) {
        const config = getStorageConfig()
        storageInstance = await createStorageProvider(config)
    }
    return storageInstance
}

/**
 * Reset the storage provider instance (useful for testing)
 */
export function resetStorageProvider(): void {
    storageInstance = null
}

/**
 * Set a custom storage provider (useful for testing or custom implementations)
 */
export function setStorageProvider(provider: StorageProvider): void {
    storageInstance = provider
}

/**
 * Delete files using the configured storage provider
 * Convenience function for common operation
 */
export async function deleteFiles(keys: string[]): Promise<void> {
    const storage = await getStorageProvider()
    await storage.deleteMany(keys)
}

/**
 * Delete a single file using the configured storage provider
 * Convenience function for common operation
 */
export async function deleteFile(key: string): Promise<void> {
    const storage = await getStorageProvider()
    await storage.delete(key)
}

/**
 * Get URL for a file key
 * Convenience function for common operation
 */
export async function getFileUrl(key: string): Promise<string> {
    const storage = await getStorageProvider()
    return storage.getUrl(key)
}

/**
 * Upload multiple files using the configured storage provider
 * Convenience function for common operation
 */
export async function uploadFiles(files: File[]): Promise<import('./types').UploadedFile[]> {
    const storage = await getStorageProvider()
    return storage.uploadMany(files)
}

/**
 * Upload a single file using the configured storage provider
 * Convenience function for common operation
 */
export async function uploadFile(file: File): Promise<import('./types').UploadedFile> {
    const storage = await getStorageProvider()
    return storage.upload(file)
}
