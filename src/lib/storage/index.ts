/**
 * Storage Facade - Main Entry Point
 *
 * This module provides client-safe type exports.
 * For server-side operations, import from '@/lib/storage/server'.
 *
 * Usage:
 *   // Server-side (API routes, server components):
 *   import { deleteFile, uploadFiles } from '@/lib/storage/server'
 *   await uploadFiles(files)
 *   await deleteFile(storageKey)
 *
 *   // Client-side (types only):
 *   import type { UploadedFile, StorageProvider } from '@/lib/storage'
 */

// Re-export types (client-safe)
export * from './types'
