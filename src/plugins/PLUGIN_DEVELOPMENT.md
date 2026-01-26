# Plugin Development Guide

This guide explains how to create custom plugins for the CMS.

## Plugin Architecture

Plugins are self-contained modules that provide:

- Admin pages rendered via dynamic routes (`/admin/p/[pluginId]/...`)
- Public pages rendered via configurable paths
- API routes via dynamic routes (`/api/p/[pluginId]/...`)
- Custom navigation in the admin sidebar
- **Self-contained database schemas** - Each plugin defines its own Prisma schema

## Plugin Structure

Each plugin should be in its own folder within the `src/plugins/` directory:

```
src/plugins/
  your-plugin/
    index.tsx      # Main plugin definition (required)
    schema.prisma  # Database schema (if plugin needs DB tables)
    README.md      # Documentation (recommended)
    components/    # React components (optional)
      index.ts     # Component exports
      MyForm.tsx   # Your components
    pages/         # Page components (optional)
      index.ts     # Page exports
      ListPage.tsx
      EditPage.tsx
    api/           # API route handlers (optional)
      items.ts     # GET/POST handlers
      item-by-id.ts # GET/PUT/DELETE handlers
    lib/           # Utility functions (optional)
```

## Path Aliases

The project includes path aliases for cleaner imports:

- `@/*` - Points to `./src/*`
- `@plugins/*` - Points to `./src/plugins/*`

## Creating a Plugin

### 1. Create the Plugin Folder

```bash
mkdir src/plugins/your-plugin
mkdir src/plugins/your-plugin/components
mkdir src/plugins/your-plugin/pages
mkdir src/plugins/your-plugin/api
```

### 2. Create the Plugin Definition (index.tsx)

```typescript
import { PluginDefinition } from '@/lib/plugins/types'
import { YourListPage, YourNewPage, YourEditPage, YourPublicPage } from './pages'
import * as itemsApi from './api/items'
import * as itemByIdApi from './api/item-by-id'

// Optional: Create an icon component for the admin sidebar
function MyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {/* SVG path here */}
    </svg>
  )
}

export const plugin: PluginDefinition = {
  // Required fields
  id: 'your-plugin',           // Unique identifier (lowercase, no spaces)
  name: 'Your Plugin',         // Display name
  description: 'Description of what your plugin does',
  version: '1.0.0',

  // Optional fields
  author: 'Your Name',

  // Default URL for public pages (can be customized by admin)
  defaultPublicPath: '/your-feature',

  // Admin sidebar navigation
  adminNavigation: {
    name: 'Your Feature',
    href: '/admin/p/your-plugin',  // Uses dynamic plugin route
    icon: MyIcon,
  },

  // Admin pages - rendered via /admin/p/your-plugin/[path]
  adminPages: [
    { path: '', component: YourListPage },       // /admin/p/your-plugin
    { path: 'new', component: YourNewPage },     // /admin/p/your-plugin/new
    { path: '[id]', component: YourEditPage },   // /admin/p/your-plugin/[id]
  ],

  // Public page component - rendered at the configured public path
  publicPage: YourPublicPage,

  // Homepage section - optional component displayed on the main homepage
  homepageSection: {
    priority: 10,  // Higher priority = appears first (default: 0)
    component: YourHomepageSection,
  },

  // API routes - accessible via /api/p/your-plugin/[routeKey]
  apiRoutes: {
    '': itemsApi,           // GET/POST at /api/p/your-plugin
    '[id]': itemByIdApi,    // GET/PUT/DELETE at /api/p/your-plugin/[id]
  },

  // Lifecycle hooks (optional)
  onEnable: async () => {
    console.log('Plugin enabled!')
  },
  onDisable: async () => {
    console.log('Plugin disabled!')
  },
}

export default plugin
```

### 3. Create a Homepage Section (Optional)

If your plugin should display content on the public homepage, create a homepage section component:

```tsx
// src/plugins/your-plugin/components/HomepageSection.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { HomepageSectionProps } from '@/lib/plugins/types'

export async function YourHomepageSection({ publicPath }: HomepageSectionProps) {
  const items = await prisma.yourModel.findMany({ take: 4 })

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Your Items</h2>
          <Link href={publicPath} className="text-primary-600 hover:text-primary-700">
            View all →
          </Link>
        </div>
        {/* Render your items */}
      </div>
    </section>
  )
}
```

### 4. Create Page Components

Create your page components in the `pages/` folder:

