import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, handleApiError } from '@/lib/api/middleware'

async function updatePage(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()

    const page = await prisma.page.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        published: data.published || false,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    return handleApiError(error, 'PUT /api/admin/page/[id]')
  }
}

async function deletePage(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.page.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'DELETE /api/admin/page/[id]')
  }
}

export const PUT = withAuth(updatePage)
export const DELETE = withAuth(deletePage)
