import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getEnabledPluginNavItems } from '@/lib/plugins/server'
import { getTranslations, getLocale } from 'next-intl/server'

async function getSettings() {
  return await prisma.siteSettings.findUnique({ where: { id: 'main' } })
}

export async function Footer() {
  const settings = await getSettings()
  const socialLinks = settings?.socialLinks ? JSON.parse(settings.socialLinks) : {}
  const t = await getTranslations('common')
  const tNav = await getTranslations('navigation')
  const tFooter = await getTranslations('footer')
  const locale = await getLocale()
  const pluginNavItems = await getEnabledPluginNavItems(locale)

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-primary-500 mb-4">
              {settings?.siteName || 'My Site'}
            </h3>
            <p className="text-gray-400">
              {settings?.tagline || 'Welcome to our site'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary-500">{tNav('quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/news" className="text-gray-400 hover:text-white transition-colors">
                  {t('news')}
                </Link>
              </li>
              {/* Dynamic plugin links */}
              {pluginNavItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-gray-400 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/page/about" className="text-gray-400 hover:text-white transition-colors">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href="/page/contact" className="text-gray-400 hover:text-white transition-colors">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary-500">{tNav('followUs')}</h4>
            <div className="flex flex-wrap gap-4">
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">X (Twitter)</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">YouTube</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
              {socialLinks.spotify && (
                <a href={socialLinks.spotify} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Spotify</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </a>
              )}
              {socialLinks.tiktok && (
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">TikTok</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              )}
              {socialLinks.bandcamp && (
                <a href={socialLinks.bandcamp} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Bandcamp</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M0 18.75l7.437-13.5H24l-7.438 13.5H0z" />
                  </svg>
                </a>
              )}
              {socialLinks.soundcloud && (
                <a href={socialLinks.soundcloud} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">SoundCloud</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.1-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c.014.057.045.094.09.094s.089-.037.099-.094l.19-1.308-.19-1.334c-.01-.057-.045-.09-.09-.09m1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.104.106.104.061 0 .12-.044.12-.104l.24-2.458-.24-2.563c0-.06-.045-.104-.12-.104m.945-.089c-.075 0-.135.06-.15.135l-.193 2.64.21 2.544c.016.077.075.138.149.138.075 0 .135-.061.15-.138l.225-2.544-.225-2.64c-.015-.075-.06-.135-.15-.135m.93-.132c-.09 0-.149.075-.165.165l-.195 2.775.195 2.52c.016.09.075.164.165.164.089 0 .164-.074.164-.164l.21-2.52-.21-2.775c0-.09-.075-.165-.164-.165m.96-.015c-.105 0-.18.09-.18.181l-.18 2.79.18 2.49c0 .09.075.181.18.181s.18-.09.18-.181l.195-2.49-.195-2.79c0-.09-.075-.181-.18-.181m.976-.18c-.12 0-.195.104-.21.194l-.164 2.97.164 2.46c.015.105.09.195.21.195.105 0 .195-.09.195-.195l.18-2.46-.18-2.97c-.015-.09-.09-.193-.195-.193m.976-.105c-.135 0-.21.12-.225.225l-.15 3.06.15 2.43c.015.12.09.225.225.225.12 0 .21-.105.21-.225l.166-2.43-.165-3.06c-.016-.105-.091-.225-.211-.225m1.02-.063c-.149 0-.24.135-.24.255l-.15 3.12.15 2.4c0 .12.091.255.24.255.135 0 .24-.135.24-.255l.15-2.4-.15-3.12c0-.12-.105-.255-.24-.255m.99-.209c-.164 0-.27.149-.27.284l-.12 3.345.12 2.37c0 .136.106.285.27.285.15 0 .271-.149.271-.285l.134-2.37-.134-3.345c0-.135-.106-.284-.271-.284m1.021-.201c-.18 0-.3.165-.3.315l-.12 3.53.12 2.34c0 .149.12.314.3.314.165 0 .3-.165.3-.314l.12-2.34-.12-3.53c0-.15-.135-.315-.3-.315m1.052-.135c-.195 0-.33.181-.33.345l-.105 3.66.105 2.31c0 .165.135.346.33.346.181 0 .33-.181.33-.346l.106-2.31-.106-3.66c0-.164-.149-.345-.33-.345m1.036-.149c-.21 0-.345.195-.345.375l-.106 3.81.106 2.28c0 .18.135.375.345.375.195 0 .345-.195.345-.375l.105-2.28-.105-3.81c0-.18-.15-.375-.345-.375m1.065-.165c-.225 0-.375.209-.375.404l-.09 3.976.09 2.25c0 .194.15.404.375.404.21 0 .375-.21.375-.404l.09-2.25-.09-3.976c0-.195-.165-.404-.375-.404m1.035.21c-.24 0-.405.225-.405.435l-.075 3.75.075 2.22c0 .21.165.434.405.434.225 0 .405-.224.405-.434l.075-2.22-.075-3.75c0-.21-.18-.435-.405-.435m1.065-.09c-.256 0-.42.24-.42.464l-.074 3.84.074 2.19c0 .226.164.465.42.465.24 0 .42-.239.42-.465l.075-2.19-.075-3.84c0-.225-.18-.464-.42-.464m1.095-.09c-.27 0-.45.255-.45.495l-.06 3.93.06 2.16c0 .24.18.495.45.495.255 0 .45-.255.45-.495l.06-2.16-.06-3.93c0-.24-.195-.495-.45-.495m1.05-.075c-.285 0-.465.27-.465.524l-.06 4.005.06 2.145c0 .255.18.525.465.525.27 0 .465-.27.465-.525l.06-2.145-.06-4.005c0-.254-.195-.524-.465-.524m1.095-.06c-.3 0-.495.284-.495.554l-.045 4.065.045 2.115c0 .27.195.555.495.555.285 0 .495-.285.495-.555l.045-2.115-.045-4.065c0-.27-.21-.554-.495-.554m4.935 1.26c-.51 0-1.005.105-1.455.3-.3-3.375-3.09-6.015-6.525-6.015-.855 0-1.68.18-2.43.495-.285.12-.36.24-.36.48v11.85c0 .255.195.465.45.495h10.32c1.845 0 3.345-1.5 3.345-3.345s-1.5-3.345-3.345-3.345" />
                  </svg>
                </a>
              )}
              {socialLinks.twitch && (
                <a href={socialLinks.twitch} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitch</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                  </svg>
                </a>
              )}
              {socialLinks.discord && (
                <a href={socialLinks.discord} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Discord</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
              )}
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} {settings?.siteName || 'My Site'}. {tFooter('allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  )
}
