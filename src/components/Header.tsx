import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getEnabledPluginNavItems } from '@/lib/plugins/server'

async function getSettings() {
  return await prisma.siteSettings.findUnique({ where: { id: 'main' } })
}

export async function Header() {
  const settings = await getSettings()
  const pluginNavItems = await getEnabledPluginNavItems()

  return (
    <header className="bg-gray-900 shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary-500">
              {settings?.siteName || 'My Site'}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-primary-500 transition-colors">
              Home
            </Link>
            <Link href="/news" className="text-gray-300 hover:text-primary-500 transition-colors">
              News
            </Link>
            {/* Dynamic plugin navigation */}
            {pluginNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-primary-500 transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Link href="/page/about" className="text-gray-300 hover:text-primary-500 transition-colors">
              About
            </Link>
            <Link href="/page/contact" className="text-gray-300 hover:text-primary-500 transition-colors">
              Contact
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <MobileMenu siteName={settings?.siteName || 'My Site'} pluginNavItems={pluginNavItems} />
          </div>
        </div>
      </nav>
    </header>
  )
}

function MobileMenu({ siteName, pluginNavItems }: { siteName: string; pluginNavItems: Array<{ name: string; href: string }> }) {
  return (
    <div className="relative group">
      <button className="p-2 text-gray-300 hover:text-primary-500">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 hidden group-focus-within:block">
        <Link href="/" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-primary-500">Home</Link>
        <Link href="/news" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-primary-500">News</Link>
        {/* Dynamic plugin navigation */}
        {pluginNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-primary-500"
          >
            {item.name}
          </Link>
        ))}
        <Link href="/page/about" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-primary-500">About</Link>
        <Link href="/page/contact" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-primary-500">Contact</Link>
      </div>
    </div>
  )
}
