import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

interface Props {
  params: { slug: string }
}

async function getPage(slug: string) {
  return await prisma.page.findUnique({
    where: { slug, published: true },
  })
}

export async function generateMetadata({ params }: Props) {
  const page = await getPage(params.slug)
  if (!page) return { title: 'Not Found' }
  
  return {
    title: page.title,
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

export default async function DynamicPage({ params }: Props) {
  const page = await getPage(params.slug)
  
  if (!page) {
    notFound()
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{page.title}</h1>
        
        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(page.content) }}
        />
      </article>
    </div>
  )
}
