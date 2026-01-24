import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
    },
  })

  console.log('Created admin user:', admin.email)

  // Create site settings - customize these for your band!
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      siteName: 'Your Site Name',
      tagline: 'Your tagline goes here',
      aboutText: 'Tell your story here. This text appears on your homepage.',
      primaryColor: '#dc2626', // Default red - change in admin settings
      socialLinks: JSON.stringify({
        instagram: 'https://instagram.com/yourband',
        facebook: 'https://facebook.com/yourband',
        twitter: 'https://twitter.com/yourband',
        youtube: 'https://youtube.com/@yourband',
      }),
    },
  })

  console.log('Created site settings')

  // Create sample news posts
  const news1 = await prisma.newsPost.upsert({
    where: { slug: 'welcome-to-our-new-website' },
    update: {},
    create: {
      title: 'Welcome to Our New Website!',
      slug: 'welcome-to-our-new-website',
      excerpt: 'We are excited to launch our brand new website with a fresh look and new features.',
      content: `
# Welcome to Our New Website!

We're thrilled to announce the launch of our brand new website! 

## What's New?

- **Fresh Design** - A modern, clean look that works great on all devices
- **Easy Navigation** - Find what you need quickly
- **Concert Calendar** - Never miss a show with our updated calendar
- **News Updates** - Stay in the loop with the latest band news

## Stay Connected

Make sure to follow us on social media and sign up for our newsletter to get the latest updates about upcoming shows and releases.

Thanks for being part of our journey!
      `.trim(),
      published: true,
      featured: true,
    },
  })

  const news2 = await prisma.newsPost.upsert({
    where: { slug: 'upcoming-summer-tour' },
    update: {},
    create: {
      title: 'Upcoming Summer Tour Announced',
      slug: 'upcoming-summer-tour',
      excerpt: 'We are hitting the road this summer! Check out all the dates and venues.',
      content: `
# Summer Tour 2026

We're excited to announce our upcoming summer tour! We'll be performing at venues across the country.

## Tour Highlights

- Multiple cities
- Special guests at select shows
- New material from our upcoming album
- Meet & greet opportunities

## Tickets

Tickets go on sale next week. Sign up for our mailing list to get early access!

See you on the road!
      `.trim(),
      published: true,
      featured: false,
    },
  })

  console.log('Created sample news posts')

  // Create sample concerts/events
  const concerts = [
    {
      title: 'Summer Kickoff Concert',
      venue: 'The Main Stage',
      city: 'New York, NY',
      date: new Date('2026-06-15'),
      time: '8:00 PM',
      description: 'Join us for the kickoff show of our summer tour! Special guests TBA.',
      ticketUrl: 'https://example.com/tickets',
      published: true,
    },
    {
      title: 'Music Festival 2026',
      venue: 'Festival Grounds',
      city: 'Los Angeles, CA',
      date: new Date('2026-07-20'),
      time: '6:00 PM',
      description: 'Catch us at Music Festival 2026 on the main stage!',
      ticketUrl: 'https://example.com/festival',
      published: true,
    },
    {
      title: 'Acoustic Night',
      venue: 'The Listening Room',
      city: 'Nashville, TN',
      date: new Date('2026-08-10'),
      time: '7:30 PM',
      description: 'An intimate acoustic performance featuring stripped-down versions of our songs.',
      ticketUrl: '',
      published: true,
    },
  ]

  for (const concert of concerts) {
    await prisma.concert.create({ data: concert })
  }

  console.log('Created sample concerts')

  // Create sample pages
  const aboutPage = await prisma.page.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      title: 'About Us',
      slug: 'about',
      content: `
# About Us

Welcome to our band! We're a group of passionate musicians who came together to create music that moves people.

## Our Story

Founded in [year], we started out playing small local venues and have grown into [describe your journey]. Our sound blends [genres/influences] to create something unique.

## The Band

- **Member Name** - Instrument/Role
- **Member Name** - Instrument/Role
- **Member Name** - Instrument/Role
- **Member Name** - Instrument/Role

## Our Music

We've released [number] albums and [number] singles. Our music has been featured in [notable placements/achievements].

## What Drives Us

Music is our passion. Every song we write, every show we play, comes from a genuine love for what we do. We're grateful for every fan who supports us on this journey.
      `.trim(),
      published: true,
    },
  })

  const contactPage = await prisma.page.upsert({
    where: { slug: 'contact' },
    update: {},
    create: {
      title: 'Contact',
      slug: 'contact',
      content: `
# Contact Us

We'd love to hear from you! Here's how you can get in touch.

## General Inquiries

**Email:** contact@yourband.com

## Booking

For booking inquiries, please contact:

**Email:** booking@yourband.com

## Press & Media

For press inquiries and interview requests:

**Email:** press@yourband.com

## Follow Us

Stay connected on social media for the latest updates, behind-the-scenes content, and more!

## Mailing List

Sign up for our newsletter to get exclusive updates, early access to tickets, and special offers.
      `.trim(),
      published: true,
    },
  })

  console.log('Created sample pages')
  console.log('Seed completed successfully!')
  console.log('')
  console.log('='.repeat(50))
  console.log('Default login credentials:')
  console.log('Email: admin@example.com')
  console.log('Password: admin123')
  console.log('='.repeat(50))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
