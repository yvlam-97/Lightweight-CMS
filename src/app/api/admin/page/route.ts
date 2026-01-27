import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, handleApiError } from '@/lib/api/middleware'

async function createPage(req: NextRequest) {
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
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/page')
  }
}

export const POST = withAuth(createPage)