```tsx
// src/plugins/your-plugin/pages/ListPage.tsx
'use client'

import Link from 'next/link'

interface Item {
  id: string
  name: string
}

export function YourListPage() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    fetch('/api/p/your-plugin')
      .then(res => res.json())
      .then(setItems)
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Items</h1>
        <Link
          href="/admin/p/your-plugin/new"
          className="bg-primary-600 text-white px-4 py-2 rounded"
        >
          Add New
        </Link>
      </div>
      {/* List items */}
    </div>
  )
}
```

```tsx
// src/plugins/your-plugin/pages/PublicPage.tsx
import { prisma } from '@/lib/prisma'

export async function YourPublicPage() {
  const items = await prisma.yourModel.findMany()

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Feature</h1>
      {/* Display items */}
    </div>
  )
}
```

Export all pages from an index file:

```typescript
// src/plugins/your-plugin/pages/index.ts
export { YourListPage } from './ListPage'
export { YourNewPage } from './NewPage'
export { YourEditPage } from './EditPage'
export { YourPublicPage } from './PublicPage'
```

### 4. Create API Handlers

API handlers are plain objects with HTTP method handlers:

```typescript
// src/plugins/your-plugin/api/items.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const items = await prisma.yourModel.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await req.json()
  const item = await prisma.yourModel.create({ data })
  return NextResponse.json(item)
}
```

```typescript
// src/plugins/your-plugin/api/item-by-id.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// The id parameter is passed in the params object
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const item = await prisma.yourModel.findUnique({
    where: { id: params.id },
  })

  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(item)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await req.json()
  const item = await prisma.yourModel.update({
    where: { id: params.id },
    data,
  })

  return NextResponse.json(item)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.yourModel.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}
```

### 5. Register Your Plugin

Add your plugin to the plugin modules registry:

```typescript
// src/lib/plugins/modules.ts
export const pluginModules: Record<string, () => Promise<{ plugin: PluginDefinition }>> = {
  concerts: () => import('@plugins/concerts'),
  'your-plugin': () => import('@plugins/your-plugin'),  // Add your plugin
}
```

### 6. Create Database Schema

If your plugin needs database tables, create a `schema.prisma` file in your plugin folder:

```prisma
// src/plugins/your-plugin/schema.prisma
// Your Plugin Database Schema

model YourModel {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

The plugin's schema will be automatically synced to `prisma/schema/` when you run:

```bash
npm run db:sync      # Sync plugin schemas
npm run db:push      # Sync and push to database
npm run db:generate  # Sync and regenerate Prisma client
```

The sync script copies all plugin `schema.prisma` files to the `prisma/schema/` folder, where Prisma's multi-file schema feature combines them with the base schema.

**Important notes:**
- Plugin schemas should only define models, not `generator` or `datasource` blocks
- Model names must be unique across all plugins
- After adding or modifying a schema, run `npm run db:push` to update the database

## Plugin API Reference

### PluginDefinition Interface

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique plugin identifier |
| `name` | `string` | Yes | Display name |
| `description` | `string` | Yes | Plugin description |
| `version` | `string` | Yes | Semantic version |
| `author` | `string` | No | Plugin author |
| `defaultPublicPath` | `string` | No | Default URL path for public pages |
| `adminNavigation` | `object` | No | Admin sidebar navigation config |
| `adminPages` | `array` | No | Array of admin page definitions |
| `publicPage` | `Component` | No | React component for public page |
| `homepageSection` | `object` | No | Homepage section config (priority + component) |
| `apiRoutes` | `object` | No | Map of route keys to API handlers |
| `onEnable` | `function` | No | Called when plugin is enabled |
| `onDisable` | `function` | No | Called when plugin is disabled |

### Homepage Section

```typescript
interface PluginHomepageSection {
  priority?: number                          // Higher = appears first (default: 0)
  component: ComponentType<HomepageSectionProps>
}

interface HomepageSectionProps {
  pluginId: string
  publicPath: string
}
```

### Admin Page Definition

```typescript
interface AdminPageDefinition {
  path: string                    // URL path segment ('' for root, 'new', '[id]', etc.)
  component: React.ComponentType  // React component to render
}
```

### API Route Handler

API route handlers should export HTTP method functions:

```typescript
interface ApiRouteHandler {
  GET?: (req: NextRequest, context: { params: Record<string, string> }) => Promise<NextResponse>
  POST?: (req: NextRequest, context: { params: Record<string, string> }) => Promise<NextResponse>
  PUT?: (req: NextRequest, context: { params: Record<string, string> }) => Promise<NextResponse>
  DELETE?: (req: NextRequest, context: { params: Record<string, string> }) => Promise<NextResponse>
}
```

### Checking Plugin Status

```typescript
import { isServerPluginEnabled, getServerPluginPublicPath } from '@/lib/plugins/server'

