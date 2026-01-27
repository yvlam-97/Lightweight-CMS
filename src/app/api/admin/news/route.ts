import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, handleApiError } from '@/lib/api/middleware'

async function createPost(req: NextRequest) {
  try {
    const data = await req.json()

    const post = await prisma.newsPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        imageUrl: data.imageUrl || null,
        published: data.published || false,
        featured: data.featured || false,
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/news')
  }
}

export const POST = withAuth(createPost)
