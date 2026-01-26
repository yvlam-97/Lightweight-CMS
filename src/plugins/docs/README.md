# Plugin Development Guide

This guide explains how to create custom plugins for the CMS.

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](GETTING_STARTED.md) | Quick overview and plugin structure |
| [Tutorial](TUTORIAL.md) | Step-by-step guide to creating a plugin |
| [API Reference](API_REFERENCE.md) | Complete API documentation |
| [Internationalization](I18N.md) | Adding translations to your plugin |

## Quick Start

1. Create your plugin folder in `src/plugins/your-plugin/`
2. Create the plugin definition in `index.tsx`
3. Register your plugin in `src/lib/plugins/modules.ts`
4. Run `npm run db:sync` if your plugin has a database schema

## Example Plugin

See the [concerts plugin](../concerts/) for a complete working example.
