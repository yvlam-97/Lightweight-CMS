/**
 * Local File Storage Provider Implementation
 *
 * This implements the StorageProvider interface using local file system.
 * Files are stored in the public/uploads directory.
 * Useful for development or self-hosted deployments.
 */

import {
    StorageProvider,
    UploadedFile,
    UploadOptions,
    DeleteOptions,
} from './types'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = 'public/uploads'
const PUBLIC_PATH = '/uploads'

/**
 * Local file system storage provider
 */
export class LocalStorageProvider implements StorageProvider {
    readonly name = 'local'
    private uploadDir: string
    private publicPath: string

    constructor(uploadDir?: string, publicPath?: string) {
        this.uploadDir = uploadDir || UPLOAD_DIR
        this.publicPath = publicPath || PUBLIC_PATH
    }

    private async ensureDir(dir: string): Promise<void> {
        try {
            await fs.access(dir)
        } catch {
            await fs.mkdir(dir, { recursive: true })
        }
    }

    private generateKey(filename: string, folder?: string): string {
        const ext = path.extname(filename)
        const uuid = randomUUID()
        const key = `${uuid}${ext}`
        return folder ? `${folder}/${key}` : key
    }

    async upload(file: File, options?: UploadOptions): Promise<UploadedFile> {
        const key = this.generateKey(file.name, options?.folder)
        const filePath = path.join(this.uploadDir, key)
        const fileDir = path.dirname(filePath)

        await this.ensureDir(fileDir)

        // Convert File to Buffer and write
        const buffer = Buffer.from(await file.arrayBuffer())
        await fs.writeFile(filePath, buffer)

        return {
            key,
            url: `${this.publicPath}/${key}`,
            name: file.name,
            size: file.size,
            type: file.type,
        }
    }

    async uploadMany(
        files: File[],
        options?: UploadOptions
    ): Promise<UploadedFile[]> {
        return Promise.all(files.map((file) => this.upload(file, options)))
    }

    async delete(key: string, options?: DeleteOptions): Promise<void> {
        const filePath = path.join(this.uploadDir, key)
        try {
            await fs.unlink(filePath)
        } catch (error) {
            // Ignore if file doesn't exist
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error
            }
        }
    }

    async deleteMany(keys: string[], options?: DeleteOptions): Promise<void> {
        await Promise.all(keys.map((key) => this.delete(key, options)))
    }

    getUrl(key: string): string {
        return `${this.publicPath}/${key}`
    }

    async exists(key: string): Promise<boolean> {
        const filePath = path.join(this.uploadDir, key)
        try {
            await fs.access(filePath)
            return true
        } catch {
            return false
        }
    }

    async getMetadata(key: string): Promise<Partial<UploadedFile> | null> {
        const filePath = path.join(this.uploadDir, key)
        try {
            const stats = await fs.stat(filePath)
            return {
                key,
                url: this.getUrl(key),
                name: path.basename(key),
                size: stats.size,
            }
        } catch {
            return null
        }
    }
}
