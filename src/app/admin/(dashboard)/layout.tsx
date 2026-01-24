import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { getEnabledPlugins } from '@/lib/plugins/registry'
import { ensurePluginsLoaded } from '@/lib/plugins/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
  }

  // Load plugins and get enabled ones
  await ensurePluginsLoaded()
  const enabledPlugins = await getEnabledPlugins()

  // Build plugin navigation items (without icon functions - those are handled client-side)
  const pluginNavItems = enabledPlugins
    .filter(plugin => plugin.adminNavigation)
    .map(plugin => ({
      name: plugin.adminNavigation!.name,
      href: plugin.adminNavigation!.href,
      iconName: plugin.id, // Use plugin ID to look up icon on client
    }))

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar user={session.user} pluginNavItems={pluginNavItems} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
