/**
 * Storage Facade Types
 *
 * This provides an abstraction layer for file storage operations.
 * Implementations can be swapped out (Uploadthing, S3, local, etc.)
 * without changing the plugin code.
 */

export interface UploadedFile {
    /** Unique identifier for the file */
    key: string
    /** Public URL to access the file */
    url: string
    /** Original filename */
    name: string
    /** File size in bytes */
    size: number
    /** MIME type */
    type: string
    /** Optional thumbnail URL (for images) */
    thumbnailUrl?: string
    /** Image dimensions (if applicable) */
    width?: number
    height?: number
}

export interface UploadOptions {
    /** Folder/path prefix for organizing files */
    folder?: string
    /** Maximum file size in bytes */
    maxSize?: number
    /** Allowed MIME types */
    allowedTypes?: string[]
    /** Whether to generate thumbnails for images */
    generateThumbnail?: boolean
    /** Thumbnail dimensions */
    thumbnailSize?: { width: number; height: number }
}

export interface DeleteOptions {
    /** Also delete associated thumbnails */
    deleteThumbnails?: boolean
}

export interface StorageProvider {
    /** Provider name for identification */
    readonly name: string

    /**
     * Upload a single file
     * @param file - The file to upload
     * @param options - Upload options
     * @returns Promise resolving to uploaded file info
     */
    upload(file: File, options?: UploadOptions): Promise<UploadedFile>

    /**
     * Upload multiple files
     * @param files - Array of files to upload
     * @param options - Upload options applied to all files
     * @returns Promise resolving to array of uploaded file info
     */
    uploadMany(files: File[], options?: UploadOptions): Promise<UploadedFile[]>

    /**
     * Delete a file by its key
     * @param key - The file key/identifier
     * @param options - Delete options
     */
    delete(key: string, options?: DeleteOptions): Promise<void>

    /**
     * Delete multiple files
     * @param keys - Array of file keys/identifiers
     * @param options - Delete options applied to all files
     */
    deleteMany(keys: string[], options?: DeleteOptions): Promise<void>

    /**
     * Get the public URL for a file
     * @param key - The file key/identifier
     * @returns The public URL
     */
    getUrl(key: string): string

    /**
     * Check if a file exists
     * @param key - The file key/identifier
     * @returns Promise resolving to boolean
     */
    exists(key: string): Promise<boolean>

    /**
     * Get file metadata without downloading
     * @param key - The file key/identifier
     * @returns Promise resolving to partial file info
     */
    getMetadata(key: string): Promise<Partial<UploadedFile> | null>
}

/**
 * Storage configuration options
 */
export interface StorageConfig {
    /** The storage provider to use */
    provider: 'sqlite' | 'uploadthing' | 'local' | 's3' | 'cloudinary'
    /** Provider-specific configuration */
    config?: Record<string, unknown>
}

/**
 * Client-side upload handler type
 * Used for direct browser uploads (e.g., Uploadthing, S3 presigned URLs)
 */
export interface ClientUploadHandler {
    /** Start an upload from the client */
    startUpload: (files: File[]) => Promise<UploadedFile[]>
    /** Whether uploads are in progress */
    isUploading: boolean
    /** Upload progress (0-100) */
    progress: number
}
