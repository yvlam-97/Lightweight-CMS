'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const socialPlatforms = [
    { id: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/yourname' },
    { id: 'facebook', name: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
    { id: 'twitter', name: 'X (Twitter)', placeholder: 'https://x.com/yourhandle' },
    { id: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
    { id: 'spotify', name: 'Spotify', placeholder: 'https://open.spotify.com/artist/...' },
    { id: 'tiktok', name: 'TikTok', placeholder: 'https://tiktok.com/@yourname' },
    { id: 'linkedin', name: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourname' },
    { id: 'bandcamp', name: 'Bandcamp', placeholder: 'https://yourname.bandcamp.com' },
    { id: 'soundcloud', name: 'SoundCloud', placeholder: 'https://soundcloud.com/yourname' },
    { id: 'twitch', name: 'Twitch', placeholder: 'https://twitch.tv/yourname' },
    { id: 'discord', name: 'Discord', placeholder: 'https://discord.gg/invite-code' },
    { id: 'github', name: 'GitHub', placeholder: 'https://github.com/yourname' },
]

interface Props {
    socialLinks: Record<string, string>
}

export function SocialForm({ socialLinks: existingSocialLinks }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    // Initialize social links state from existing data
    const [socialLinks, setSocialLinks] = useState<Record<string, string>>(() => {
        const links: Record<string, string> = {}
        for (const platform of socialPlatforms) {
            if (existingSocialLinks[platform.id]) {
                links[platform.id] = existingSocialLinks[platform.id]
            }
        }
        return links
    })

    // Platforms that are currently added (have a value or are being edited)
    const [activePlatforms, setActivePlatforms] = useState<string[]>(() => {
        return Object.keys(socialLinks).filter(id => socialLinks[id])
    })

    const addPlatform = (platformId: string) => {
        if (!activePlatforms.includes(platformId)) {
            setActivePlatforms([...activePlatforms, platformId])
            setSocialLinks({ ...socialLinks, [platformId]: '' })
        }
    }

    const removePlatform = (platformId: string) => {
        setActivePlatforms(activePlatforms.filter(id => id !== platformId))
        const newLinks = { ...socialLinks }
        delete newLinks[platformId]
        setSocialLinks(newLinks)
    }

    const updateSocialLink = (platformId: string, value: string) => {
        setSocialLinks({ ...socialLinks, [platformId]: value })
    }

    const availablePlatforms = socialPlatforms.filter(p => !activePlatforms.includes(p.id))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            // Build social links object, only including non-empty values
            const socialLinksData: Record<string, string | null> = {}
            for (const [key, value] of Object.entries(socialLinks)) {
                socialLinksData[key] = value || null
            }

            const res = await fetch('/api/admin/social', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    socialLinks: JSON.stringify(socialLinksData),
                }),
            })

            if (!res.ok) throw new Error('Failed to save')

            setMessage('Social media links saved successfully!')
            router.refresh()
        } catch (err) {
            setMessage('Error saving social media links')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {message && (
                <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message}
                </div>
            )}

            <div className="card p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Social Media Links</h2>
                    <p className="text-sm text-gray-500 mt-1">Add the social media platforms you use. Only added platforms will be displayed on your site.</p>
                </div>

                {/* Active platforms */}
                {activePlatforms.length > 0 && (
                    <div className="space-y-4">
                        {activePlatforms.map((platformId) => {
                            const platform = socialPlatforms.find(p => p.id === platformId)
                            if (!platform) return null
                            return (
                                <div key={platformId} className="flex gap-2">
                                    <div className="flex-1">
                                        <label htmlFor={platformId} className="label">{platform.name}</label>
                                        <input
                                            id={platformId}
                                            type="url"
                                            value={socialLinks[platformId] || ''}
                                            onChange={(e) => updateSocialLink(platformId, e.target.value)}
                                            className="input"
                                            placeholder={platform.placeholder}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={() => removePlatform(platformId)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Add platform buttons */}
                {availablePlatforms.length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                        <label className="label">Add Social Platform</label>
                        <div className="flex gap-2 flex-wrap">
                            {availablePlatforms.map((platform) => (
                                <button
                                    key={platform.id}
                                    type="button"
                                    onClick={() => addPlatform(platform.id)}
                                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                >
                                    + {platform.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activePlatforms.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                        <p>No social media platforms added yet.</p>
                        <p className="text-sm">Click on a platform above to add it.</p>
                    </div>
                )}
            </div>

            <div>
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Saving...' : 'Save Social Links'}
                </button>
            </div>
        </form>
    )
}
