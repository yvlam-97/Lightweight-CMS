'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Plugin {
    id: string
    name: string
    description: string
    version: string
    author?: string
    enabled: boolean
    defaultPublicPath?: string
    customPublicPath?: string
}

interface Props {
    plugins: Plugin[]
}

export function PluginList({ plugins: initialPlugins }: Props) {
    const router = useRouter()
    const [plugins, setPlugins] = useState<Plugin[]>(initialPlugins)
    const [loading, setLoading] = useState<string | null>(null)
    const [editingPath, setEditingPath] = useState<string | null>(null)
    const [pathValue, setPathValue] = useState('')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleToggle = async (pluginId: string, currentlyEnabled: boolean) => {
        setLoading(pluginId)
        setMessage(null)

        try {
            const res = await fetch('/api/admin/plugins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: currentlyEnabled ? 'disable' : 'enable',
                    pluginId,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to update plugin')
            }

            const data = await res.json()
            setPlugins(data.plugins)
            setMessage({
                type: 'success',
                text: `Plugin "${pluginId}" ${currentlyEnabled ? 'disabled' : 'enabled'} successfully`
            })
            router.refresh()
        } catch (err) {
            setMessage({
                type: 'error',
                text: err instanceof Error ? err.message : 'Failed to update plugin'
            })
        } finally {
            setLoading(null)
        }
    }

    const handleEditPath = (plugin: Plugin) => {
        setEditingPath(plugin.id)
        setPathValue(plugin.customPublicPath || plugin.defaultPublicPath || '')
    }

    const handleSavePath = async (pluginId: string) => {
        setLoading(pluginId)
        setMessage(null)

        try {
            // Ensure path starts with /
            let cleanPath = pathValue.trim()
            if (!cleanPath.startsWith('/')) {
                cleanPath = '/' + cleanPath
            }
            // Remove trailing slash
            if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
                cleanPath = cleanPath.slice(0, -1)
            }

            const res = await fetch('/api/admin/plugins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'updatePath',
                    pluginId,
                    customPublicPath: cleanPath,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to update path')
            }

            const data = await res.json()
            setPlugins(data.plugins)
            setEditingPath(null)
            setMessage({ type: 'success', text: 'Public path updated successfully' })
            router.refresh()
        } catch (err) {
            setMessage({
                type: 'error',
                text: err instanceof Error ? err.message : 'Failed to update path'
            })
        } finally {
            setLoading(null)
        }
    }

    if (plugins.length === 0) {
        return (
            <div className="card p-8 text-center">
                <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Plugins Found</h3>
                <p className="text-gray-500 mb-4">
                    Plugins should be placed in the <code className="bg-gray-100 px-2 py-1 rounded">plugins/</code> folder
                    at the root of your project.
                </p>
                <p className="text-sm text-gray-400">
                    Each plugin needs an <code className="bg-gray-100 px-1 rounded">index.ts</code> file that exports
                    a <code className="bg-gray-100 px-1 rounded">plugin</code> object.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'error'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-green-50 text-green-700'
                    }`}>
                    {message.text}
                </div>
            )}

            {plugins.map((plugin) => (
                <div key={plugin.id} className="card p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-900">{plugin.name}</h3>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                    v{plugin.version}
                                </span>
                                {plugin.enabled && (
                                    <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                                        Enabled
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 mt-1">{plugin.description}</p>
                            {plugin.author && (
                                <p className="text-sm text-gray-400 mt-1">By {plugin.author}</p>
                            )}

                            {/* Public Path Configuration */}
                            {plugin.enabled && (plugin.defaultPublicPath || plugin.customPublicPath) && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Public URL Path</p>
                                    {editingPath === plugin.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={pathValue}
                                                onChange={(e) => setPathValue(e.target.value)}
                                                className="input flex-1"
                                                placeholder="/custom-path"
                                            />
                                            <button
                                                onClick={() => handleSavePath(plugin.id)}
                                                disabled={loading === plugin.id}
                                                className="btn-primary text-sm"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingPath(null)}
                                                className="text-gray-500 hover:text-gray-700 text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm bg-gray-200 px-2 py-1 rounded">
                                                {plugin.customPublicPath || plugin.defaultPublicPath}
                                            </code>
                                            <button
                                                onClick={() => handleEditPath(plugin)}
                                                className="text-primary-600 hover:text-primary-700 text-sm"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Toggle Switch */}
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => handleToggle(plugin.id, plugin.enabled)}
                                disabled={loading === plugin.id}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${plugin.enabled ? 'bg-primary-600' : 'bg-gray-300'
                                    } ${loading === plugin.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${plugin.enabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
