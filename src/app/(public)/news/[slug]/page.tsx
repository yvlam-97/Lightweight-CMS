import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

interface Props {
  params: { slug: string }
}

async function getPost(slug: string) {
  return await prisma.newsPost.findUnique({
    where: { slug, published: true },
  })
}

export async function generateMetadata({ params }: Props) {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Not Found' }
  
  return {
    title: post.title,
    description: post.excerpt,
  }
}

// Simple markdown to HTML converter
function renderMarkdown(content: string) {
  let html = content
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
  
  return `<p>${html}</p>`
}

export default async function NewsPostPage({ params }: Props) {
  const post = await getPost(params.slug)
  
  if (!post) {
    notFound()
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/news" className="text-primary-600 hover:text-primary-700 mb-8 inline-block">
        ← Back to News
      </Link>
      
      <article>
        {post.imageUrl && (
          <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-8">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-4">
          <span className="text-gray-500">
            {format(new Date(post.createdAt), 'MMMM d, yyyy')}
          </span>
          {post.featured && (
            <span className="bg-primary-100 text-primary-700 text-sm px-3 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
        
        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />
      </article>
    </div>
  )
}
