import { prisma } from '@/lib/prisma'
import { SocialForm } from '@/components/admin/SocialForm'

export default async function SocialPage() {
    const settings = await prisma.siteSettings.findUnique({
        where: { id: 'main' },
    })

    const socialLinks = settings?.socialLinks ? JSON.parse(settings.socialLinks) : {}

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Social Media</h1>
                <p className="text-gray-500 mt-1">Manage your social media presence</p>
            </div>

            <SocialForm socialLinks={socialLinks} />
        </div>
    )
}
