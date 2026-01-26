# Installation

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yvlam-97/Lightweight-CMS.git
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

---

## Admin Access

- **URL:** http://localhost:3000/admin
- **Email:** `admin@example.com`
- **Password:** `admin123`

> ⚠️ **Important:** Change these credentials before deploying to production.

---

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
- Default language

**Social Media:**
- Add/remove social media platforms
- Configure links for Instagram, Facebook, X, YouTube, Spotify, TikTok, LinkedIn, and more

---

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
│   ├── components/        # React components
│   │   └── admin/         # Admin-specific components
│   ├── lib/
│   │   ├── plugins/       # Plugin system
│   │   ├── prisma.ts      # Database client
│   │   └── auth.ts        # Authentication
│   └── plugins/           # Plugin implementations
│       └── concerts/      # Concerts plugin (with schema.prisma)
├── tailwind.config.ts     # Color customization
└── .env.example           # Environment template
```

---

## Database Commands

```bash
npm run db:sync      # Sync plugin schemas to prisma/schema/
npm run db:push      # Sync schemas and push to database
npm run db:generate  # Sync schemas and regenerate Prisma client
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed the database with sample data
```

---

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

---

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

---

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
