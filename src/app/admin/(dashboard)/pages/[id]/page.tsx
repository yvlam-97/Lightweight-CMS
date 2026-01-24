import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageForm } from '@/components/admin/PageForm'

interface Props {
  params: { id: string }
}

async function getPage(id: string) {
  return await prisma.page.findUnique({ where: { id } })
}

export default async function EditPagePage({ params }: Props) {
  const page = await getPage(params.id)
  
  if (!page) {
    notFound()
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Page</h1>
      <PageForm page={page} />
    </div>
  )
}
