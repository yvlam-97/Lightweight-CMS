# Getting Started with Plugins

## Plugin Architecture

Plugins are self-contained modules that provide:

- Admin pages rendered via dynamic routes (`/admin/p/[pluginId]/...`)
- Public pages rendered via configurable paths
- API routes via dynamic routes (`/api/p/[pluginId]/...`)
- Custom navigation in the admin sidebar
- Self-contained database schemas
- Translations for multiple languages

## Plugin Structure

Each plugin should be in its own folder within the `src/plugins/` directory:

```
src/plugins/
  your-plugin/
    index.tsx        # Main plugin definition (required)
    schema.prisma    # Database schema (optional)
    README.md        # Documentation (recommended)
    components/      # React components
      index.ts
      MyForm.tsx
    pages/           # Page components
      index.ts
      ListPage.tsx
      EditPage.tsx
    api/             # API route handlers
      items.ts
      item-by-id.ts
    i18n/            # Translations
      en.json
      nl.json
    lib/             # Utility functions
```

## Path Aliases

The project includes path aliases for cleaner imports:

- `@/*` - Points to `./src/*`
- `@plugins/*` - Points to `./src/plugins/*`

Example usage:

```typescript
import { prisma } from '@/lib/prisma'
import { PluginDefinition } from '@/lib/plugins/types'
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
4. **Provide documentation** - Include a README.md in your plugin folder
5. **Handle errors gracefully** - API routes should return proper error responses
6. **Version your plugins** - Use semantic versioning
7. **Support all locales** - Provide translations for en and nl

## Next Steps

- [Tutorial](TUTORIAL.md) - Build your first plugin step by step
- [API Reference](API_REFERENCE.md) - Complete API documentation
