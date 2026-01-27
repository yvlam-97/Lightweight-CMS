import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, handleApiError } from '@/lib/api/middleware'

async function updatePost(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()

    const post = await prisma.newsPost.update({
      where: { id: params.id },
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
    return handleApiError(error, 'PUT /api/admin/news/[id]')
  }
}

async function deletePost(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.newsPost.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/news/[id]')
  }
}

export const PUT = withAuth(updatePost)
export const DELETE = withAuth(deletePost)
