import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

export const metadata = {
  title: 'News',
  description: 'Latest news and updates',
}

async function getNews() {
  return await prisma.newsPost.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function NewsPage() {
  const news = await getNews()
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">News</h1>
      
      {news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((post) => (
            <Link key={post.id} href={`/news/${post.slug}`} className="card group">
              {post.imageUrl && (
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500">
                    {format(new Date(post.createdAt), 'MMMM d, yyyy')}
                  </span>
                  {post.featured && (
                    <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <h2 className="font-bold text-xl mb-2 group-hover:text-primary-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
                <span className="inline-block mt-4 text-primary-600 font-medium">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No news posts yet. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
