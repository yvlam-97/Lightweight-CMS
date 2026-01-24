import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { NewsForm } from '@/components/admin/NewsForm'

interface Props {
  params: { id: string }
}

async function getPost(id: string) {
  return await prisma.newsPost.findUnique({ where: { id } })
}

export default async function EditNewsPage({ params }: Props) {
  const post = await getPost(params.id)
  
  if (!post) {
    notFound()
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit News Post</h1>
      <NewsForm post={post} />
    </div>
  )
}
