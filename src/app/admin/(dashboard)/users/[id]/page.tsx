import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { UserForm } from '@/components/admin/UserForm'

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      accounts: {
        select: { provider: true },
      },
    },
  })

  if (!user) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit User</h1>
      <UserForm user={user} />
    </div>
  )
}
