import { prisma } from '@/lib/prisma'
import { SettingsForm } from '@/components/admin/SettingsForm'

async function getSettings() {
  return await prisma.siteSettings.findUnique({ where: { id: 'main' } })
}

export default async function AdminSettingsPage() {
  const settings = await getSettings()
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Site Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  )
}