// Check if enabled
const isEnabled = await isServerPluginEnabled('your-plugin')

// Get the configured public path
const publicPath = await getServerPluginPublicPath('your-plugin')
```

## Plugin Translations (i18n)

Plugins can provide their own translations, which are automatically merged with the core CMS translations. This keeps your plugin fully self-contained.

### 1. Create Translation Files

Create an `i18n/` folder in your plugin with JSON files for each supported locale:

```
src/plugins/your-plugin/
  i18n/
    en.json
    nl.json
```

Each translation file should contain a namespace matching your plugin id:

```json
// src/plugins/your-plugin/i18n/en.json
{
    "your-plugin": {
        "navName": "Your Feature",
        "title": "Your Feature",
        "description": "Description of your feature",
        "noItems": "No items found.",
        "addNew": "Add New Item"
    }
}
```

```json
// src/plugins/your-plugin/i18n/nl.json
{
    "your-plugin": {
        "navName": "Jouw Functie",
        "title": "Jouw Functie",
        "description": "Beschrijving van jouw functie",
        "noItems": "Geen items gevonden.",
        "addNew": "Nieuw item toevoegen"
    }
}
```

**Important:** The `navName` key is used for the navigation menu (header, footer, sidebar). If not provided, the plugin's `name` property will be used instead.

### 2. Register Translations in Plugin Definition

Import your translation files and add them to the plugin definition:

```typescript
// src/plugins/your-plugin/index.tsx
import { PluginDefinition } from '@/lib/plugins/types'
import translationsEn from './i18n/en.json'
import translationsNl from './i18n/nl.json'

export const plugin: PluginDefinition = {
  id: 'your-plugin',
  name: 'Your Plugin',
  // ... other fields

  // Add translations for each supported locale
  translations: {
    en: translationsEn,
    nl: translationsNl,
  },
}
```

### 3. Use Translations in Components

**In Server Components:**

```tsx
import { getTranslations } from 'next-intl/server'

export async function YourComponent() {
  const t = await getTranslations('your-plugin')
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}
```

**In Client Components:**

```tsx
'use client'
import { useTranslations } from 'next-intl'

export function YourClientComponent() {
  const t = useTranslations('your-plugin')
  
  return (
    <button>{t('addNew')}</button>
  )
}
```

### Translation Best Practices

- **Use your plugin ID as the namespace** - This prevents conflicts with other plugins
- **Provide all supported locales** - Currently `en` and `nl` are supported
- **Keep translations close to your plugin code** - Makes the plugin fully self-contained
- **Translations are only loaded when the plugin is enabled** - No overhead for disabled plugins

### Client-Side Hooks

```typescript
import { usePlugins, usePluginEnabled, usePlugin } from '@/lib/plugins/context'

// Get all plugins
const { plugins, enabledPlugins } = usePlugins()

// Check if a specific plugin is enabled
const isEnabled = usePluginEnabled('your-plugin')

// Get a specific plugin
const plugin = usePlugin('your-plugin')
```

## URL Routing

Plugins use dynamic routes for all pages and API endpoints:

| Type | URL Pattern | Example |
|------|-------------|---------|
| Admin Pages | `/admin/p/[pluginId]/[...path]` | `/admin/p/concerts/new` |
| Public Pages | Configurable via admin | `/concerts`, `/shows`, etc. |
| API Routes | `/api/p/[pluginId]/[...path]` | `/api/p/concerts/abc123` |

The public page URL can be customized by administrators from the Plugins settings page.

## Best Practices

1. **Keep plugins self-contained** - All plugin code should be in its folder
2. **Use meaningful IDs** - Lowercase, no spaces, descriptive
3. **Register in modules.ts** - Add your plugin to the pluginModules registry
4. **Provide good documentation** - Include a README.md in your plugin folder
5. **Handle errors gracefully** - API routes should return proper error responses
6. **Version your plugins** - Use semantic versioning

## Example: Concerts Plugin

See the [concerts plugin](./concerts/) for a complete working example of:

- Admin pages (list, create, edit)
- Public page with upcoming/past sections
- API routes with full CRUD operations
- Form components with validation
- Delete confirmation
