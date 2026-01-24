'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

interface Concert {
    id: string
    title: string
    venue: string
    city: string
    date: Date
    time: string
    description: string | null
    ticketUrl: string | null
    imageUrl: string | null
    published: boolean
}

interface Props {
    concert?: Concert
}

export function ConcertForm({ concert }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        title: concert?.title || '',
        venue: concert?.venue || '',
        city: concert?.city || '',
        date: concert?.date ? format(new Date(concert.date), 'yyyy-MM-dd') : '',
        time: concert?.time || '8:00 PM',
        description: concert?.description || '',
        ticketUrl: concert?.ticketUrl || '',
        imageUrl: concert?.imageUrl || '',
        published: concert?.published || false,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const url = concert
                ? `/api/p/concerts/${concert.id}`
                : '/api/p/concerts'
            const method = concert ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    date: new Date(formData.date).toISOString(),
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Something went wrong')
            }

            router.push('/admin/p/concerts')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
            )}

            <div className="card p-6 space-y-6">
                <div>
                    <label htmlFor="title" className="label">
                        Event Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, title: e.target.value }))
                        }
                        className="input"
                        placeholder="Summer Kick-off Show"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="venue" className="label">
                            Venue
                        </label>
                        <input
                            id="venue"
                            type="text"
                            value={formData.venue}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, venue: e.target.value }))
                            }
                            className="input"
                            placeholder="The Grand Arena"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="city" className="label">
                            City
                        </label>
                        <input
                            id="city"
                            type="text"
                            value={formData.city}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, city: e.target.value }))
                            }
                            className="input"
                            placeholder="New York, NY"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="date" className="label">
                            Date
                        </label>
                        <input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, date: e.target.value }))
                            }
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="time" className="label">
                            Time
                        </label>
                        <input
                            id="time"
                            type="text"
                            value={formData.time}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, time: e.target.value }))
                            }
                            className="input"
                            placeholder="8:00 PM"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="label">
                        Description (optional)
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        className="input"
                        rows={3}
                        placeholder="Additional details about the show..."
                    />
                </div>

                <div>
                    <label htmlFor="ticketUrl" className="label">
                        Ticket URL (optional)
                    </label>
                    <input
                        id="ticketUrl"
                        type="url"
                        value={formData.ticketUrl}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, ticketUrl: e.target.value }))
                        }
                        className="input"
                        placeholder="https://tickets.example.com"
                    />
                </div>

                <div>
                    <label htmlFor="imageUrl" className="label">
                        Image URL (optional)
                    </label>
                    <input
                        id="imageUrl"
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                        }
                        className="input"
                        placeholder="https://example.com/image.jpg"
                    />
                    {formData.imageUrl && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 mb-2">Preview:</p>
                            <img
                                src={formData.imageUrl}
                                alt="Preview"
                                className="max-h-48 rounded-lg border border-gray-200"
                                onError={(e) => {
                                    ; (e.target as HTMLImageElement).style.display = 'none'
                                }}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.published}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, published: e.target.checked }))
                            }
                            className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                        />
                        <span>Published</span>
                    </label>
                </div>
            </div>

            <div className="flex gap-4">
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Saving...' : concert ? 'Update Concert' : 'Add Concert'}
                </button>
                <Link href="/admin/p/concerts" className="btn-secondary">
                    Cancel
                </Link>
            </div>
        </form>
    )
}
