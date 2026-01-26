# Plugin API Reference

Complete API documentation for the plugin system.

## PluginDefinition Interface

```typescript
interface PluginDefinition {
  // Required
  id: string
  name: string
  description: string
  version: string

  // Optional
  author?: string
  defaultPublicPath?: string
  adminNavigation?: AdminNavigation
  adminPages?: AdminPageDefinition[]
  publicPage?: ComponentType
  homepageSection?: PluginHomepageSection
  apiRoutes?: Record<string, ApiRouteHandler>
  translations?: Record<string, Record<string, unknown>>
  onEnable?: () => Promise<void>
  onDisable?: () => Promise<void>
}
```

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique plugin identifier (lowercase, no spaces) |
| `name` | `string` | Yes | Display name shown in admin |
| `description` | `string` | Yes | Brief description of the plugin |
| `version` | `string` | Yes | Semantic version (e.g., "1.0.0") |
| `author` | `string` | No | Plugin author name |
| `defaultPublicPath` | `string` | No | Default URL path for public pages |
| `adminNavigation` | `object` | No | Admin sidebar navigation config |
| `adminPages` | `array` | No | Array of admin page definitions |
| `publicPage` | `Component` | No | React component for public page |
| `homepageSection` | `object` | No | Homepage section configuration |
| `apiRoutes` | `object` | No | Map of route keys to API handlers |
| `translations` | `object` | No | Locale-keyed translation objects |
| `onEnable` | `function` | No | Called when plugin is enabled |
| `onDisable` | `function` | No | Called when plugin is disabled |

---

## Admin Navigation

```typescript
interface AdminNavigation {
  name: string
  href: string
  icon?: ComponentType<{ className?: string }>
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Display name in sidebar |
| `href` | `string` | Yes | Link URL (typically `/admin/p/[pluginId]`) |
| `icon` | `Component` | No | Icon component for sidebar |

---

## Admin Page Definition

```typescript
interface AdminPageDefinition {
  path: string
  component: ComponentType
}
```

| Property | Type | Description |
|----------|------|-------------|
| `path` | `string` | URL path segment (`''` for root, `'new'`, `'[id]'`, etc.) |
| `component` | `Component` | React component to render |

**Path Examples:**

| Path | Full URL | Usage |
|------|----------|-------|
| `''` | `/admin/p/your-plugin` | List page |
| `'new'` | `/admin/p/your-plugin/new` | Create page |
| `'[id]'` | `/admin/p/your-plugin/abc123` | Edit page |
| `'settings'` | `/admin/p/your-plugin/settings` | Settings page |

---

## Homepage Section

```typescript
interface PluginHomepageSection {
  priority?: number
  component: ComponentType<HomepageSectionProps>
}

interface HomepageSectionProps {
  pluginId: string
  publicPath: string
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `priority` | `number` | `0` | Higher values appear first on homepage |
| `component` | `Component` | - | Server component to render |

---

## API Route Handler

```typescript
interface ApiRouteHandler {
  GET?: (req: NextRequest, context: RouteContext) => Promise<NextResponse>
  POST?: (req: NextRequest, context: RouteContext) => Promise<NextResponse>
  PUT?: (req: NextRequest, context: RouteContext) => Promise<NextResponse>
  DELETE?: (req: NextRequest, context: RouteContext) => Promise<NextResponse>
}

interface RouteContext {
  params: Record<string, string>
}
```

**Route Key Examples:**

| Key | API URL | Usage |
|-----|---------|-------|
| `''` | `/api/p/your-plugin` | Collection endpoint |
| `'[id]'` | `/api/p/your-plugin/abc123` | Single item endpoint |
| `'search'` | `/api/p/your-plugin/search` | Custom endpoint |

---

## Server-Side Utilities

### Check Plugin Status

```typescript
import { isServerPluginEnabled } from '@/lib/plugins/server'

const isEnabled = await isServerPluginEnabled('your-plugin')
```

### Get Public Path

```typescript
import { getServerPluginPublicPath } from '@/lib/plugins/server'

const publicPath = await getServerPluginPublicPath('your-plugin')
// Returns: '/concerts' or whatever the admin configured
```

### Get All Enabled Plugins

```typescript
import { getEnabledPlugins } from '@/lib/plugins/server'

const plugins = await getEnabledPlugins()
```

---

## Client-Side Hooks

### usePlugins

```typescript
import { usePlugins } from '@/lib/plugins/context'

function MyComponent() {
  const { plugins, enabledPlugins, isLoading } = usePlugins()
  // plugins: all registered plugins
  // enabledPlugins: only enabled plugins
}
```

### usePluginEnabled

```typescript
import { usePluginEnabled } from '@/lib/plugins/context'

function MyComponent() {
  const isEnabled = usePluginEnabled('your-plugin')
}
```

### usePlugin

```typescript
import { usePlugin } from '@/lib/plugins/context'

function MyComponent() {
  const plugin = usePlugin('your-plugin')
  // Returns plugin definition or undefined
}
```

---

## Database Schema

Plugin schemas are automatically synced to the main Prisma schema.

### Location

```
src/plugins/your-plugin/schema.prisma
```

### Format

```prisma
// Only define models - no generator or datasource blocks

model YourModel {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Commands

```bash
npm run db:sync      # Sync plugin schemas to prisma/schema/
npm run db:push      # Sync and push to database
npm run db:generate  # Sync and regenerate Prisma client
```

### Important Notes

- Only define `model` blocks, not `generator` or `datasource`
- Model names must be unique across all plugins
- After modifying schema, run `npm run db:push`

---

## Related Pages

- [Getting Started with Plugins](Getting-Started-with-Plugins)
- [Plugin Tutorial](Plugin-Tutorial)
- [Plugin Internationalization](Plugin-Internationalization)
