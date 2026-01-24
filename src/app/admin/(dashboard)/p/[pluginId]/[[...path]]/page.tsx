'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { usePlugins } from '@/lib/plugins/context'
import type { PluginDefinition } from '@/lib/plugins/types'
import { pluginModules } from '@/lib/plugins/modules'

export default function PluginAdminPage() {
  const params = useParams()
  const { enabledPlugins, isLoading } = usePlugins()
  const [plugin, setPlugin] = useState<PluginDefinition | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  const pluginId = params.pluginId as string
  const pathSegments = (params.path as string[] | undefined) || []

  useEffect(() => {
    async function loadPlugin() {
      const loader = pluginModules[pluginId]
      if (!loader) {
        setPageLoading(false)
        return
      }

      try {
        const module = await loader()
        setPlugin(module.default)
      } catch (error) {
        console.error(`Failed to load plugin ${pluginId}:`, error)
      }
      setPageLoading(false)
    }

    loadPlugin()
  }, [pluginId])

  if (isLoading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Check if plugin is enabled
  if (!enabledPlugins.includes(pluginId)) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Plugin Not Enabled
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          The "{pluginId}" plugin is not currently enabled.
          Enable it in the Plugins settings to access this page.
        </p>
      </div>
    )
  }

  if (!plugin) {
    notFound()
  }

  // Find matching admin page
  const adminPages = plugin.adminPages || []
  let matchedPage = null
  let matchedParams: Record<string, string> = {}

  for (const page of adminPages) {
    const pageSegments = page.path ? page.path.split('/').filter(Boolean) : []

    // Check if segment counts match (considering dynamic segments)
    if (pageSegments.length !== pathSegments.length) continue

    let matches = true
    const tempParams: Record<string, string> = {}

    for (let i = 0; i < pageSegments.length; i++) {
      const pageSegment = pageSegments[i]
      const urlSegment = pathSegments[i]

      if (pageSegment.startsWith('[') && pageSegment.endsWith(']')) {
        // Dynamic segment - extract param name
        const paramName = pageSegment.slice(1, -1)
        tempParams[paramName] = urlSegment
      } else if (pageSegment !== urlSegment) {
        matches = false
        break
      }
    }

    if (matches) {
      matchedPage = page
      matchedParams = tempParams
      break
    }
  }

  if (!matchedPage) {
    notFound()
  }

  const PageComponent = matchedPage.component
  return <PageComponent params={matchedParams} pluginId={pluginId} />
}
