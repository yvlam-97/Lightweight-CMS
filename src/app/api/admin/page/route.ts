import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()
    
    const page = await prisma.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        published: data.published || false,
      },
    })

    return NextResponse.json(page)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
}
