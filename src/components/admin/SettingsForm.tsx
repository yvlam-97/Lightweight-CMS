'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { colorPresets } from '@/lib/colors'
import { locales, localeNames, type Locale } from '@/i18n/config'

interface Settings {
  id: string
  siteName: string
  tagline: string
  heroImageUrl: string | null
  aboutText: string | null
  primaryColor?: string | null
  defaultLocale?: string | null
}

interface Props {
  settings: Settings | null
}

export function SettingsForm({ settings }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    siteName: settings?.siteName || '',
    tagline: settings?.tagline || '',
    heroImageUrl: settings?.heroImageUrl || '',
    aboutText: settings?.aboutText || '',
    primaryColor: settings?.primaryColor || '#dc2626',
    defaultLocale: (settings?.defaultLocale as Locale) || 'en',
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
          defaultLocale: formData.defaultLocale,
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

        <div>
          <label htmlFor="defaultLocale" className="label">Default Language</label>
          <p className="text-sm text-gray-500 mb-2">The language shown to visitors who haven't selected a preference.</p>
          <select
            id="defaultLocale"
            value={formData.defaultLocale}
            onChange={(e) => setFormData(prev => ({ ...prev, defaultLocale: e.target.value as Locale }))}
            className="input"
          >
            {locales.map((locale) => (
              <option key={locale} value={locale}>
                {localeNames[locale]}
              </option>
            ))}
          </select>
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

      <div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}
