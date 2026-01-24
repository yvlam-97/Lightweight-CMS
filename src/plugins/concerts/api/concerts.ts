import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ApiRouteHandler } from '@/lib/plugins/types'

export const GET: ApiRouteHandler = async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const publishedOnly = searchParams.get('published') === 'true'

    const concerts = await prisma.concert.findMany({
      where: publishedOnly ? { published: true } : undefined,
      orderBy: { date: 'asc' },
    })
    return NextResponse.json(concerts)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch concerts' },
      { status: 500 }
    )
  }
}

export const POST: ApiRouteHandler = async (req) => {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()

    const concert = await prisma.concert.create({
      data: {
        title: data.title,
        venue: data.venue,
        city: data.city,
        date: new Date(data.date),
        time: data.time,
        description: data.description || null,
        ticketUrl: data.ticketUrl || null,
        imageUrl: data.imageUrl || null,
        published: data.published || false,
      },
    })

    return NextResponse.json(concert)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create concert' },
      { status: 500 }
    )
  }
}
