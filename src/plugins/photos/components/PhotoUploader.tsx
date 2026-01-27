'use client'

import { useState, useCallback } from 'react'
import { UploadedFile } from '@/lib/storage/types'

interface Props {
    albumId: string
    onUploadComplete?: (photos: UploadedFile[]) => void
    onUploadStart?: () => void
    onError?: (error: string) => void
}

/**
 * PhotoUploader Component
 *
 * This component handles file uploads using whatever storage provider is configured.
 * It uses the Uploadthing client by default but the pattern can be adapted
 * for other providers by changing the upload implementation.
 *
 * The component:
 * 1. Handles drag & drop and file selection
 * 2. Uploads to the storage provider (Uploadthing)
 * 3. Saves photo metadata to the database via API
 */
export function PhotoUploader({
    albumId,
    onUploadComplete,
    onUploadStart,
    onError,
}: Props) {
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [uploadedCount, setUploadedCount] = useState(0)
    const [totalCount, setTotalCount] = useState(0)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const uploadFiles = async (files: FileList | File[]) => {
        const fileArray = Array.from(files).filter((file) =>
            file.type.startsWith('image/')
        )

        if (fileArray.length === 0) {
            onError?.('Please select image files only')
            return
        }

        setIsUploading(true)
        setTotalCount(fileArray.length)
        setUploadedCount(0)
        onUploadStart?.()

        try {
            // Upload files - this also saves to database
            const formData = new FormData()
            fileArray.forEach((file) => {
                formData.append('files', file)
            })
            formData.append('albumId', albumId)

            const response = await fetch('/api/p/photos/upload', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Upload failed')
            }

            const result = await response.json()
            const uploadedPhotos: UploadedFile[] = result.photos || []

            setUploadedCount(uploadedPhotos.length)
            setProgress(100)

            onUploadComplete?.(uploadedPhotos)
        } catch (error) {
            console.error('Upload error:', error)
            onError?.(error instanceof Error ? error.message : 'Upload failed')
        } finally {
            setIsUploading(false)
            setProgress(0)
        }
    }

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)

            const files = e.dataTransfer.files
            if (files.length > 0) {
                uploadFiles(files)
            }
        },
        [albumId]
    )

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files
            if (files && files.length > 0) {
                uploadFiles(files)
            }
            // Reset input
            e.target.value = ''
        },
        [albumId]
    )

    return (
        <div
            className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors
        ${isDragging
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                }
        ${isUploading ? 'pointer-events-none opacity-75' : ''}
      `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isUploading ? (
                <div className="space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-300">
                        Uploading... {uploadedCount}/{totalCount}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            ) : (
                <>
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                    >
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="mt-4">
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer text-primary-600 hover:text-primary-500 font-medium"
                        >
                            <span>Click to upload</span>
                            <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </label>
                        <span className="text-gray-500 dark:text-gray-400">
                            {' '}
                            or drag and drop
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        PNG, JPG, GIF, WebP up to 10MB each
                    </p>
                </>
            )}
        </div>
    )
}
