/**
 * Photo Albums Plugin
 *
 * This plugin adds photo album management functionality to the CMS.
 * It provides:
 * - Admin pages for managing albums (list, create, edit)
 * - Photo upload with drag & drop support
 * - Public gallery pages
 * - Homepage section showing recent albums
 * - Flexible storage backend (SQLite by default, easily swappable)
 *
 * Database schema is defined in ./schema.prisma
 * Storage configuration is in src/lib/storage/
 */

import { PluginDefinition } from '@/lib/plugins/types'
import {
    AlbumListPage,
    AlbumNewPage,
    AlbumEditPage,
    GalleryPage,
    AlbumViewPage,
} from './pages'
import { PhotosHomepageSection } from './components/HomepageSection'
import * as albumsApi from './api/albums'
import * as albumByIdApi from './api/album-by-id'
import * as albumBySlugApi from './api/album-by-slug'
import * as photosApi from './api/photos'
import * as photoByIdApi from './api/photo-by-id'
import * as reorderApi from './api/reorder'
import * as uploadApi from './api/upload'
import * as fileApi from './api/file'

// Import translations
import translationsEn from './i18n/en.json'
import translationsNl from './i18n/nl.json'

// Photo Icon for the admin navigation
function PhotoIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
        </svg>
    )
}

export const plugin: PluginDefinition = {
    id: 'photos',
    name: 'Photo Albums',
    description:
        'Create and manage photo albums with drag & drop uploads, lightbox viewing, and flexible storage options.',
    version: '1.0.0',
    author: 'CMS Team',

    // Default URL for public photo gallery
    defaultPublicPath: '/photos',

    // Plugin translations (merged with core translations)
    translations: {
        en: translationsEn,
        nl: translationsNl,
    },

    // Admin navigation item
    adminNavigation: {
        name: 'Photo Albums',
        href: '/admin/p/photos',
        icon: PhotoIcon,
    },

    // Admin pages
    adminPages: [
        { path: '', component: AlbumListPage },
        { path: 'new', component: AlbumNewPage },
        { path: '[id]', component: AlbumEditPage },
    ],

    // Public pages
    publicPages: [
        { path: '', component: GalleryPage },
        { path: '[slug]', component: AlbumViewPage },
    ],

    // Homepage section (shows recent albums on the main page)
    homepageSection: {
        priority: 5, // Lower priority than concerts (appears after)
        component: PhotosHomepageSection,
    },

    // API routes
    // NOTE: Static paths must come BEFORE dynamic [param] paths to avoid incorrect matching
    apiRoutes: [
        // Album CRUD (list/create)
        { path: '', GET: albumsApi.GET, POST: albumsApi.POST },
        // File upload endpoint (static path - must be before [id])
        { path: 'upload', POST: uploadApi.POST },
        // File serving endpoint for SQLite storage (static prefix)
        { path: 'file/[key]', GET: fileApi.GET },
        // Album by slug (for public pages - static prefix)
        { path: 'album/[slug]', GET: albumBySlugApi.GET },
        // Individual photo operations (static prefix)
        {
            path: 'photo/[photoId]',
            GET: photoByIdApi.GET,
            PUT: photoByIdApi.PUT,
            DELETE: photoByIdApi.DELETE,
        },
        // Photos in album (dynamic prefix)
        { path: '[id]/photos', GET: photosApi.GET, POST: photosApi.POST },
        // Reorder photos (dynamic prefix)
        { path: '[id]/reorder', PUT: reorderApi.PUT },
        // Single album operations (dynamic - must be last among single-segment routes)
        {
            path: '[id]',
            GET: albumByIdApi.GET,
            PUT: albumByIdApi.PUT,
            DELETE: albumByIdApi.DELETE,
        },
    ],
}

export default plugin
