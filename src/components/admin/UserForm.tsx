'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  password: string | null
  accounts: { provider: string }[]
}

interface Props {
  user?: User
}

export function UserForm({ user }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Detect if user is OAuth user
  const isOAuthUser = user && user.accounts.length > 0 && !user.password
  const oauthProvider = isOAuthUser
    ? user.accounts[0].provider.charAt(0).toUpperCase() + user.accounts[0].provider.slice(1)
    : null

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '', // Always empty initially for security
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // For create mode, password is required
      if (!user && !formData.password.trim()) {
        throw new Error('Password is required')
      }

      const url = user ? `/api/admin/users/${user.id}` : '/api/admin/users'
      const method = user ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to communicate with server' }))
        throw new Error(data.error || 'Something went wrong')
      }

      router.push('/admin/users')
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
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {isOAuthUser && (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg">
          This user authenticates via {oauthProvider}. Password management is not available for OAuth users.
        </div>
      )}

      <div className="card p-6 space-y-6">
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="input"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="input"
            required
          />
        </div>

        {!isOAuthUser && (
          <div>
            <label htmlFor="password" className="label">
              {user ? 'New Password (leave blank to keep current)' : 'Password'}
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="input"
              required={!user}
              minLength={8}
            />
            {!user && (
              <p className="text-sm text-gray-500 mt-1">Minimum 8 characters</p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
        </button>
        <Link href="/admin/users" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  )
}
