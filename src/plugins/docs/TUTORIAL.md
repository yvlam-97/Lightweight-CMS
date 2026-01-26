# Plugin Tutorial

This guide walks you through creating a complete plugin from scratch.

## 1. Create the Plugin Folder

```bash
mkdir src/plugins/your-plugin
mkdir src/plugins/your-plugin/components
mkdir src/plugins/your-plugin/pages
mkdir src/plugins/your-plugin/api
mkdir src/plugins/your-plugin/i18n
```

## 2. Create the Plugin Definition

Create `src/plugins/your-plugin/index.tsx`:

```typescript
import { PluginDefinition } from '@/lib/plugins/types'
import { YourListPage, YourNewPage, YourEditPage, YourPublicPage } from './pages'
import { YourHomepageSection } from './components'
import * as itemsApi from './api/items'
import * as itemByIdApi from './api/item-by-id'
import translationsEn from './i18n/en.json'
import translationsNl from './i18n/nl.json'

// Icon for the admin sidebar
function MyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {/* SVG path here */}
    </svg>
  )
}

export const plugin: PluginDefinition = {
  // Required fields
  id: 'your-plugin',
  name: 'Your Plugin',
  description: 'Description of what your plugin does',
  version: '1.0.0',

  // Optional fields
  author: 'Your Name',
  defaultPublicPath: '/your-feature',

  // Admin sidebar navigation
  adminNavigation: {
    name: 'Your Feature',
    href: '/admin/p/your-plugin',
    icon: MyIcon,
  },

  // Admin pages
  adminPages: [
    { path: '', component: YourListPage },
    { path: 'new', component: YourNewPage },
    { path: '[id]', component: YourEditPage },
  ],

  // Public page component
  publicPage: YourPublicPage,

  // Homepage section (optional)
  homepageSection: {
    priority: 10,
    component: YourHomepageSection,
  },

  // API routes
  apiRoutes: {
    '': itemsApi,
    '[id]': itemByIdApi,
  },

  // Translations
  translations: {
    en: translationsEn,
    nl: translationsNl,
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

## 3. Create Page Components

### List Page

Create `src/plugins/your-plugin/pages/ListPage.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
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
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <Link href={`/admin/p/your-plugin/${item.id}`}>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Public Page

Create `src/plugins/your-plugin/pages/PublicPage.tsx`:

```tsx
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

### Export Pages

Create `src/plugins/your-plugin/pages/index.ts`:

```typescript
export { YourListPage } from './ListPage'
export { YourNewPage } from './NewPage'
export { YourEditPage } from './EditPage'
export { YourPublicPage } from './PublicPage'
```

## 4. Create Homepage Section

Create `src/plugins/your-plugin/components/HomepageSection.tsx`:

```tsx
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

## 5. Create API Handlers

### Collection Endpoint

Create `src/plugins/your-plugin/api/items.ts`:

```typescript
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

### Single Item Endpoint

Create `src/plugins/your-plugin/api/item-by-id.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

## 6. Create Database Schema

If your plugin needs database tables, create `src/plugins/your-plugin/schema.prisma`:

```prisma
// Your Plugin Database Schema

model YourModel {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Important:**
- Only define models, not `generator` or `datasource` blocks
- Model names must be unique across all plugins

## 7. Add Translations

Create `src/plugins/your-plugin/i18n/en.json`:

```json
{
  "your-plugin": {
    "navName": "Your Feature",
    "title": "Your Feature",
    "noItems": "No items found.",
    "addNew": "Add New Item"
  }
}
```

Create `src/plugins/your-plugin/i18n/nl.json`:

```json
{
  "your-plugin": {
    "navName": "Jouw Functie",
    "title": "Jouw Functie",
    "noItems": "Geen items gevonden.",
    "addNew": "Nieuw item toevoegen"
  }
}
```

## 8. Register Your Plugin

Add your plugin to `src/lib/plugins/modules.ts`:

```typescript
export const pluginModules: Record<string, () => Promise<{ plugin: PluginDefinition }>> = {
  concerts: () => import('@plugins/concerts'),
  'your-plugin': () => import('@plugins/your-plugin'),  // Add this line
}
```

## 9. Sync and Build

```bash
npm run db:sync      # Sync plugin schemas
npm run db:push      # Push to database
npm run dev          # Start development server
```

Your plugin is now ready! Visit `/admin/p/your-plugin` to see it in action.
