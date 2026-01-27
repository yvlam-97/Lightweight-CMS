'use client'

import { useState } from 'react'
import { Lightbox } from './Lightbox'

interface Photo {
    id: string
    url: string
    thumbnailUrl: string | null
    filename: string
    title: string | null
    caption: string | null
    altText: string | null
    width: number | null
    height: number | null
}

interface Props {
    photos: Photo[]
    onReorder?: (photoIds: string[]) => void
    onDelete?: (photoId: string) => void
    onSetCover?: (photoId: string) => void
    onPhotoClick?: (photo: Photo, index: number) => void
    coverPhotoId?: string | null
    editable?: boolean
}

export function PhotoGrid({
    photos,
    onReorder,
    onDelete,
    onSetCover,
    onPhotoClick,
    coverPhotoId,
    editable = false,
}: Props) {
    const [draggedId, setDraggedId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    const handleDragStart = (e: React.DragEvent, photoId: string) => {
        if (!editable) return
        setDraggedId(photoId)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent) => {
        if (!editable) return
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        if (!editable || !draggedId || draggedId === targetId) return
        e.preventDefault()

        const currentOrder = photos.map((p) => p.id)
        const draggedIndex = currentOrder.indexOf(draggedId)
        const targetIndex = currentOrder.indexOf(targetId)

        // Remove dragged item and insert at new position
        currentOrder.splice(draggedIndex, 1)
        currentOrder.splice(targetIndex, 0, draggedId)

        onReorder?.(currentOrder)
        setDraggedId(null)
    }

    const handleDelete = (photoId: string) => {
        if (deleteConfirm === photoId) {
            onDelete?.(photoId)
            setDeleteConfirm(null)
        } else {
            setDeleteConfirm(photoId)
            // Auto-clear confirmation after 3 seconds
            setTimeout(() => setDeleteConfirm(null), 3000)
        }
    }

    if (photos.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
                <p>No photos in this album yet</p>
            </div>
        )
    }

    return (
        <>
            <div
                className="grid gap-3"
                style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 120px))',
                }}
            >
                {photos.map((photo, index) => (
                    <div
                        key={photo.id}
                        className={`
                            relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                            ${editable ? 'cursor-move' : 'cursor-pointer'}
                            ${draggedId === photo.id ? 'scale-95' : ''}
                            ${coverPhotoId === photo.id ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900' : ''}
                            transition-all duration-150 hover:shadow-lg
                        `}
                        style={{ width: '120px', height: '120px' }}
                        draggable={editable}
                        onDragStart={(e) => handleDragStart(e, photo.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, photo.id)}
                        onClick={() => {
                            if (!editable) {
                                onPhotoClick?.(photo, index)
                            }
                        }}
                    >
                        {/* Image with reduced opacity in edit mode so buttons are visible */}
                        <img
                            src={photo.thumbnailUrl || photo.url}
                            alt={photo.altText || photo.title || photo.filename}
                            className={`w-full h-full object-cover ${editable ? 'opacity-60' : ''}`}
                            style={{ position: 'relative', zIndex: 1 }}
                            loading="lazy"
                        />

                        {/* Action buttons - at top of thumbnail, always visible */}
                        {editable && (
                            <div
                                className="absolute top-0 left-0 right-0 bg-gray-900 flex items-center justify-center gap-1 py-1 px-1"
                                style={{ zIndex: 20 }}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setLightboxIndex(index)
                                    }}
                                    className="p-1 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                                    title="View full size"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>

                                {onSetCover && coverPhotoId !== photo.id && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onSetCover(photo.id)
                                        }}
                                        className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                                        title="Set as album cover"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                    </button>
                                )}

                                {onDelete && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete(photo.id)
                                        }}
                                        className={`p-1 rounded transition-colors ${deleteConfirm === photo.id
                                            ? 'bg-red-700 hover:bg-red-800 text-white'
                                            : 'bg-red-600 hover:bg-red-500 text-white'
                                            }`}
                                        title={deleteConfirm === photo.id ? 'Click again to confirm delete' : 'Delete photo'}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Cover badge */}
                        {coverPhotoId === photo.id && (
                            <div className="absolute bottom-1 left-1 bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium shadow">
                                Cover
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox for viewing full images - rendered outside grid for proper z-index */}
            {lightboxIndex !== null && (
                <Lightbox
                    photos={photos}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </>
    )
}
