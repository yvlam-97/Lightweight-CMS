# Lightweight CMS

A lightweight, extensible content management system built with Next.js. Features a plugin system for adding custom functionality.

## The Story

This project started as a simple website for my band. All I needed was a page to list upcoming concerts and maybe some news posts. Naturally, I ended up building a fully modular CMS with a plugin architecture, self-contained database schemas, dynamic routing, and a component system that would make enterprise software blush.

Could I have just hardcoded a few pages? Absolutely. Did I spend more time building an extensible plugin system instead? You bet. Was it worth it? Ask me again when I add my second plugin.

## Features

- **Plugin System** - Extend functionality with modular plugins
- **Multi-language Support** - Built-in i18n with Dutch and English (easily extensible)
- **Fully Responsive** - Works on all devices
- **Easy Customization** - Change colors and branding from the admin panel
- **News Posts** - Share updates with markdown support
- **Custom Pages** - Create About, Contact, or any other pages
- **Social Media Integration** - Configurable social media links (12+ platforms)
- **Secure Admin** - Password-protected CMS with optional Google login
- **Fast and Lightweight** - SQLite database, no external server required
- **Easy Deployment** - Deploy to Vercel in minutes

## Documentation

| Page | Description |
|------|-------------|
| [Installation](Installation) | Setup and configuration guide |
| [Plugin Development](Plugin-Development) | Overview of the plugin system |
| [Getting Started with Plugins](Getting-Started-with-Plugins) | Plugin architecture and structure |
| [Plugin Tutorial](Plugin-Tutorial) | Step-by-step plugin creation guide |
| [Plugin API Reference](Plugin-API-Reference) | Complete API documentation |
| [Plugin Internationalization](Plugin-Internationalization) | Adding translations to plugins |

## Tech Stack

- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **Prisma** - Type-safe database ORM
- **SQLite** - File-based database (zero configuration)
- **NextAuth.js** - Authentication

## Quick Links

- [GitHub Repository](https://github.com/yvlam-97/Lightweight-CMS)
- [Report an Issue](https://github.com/yvlam-97/Lightweight-CMS/issues)
- [MIT License](https://github.com/yvlam-97/Lightweight-CMS/blob/main/LICENSE)
