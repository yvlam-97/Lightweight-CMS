# Lightweight CMS

A lightweight, extensible content management system built with Next.js. Features a plugin system for adding custom functionality.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

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

## Plugin System

The CMS includes a flexible plugin system that allows you to:

- **Enable/Disable Features** - Toggle plugins from the admin panel
- **Custom Public URLs** - Configure the URL path for each plugin's public pages
- **Create Your Own** - Build custom plugins to extend functionality

### Built-in Plugins

- **Concerts** - Manage concerts, shows, and events with venue information, dates, and ticket links

### Managing Plugins

1. Go to **Admin > Plugins** in the admin panel
2. Toggle plugins on/off
3. Configure custom URL paths for public pages

### Creating Plugins

See the [Plugin Development Guide](https://github.com/yvlam-97/Lightweight-CMS/wiki/Plugin-Development) for detailed instructions on creating custom plugins.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **Prisma** - Type-safe database ORM
- **SQLite** - File-based database (zero configuration)
- **NextAuth.js** - Authentication

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/lightweight-cms.git
cd lightweight-cms
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings (defaults work for development).

### 3. Set Up Database

```bash
npx prisma db push
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see your site.

## Admin Access

- **URL:** http://localhost:3000/admin
- **Email:** `admin@example.com`
- **Password:** `admin123`

**Important:** Change these credentials before deploying to production.

## Customization

### Brand Colors

Edit `tailwind.config.ts` to change your brand colors:

```typescript
primary: {
  600: '#dc2626',  // Change this to your brand color
  // ... other shades
}
```

Popular color options:

| Color  | Hex Code  |
|--------|-----------|
| Red    | `#dc2626` |
| Blue   | `#2563eb` |
| Purple | `#9333ea` |
| Green  | `#16a34a` |
| Orange | `#ea580c` |
| Pink   | `#db2777` |

Use [UI Colors](https://uicolors.app) to generate a full color palette from any hex code.

### Site Settings

After logging into the admin panel, you can customize:

**Settings:**
- Site name
- Tagline
- About text
- Brand color

**Social Media:**
- Add/remove social media platforms
- Configure links for Instagram, Facebook, X, YouTube, Spotify, TikTok, LinkedIn, and more

## Project Structure

```
lightweight-cms/
├── prisma/
│   ├── schema/            # Multi-file Prisma schema
│   │   ├── base.prisma    # Core database models
│   │   └── plugin-*.prisma # Plugin schemas (auto-synced)
│   └── seed.ts            # Sample data
├── scripts/
│   └── sync-plugin-schemas.ts  # Schema sync script
├── src/
│   ├── app/
│   │   ├── (public)/      # Public pages (home, news, etc.)
│   │   └── admin/         # CMS admin pages
│   ├── i18n/              # Internationalization
│   │   ├── config.ts      # Locale configuration
│   │   ├── request.ts     # Translation loading
│   │   └── messages/      # Translation files (en.json, nl.json)
│   │   └── api/           # API routes
│   ├── components/        # React components
│   │   └── admin/         # Admin-specific components
│   ├── lib/
│   │   ├── plugins/       # Plugin system
│   │   ├── prisma.ts      # Database client
│   │   └── auth.ts        # Authentication
│   └── plugins/           # Plugin implementations
│       ├── concerts/      # Concerts plugin (with schema.prisma)
│       └── PLUGIN_DEVELOPMENT.md
├── tailwind.config.ts     # Color customization
└── .env.example           # Environment template
```

## Database Commands

```bash
npm run db:sync      # Sync plugin schemas to prisma/schema/
npm run db:push      # Sync schemas and push to database
npm run db:generate  # Sync schemas and regenerate Prisma client
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed the database with sample data
```

## Google OAuth (Optional)

To enable "Sign in with Google":

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Navigate to APIs & Services > Credentials
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Add credentials to `.env`:

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your production domain
   - Google OAuth credentials (if using)
4. Deploy

### Database Options

SQLite works well for most sites. For higher traffic, consider:

| Service | Type | Notes |
|---------|------|-------|
| [Turso](https://turso.tech) | SQLite | SQLite-compatible, edge-deployed |
| [PlanetScale](https://planetscale.com) | MySQL | Serverless, branching support |
| [Supabase](https://supabase.com) | PostgreSQL | Full backend platform |

To switch databases, update `DATABASE_URL` in `.env` and `provider` in `prisma/schema.prisma`.

## Content Management

### News Posts

- Create and edit posts with markdown formatting
- Feature important posts to highlight them
- Add cover images via URL

### Concerts (Plugin)

- Enable the Concerts plugin from Admin > Plugins
- Add venue, city, date, and time
- Include ticket links
- Past concerts automatically move to "Past Shows" section
- Customize the public URL path

### Custom Pages

- Create any page with a custom URL slug
- Use markdown for rich content
- Perfect for About, Contact, and similar pages

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
