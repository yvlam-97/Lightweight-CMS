import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ApiRouteHandler } from '@/lib/plugins/types'

export const GET: ApiRouteHandler = async (req, { params: paramsPromise }) => {
  const params = await paramsPromise
  try {
    const concert = await prisma.concert.findUnique({
      where: { id: params.id },
    })

    if (!concert) {
      return NextResponse.json({ error: 'Concert not found' }, { status: 404 })
    }

    return NextResponse.json(concert)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch concert' },
      { status: 500 }
    )
  }
}

export const PUT: ApiRouteHandler = async (req, { params: paramsPromise }) => {
  const params = await paramsPromise
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()

    const concert = await prisma.concert.update({
      where: { id: params.id },
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
      { error: 'Failed to update concert' },
      { status: 500 }
    )
  }
}

export const DELETE: ApiRouteHandler = async (
  req,
  { params: paramsPromise }
) => {
  const params = await paramsPromise
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.concert.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete concert' },
      { status: 500 }
    )
  }
}
