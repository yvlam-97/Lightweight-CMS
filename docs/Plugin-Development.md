# Plugin Development

The CMS includes a flexible plugin system that allows you to extend functionality.

## Overview

- **Enable/Disable Features** - Toggle plugins from the admin panel
- **Custom Public URLs** - Configure the URL path for each plugin's public pages
- **Create Your Own** - Build custom plugins to extend functionality


## Built-in Plugins

- **Concerts** - Manage concerts, shows, and events with venue information, dates, and ticket links
- **Photos** - Manage photo albums and galleries with upload, cover selection, and lightbox viewing

## Managing Plugins

1. Go to **Admin > Plugins** in the admin panel
2. Toggle plugins on/off
3. Configure custom URL paths for public pages

## Documentation

| Page | Description |
|------|-------------|
| [Getting Started with Plugins](Getting-Started-with-Plugins) | Plugin architecture and structure |
| [Plugin Tutorial](Plugin-Tutorial) | Step-by-step plugin creation guide |
| [Plugin API Reference](Plugin-API-Reference) | Complete API documentation |
| [Plugin Internationalization](Plugin-Internationalization) | Adding translations to plugins |

## Quick Start

1. Create your plugin folder in `src/plugins/your-plugin/`
2. Create the plugin definition in `index.tsx`
3. Register your plugin in `src/lib/plugins/modules.ts`
4. Run `npm run db:sync` if your plugin has a database schema

## Example Plugin

See the `concerts` and `photos` plugins in `src/plugins/` for complete working examples of:

- Admin pages (list, create, edit)
- Public page with upcoming/past sections
- API routes with full CRUD operations
- Form components with validation
- Delete confirmation
- Translations (i18n)
- Database schema
