/**
 * Concerts Plugin
 *
 * This plugin adds concert/event management functionality to the CMS.
 * It provides:
 * - Admin pages for managing concerts (list, create, edit)
 * - Public page for displaying upcoming and past concerts
 * - Homepage section showing upcoming concerts
 * - API routes for CRUD operations
 *
 * Database schema is defined in ./schema.prisma
 */

import { PluginDefinition } from '@/lib/plugins/types'
import {
  ConcertListPage,
  ConcertNewPage,
  ConcertEditPage,
  ConcertPublicPage,
} from './pages'
import { ConcertsHomepageSection } from './components/HomepageSection'
import * as concertsApi from './api/concerts'
import * as concertByIdApi from './api/concert-by-id'

// Calendar Icon for the admin navigation
function CalendarIcon({ className }: { className?: string }) {
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
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

export const plugin: PluginDefinition = {
  id: 'concerts',
  name: 'Concerts',
  description:
    'Manage concerts, shows, and events with venue information, dates, and ticket links.',
  version: '1.0.0',
  author: 'CMS Team',

  // Default URL for public concert listing
  defaultPublicPath: '/concerts',

  // Admin navigation item - now uses the dynamic plugin route
  adminNavigation: {
    name: 'Concerts',
    href: '/admin/p/concerts',
    icon: CalendarIcon,
  },

  // Admin pages
  adminPages: [
    { path: '', component: ConcertListPage },
    { path: 'new', component: ConcertNewPage },
    { path: '[id]', component: ConcertEditPage },
  ],

  // Public pages
  publicPages: [{ path: '', component: ConcertPublicPage }],

  // Homepage section (shows upcoming concerts on the main page)
  homepageSection: {
    priority: 10, // Higher priority = appears first
    component: ConcertsHomepageSection,
  },

  // API routes
  apiRoutes: [
    { path: '', GET: concertsApi.GET, POST: concertsApi.POST },
    {
      path: '[id]',
      GET: concertByIdApi.GET,
      PUT: concertByIdApi.PUT,
      DELETE: concertByIdApi.DELETE,
    },
  ],
}

export default plugin
