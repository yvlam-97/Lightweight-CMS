'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface Photo {
    id: string
    url: string
    filename: string
    title: string | null
    caption: string | null
    altText: string | null
    width: number | null
    height: number | null
}

interface Props {
    photos: Photo[]
    initialIndex: number
    onClose: () => void
}

export function Lightbox({ photos, initialIndex, onClose }: Props) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [mounted, setMounted] = useState(false)
    const currentPhoto = photos[currentIndex]

    const goNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length)
    }, [photos.length])

    const goPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
    }, [photos.length])

    // Mount check for portal
    useEffect(() => {
        setMounted(true)
    }, [])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    onClose()
                    break
                case 'ArrowRight':
                    goNext()
                    break
                case 'ArrowLeft':
                    goPrev()
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'hidden'

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [onClose, goNext, goPrev])

    if (!currentPhoto || !mounted) return null

    const content = (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                backgroundColor: 'rgba(0, 0, 0, 0.97)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClick={onClose}
        >
            {/* Close button - top right corner */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    zIndex: 100000,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    opacity: 0.6,
                    transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                aria-label="Close (Esc)"
            >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {/* Main photo container */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    padding: '60px',
                }}
            >
                {/* Previous arrow - left side */}
                {photos.length > 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            goPrev()
                        }}
                        style={{
                            position: 'absolute',
                            left: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 100000,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '16px',
                            opacity: 0.5,
                            transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
                        aria-label="Previous photo (←)"
                    >
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                )}

                {/* Photo and info */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        maxWidth: 'calc(100vw - 200px)',
                        maxHeight: 'calc(100vh - 120px)',
                    }}
                >
                    <img
                        src={currentPhoto.url}
                        alt={currentPhoto.altText || currentPhoto.title || currentPhoto.filename}
                        style={{
                            maxWidth: '100%',
                            maxHeight: 'calc(100vh - 180px)',
                            objectFit: 'contain',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        }}
                    />

                    {/* Caption and counter - below photo */}
                    <div
                        style={{
                            marginTop: '20px',
                            textAlign: 'center',
                            color: 'white',
                        }}
                    >
                        {currentPhoto.title && (
                            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                                {currentPhoto.title}
                            </h3>
                        )}
                        {currentPhoto.caption && (
                            <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '4px' }}>
                                {currentPhoto.caption}
                            </p>
                        )}
                        <p style={{ fontSize: '13px', opacity: 0.4, marginTop: '12px' }}>
                            {currentIndex + 1} / {photos.length}
                        </p>
                    </div>
                </div>

                {/* Next arrow - right side */}
                {photos.length > 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            goNext()
                        }}
                        style={{
                            position: 'absolute',
                            right: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 100000,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '16px',
                            opacity: 0.5,
                            transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
                        aria-label="Next photo (→)"
                    >
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )

    // Use portal to render at document body level, completely outside the React tree
    return createPortal(content, document.body)
}
