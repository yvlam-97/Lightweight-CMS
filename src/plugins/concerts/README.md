# Concerts Plugin

This plugin adds concert and event management functionality to your CMS.

## Features

- **Admin Management**: Full CRUD interface for managing concerts
- **Public Display**: Beautiful concert listing page with upcoming and past shows
- **Configurable URL**: Change the public URL path in the Plugins settings

## Installation

This plugin is included by default. Enable it from the Admin > Plugins page.

## Prisma Schema

The following model needs to be in your `prisma/schema.prisma`:

```prisma
model Concert {
  id          String   @id @default(cuid())
  title       String
  venue       String
  city        String
  date        DateTime
  time        String
  description String?
  ticketUrl   String?
  imageUrl    String?
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

After adding the model, run:

```bash
npx prisma migrate dev
```

## Configuration

You can customize the public URL path for the concerts page from the Admin > Plugins page. The default path is `/concerts`.

## Usage

### Admin

Navigate to Admin > Concerts to:
- View all concerts
- Add new concerts
- Edit existing concerts
- Delete concerts
- Publish/unpublish concerts

### Public

The public concerts page automatically displays:
- **Upcoming Shows**: Future concerts sorted by date
- **Past Shows**: Previous concerts (dimmed)

Each concert shows:
- Event title
- Venue and city
- Date and time
- Optional description
- Optional ticket link
- Optional image
