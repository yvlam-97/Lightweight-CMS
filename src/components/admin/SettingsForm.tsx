'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const colorPresets = [
  { name: 'Red', hex: '#dc2626' },
  { name: 'Orange', hex: '#ea580c' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Yellow', hex: '#ca8a04' },
  { name: 'Lime', hex: '#65a30d' },
  { name: 'Green', hex: '#16a34a' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Cyan', hex: '#0891b2' },
  { name: 'Sky', hex: '#0284c7' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Purple', hex: '#9333ea' },
  { name: 'Fuchsia', hex: '#c026d3' },
  { name: 'Pink', hex: '#db2777' },
  { name: 'Rose', hex: '#e11d48' },
]

interface Settings {
  id: string
  siteName: string
  tagline: string
  heroImageUrl: string | null
  aboutText: string | null
  primaryColor?: string | null
  socialLinks: string | null
}

interface Props {
  settings: Settings | null
}

export function SettingsForm({ settings }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const socialLinks = settings?.socialLinks ? JSON.parse(settings.socialLinks) : {}

  const [formData, setFormData] = useState({
    siteName: settings?.siteName || '',
    tagline: settings?.tagline || '',
    heroImageUrl: settings?.heroImageUrl || '',
    aboutText: settings?.aboutText || '',
    primaryColor: settings?.primaryColor || '#dc2626',
    instagram: socialLinks.instagram || '',
    facebook: socialLinks.facebook || '',
    youtube: socialLinks.youtube || '',
    spotify: socialLinks.spotify || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: formData.siteName,
          tagline: formData.tagline,
          heroImageUrl: formData.heroImageUrl || null,
          aboutText: formData.aboutText || null,
          primaryColor: formData.primaryColor,
          socialLinks: JSON.stringify({
            instagram: formData.instagram || null,
            facebook: formData.facebook || null,
            youtube: formData.youtube || null,
            spotify: formData.spotify || null,
          }),
        }),
      })

      if (!res.ok) throw new Error('Failed to save')

      setMessage('Settings saved successfully!')
      router.refresh()
    } catch (err) {
      setMessage('Error saving settings')
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
        <h2 className="text-lg font-semibold text-gray-900">General</h2>

        <div>
          <label htmlFor="siteName" className="label">Site Name</label>
          <input
            id="siteName"
            type="text"
            value={formData.siteName}
            onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
            className="input"
            required
          />
        </div>

        <div>
          <label htmlFor="tagline" className="label">Tagline</label>
          <input
            id="tagline"
            type="text"
            value={formData.tagline}
            onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
            className="input"
            placeholder="Your site's tagline"
          />
        </div>

        <div>
          <label htmlFor="heroImageUrl" className="label">Hero Image URL (optional)</label>
          <input
            id="heroImageUrl"
            type="url"
            value={formData.heroImageUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, heroImageUrl: e.target.value }))}
            className="input"
            placeholder="https://example.com/hero.jpg"
          />
          {formData.heroImageUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <img
                src={formData.heroImageUrl}
                alt="Hero Preview"
                className="max-h-48 rounded-lg border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="aboutText" className="label">Short About Text (optional)</label>
          <textarea
            id="aboutText"
            value={formData.aboutText}
            onChange={(e) => setFormData(prev => ({ ...prev, aboutText: e.target.value }))}
            className="input"
            rows={3}
          />
        </div>
      </div>

      <div className="card p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Brand Color</h2>
        <p className="text-sm text-gray-500">Choose your brand's primary color. This will be used throughout the website.</p>

        <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
          {colorPresets.map((color) => (
            <button
              key={color.hex}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, primaryColor: color.hex }))}
              className={`w-10 h-10 rounded-lg border-2 transition-all ${formData.primaryColor === color.hex
                  ? 'border-gray-900 scale-110 shadow-lg'
                  : 'border-transparent hover:scale-105'
                }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="customColor" className="label">Custom Color</label>
            <div className="flex items-center gap-2">
              <input
                id="customColor"
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-12 h-10 rounded cursor-pointer border border-gray-300"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="input w-32 font-mono"
                placeholder="#dc2626"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>
          <div className="flex-1">
            <p className="label">Preview</p>
            <div className="flex items-center gap-2">
              <span
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Button
              </span>
              <span
                className="font-medium"
                style={{ color: formData.primaryColor }}
              >
                Link Text
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Social Media Links</h2>

        <div>
          <label htmlFor="instagram" className="label">Instagram URL</label>
          <input
            id="instagram"
            type="url"
            value={formData.instagram}
            onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
            className="input"
            placeholder="https://instagram.com/yourband"
          />
        </div>

        <div>
          <label htmlFor="facebook" className="label">Facebook URL</label>
          <input
            id="facebook"
            type="url"
            value={formData.facebook}
            onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
            className="input"
            placeholder="https://facebook.com/yourband"
          />
        </div>

        <div>
          <label htmlFor="youtube" className="label">YouTube URL</label>
          <input
            id="youtube"
            type="url"
            value={formData.youtube}
            onChange={(e) => setFormData(prev => ({ ...prev, youtube: e.target.value }))}
            className="input"
            placeholder="https://youtube.com/@yourband"
          />
        </div>

        <div>
          <label htmlFor="spotify" className="label">Spotify URL</label>
          <input
            id="spotify"
            type="url"
            value={formData.spotify}
            onChange={(e) => setFormData(prev => ({ ...prev, spotify: e.target.value }))}
            className="input"
            placeholder="https://open.spotify.com/artist/..."
          />
        </div>
      </div>

      <div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}
