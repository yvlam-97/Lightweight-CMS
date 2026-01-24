import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { DeleteButton } from '@/components/admin/DeleteButton'

async function getPages() {
  return await prisma.page.findMany({
    orderBy: { title: 'asc' },
  })
}

export default async function AdminPagesPage() {
  const pages = await getPages()
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
        <Link href="/admin/pages/new" className="btn-primary">
          Create Page
        </Link>
      </div>
      
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Title</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">URL</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Status</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{page.title}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  /page/{page.slug}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    page.published 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {page.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link 
                      href={`/page/${page.slug}`}
                      target="_blank"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      View
                    </Link>
                    <Link 
                      href={`/admin/pages/${page.id}`}
                      className="text-red-600 hover:text-red-700"
                    >
                      Edit
                    </Link>
                    <DeleteButton 
                      id={page.id} 
                      type="page"
                      name={page.title}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No pages yet. Create your first page!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
