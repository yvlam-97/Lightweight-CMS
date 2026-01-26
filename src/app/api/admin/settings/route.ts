import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'main' },
      update: {
        siteName: data.siteName,
        tagline: data.tagline,
        heroImageUrl: data.heroImageUrl,
        aboutText: data.aboutText,
        primaryColor: data.primaryColor,
        defaultLocale: data.defaultLocale,
      },
      create: {
        id: 'main',
        siteName: data.siteName,
        tagline: data.tagline,
        heroImageUrl: data.heroImageUrl,
        aboutText: data.aboutText,
        primaryColor: data.primaryColor,
        defaultLocale: data.defaultLocale,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
