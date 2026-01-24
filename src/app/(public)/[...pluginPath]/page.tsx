'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { usePlugins } from '@/lib/plugins/context'
import type { PluginDefinition } from '@/lib/plugins/types'
import { pluginModules } from '@/lib/plugins/modules'

export default function PluginPublicPage() {
  const params = useParams()
  const {
    enabledPlugins,
    getPluginPublicPath,
    isLoading: pluginsLoading,
  } = usePlugins()
  const [plugin, setPlugin] = useState<PluginDefinition | null>(null)
  const [pluginId, setPluginId] = useState<string | null>(null)
  const [matchedParams, setMatchedParams] = useState<Record<string, string>>({})
  const [pageLoading, setPageLoading] = useState(true)
  const [notFoundError, setNotFoundError] = useState(false)

  const pathSegments = (params.pluginPath as string[] | undefined) || []
  const requestPath = '/' + pathSegments.join('/')

  useEffect(() => {
    async function loadPluginForPath() {
      if (pluginsLoading) return

      // Find which plugin matches this path
      let foundPluginId: string | null = null
      let matchingPathSegments: string[] = []

      for (const pId of enabledPlugins) {
        const publicPath = getPluginPublicPath(pId)
        if (!publicPath) continue

        // Check if the request path starts with this plugin's public path
        const normalizedPublicPath = publicPath.startsWith('/')
          ? publicPath
          : '/' + publicPath

        if (
          requestPath === normalizedPublicPath ||
          requestPath.startsWith(normalizedPublicPath + '/')
        ) {
          foundPluginId = pId
          // Get the remaining path after the plugin's base path
          const remaining = requestPath.slice(normalizedPublicPath.length)
          matchingPathSegments = remaining
            ? remaining.split('/').filter(Boolean)
            : []
          break
        }
      }

      if (!foundPluginId) {
        setNotFoundError(true)
        setPageLoading(false)
        return
      }

      setPluginId(foundPluginId)

      // Load the plugin module
      const loader = pluginModules[foundPluginId]
      if (!loader) {
        setNotFoundError(true)
        setPageLoading(false)
        return
      }

      try {
        const module = await loader()
        const loadedPlugin = module.default

        // Find matching public page
        const publicPages = loadedPlugin.publicPages || []
        let matchedPage = null
        let tempParams: Record<string, string> = {}

        for (const page of publicPages) {
          const pageSegments = page.path ? page.path.split('/').filter(Boolean) : []

          if (pageSegments.length !== matchingPathSegments.length) continue

          let matches = true
          const extractedParams: Record<string, string> = {}

          for (let i = 0; i < pageSegments.length; i++) {
            const pageSegment = pageSegments[i]
            const urlSegment = matchingPathSegments[i]

            if (pageSegment.startsWith('[') && pageSegment.endsWith(']')) {
              const paramName = pageSegment.slice(1, -1)
              extractedParams[paramName] = urlSegment
            } else if (pageSegment !== urlSegment) {
              matches = false
              break
            }
          }

          if (matches) {
            matchedPage = page
            tempParams = extractedParams
            break
          }
        }

        if (!matchedPage) {
          setNotFoundError(true)
          setPageLoading(false)
          return
        }

        setPlugin(loadedPlugin)
        setMatchedParams(tempParams)
        setPageLoading(false)
      } catch (error) {
        console.error(`Failed to load plugin ${foundPluginId}:`, error)
        setNotFoundError(true)
        setPageLoading(false)
      }
    }

    loadPluginForPath()
  }, [pluginsLoading, enabledPlugins, requestPath, getPluginPublicPath])

  if (pluginsLoading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (notFoundError) {
    notFound()
  }

  if (!plugin || !pluginId) {
    notFound()
  }

  // Find the matched page component
  const publicPages = plugin.publicPages || []
  const pathAfterPluginBase = requestPath.slice(
    (getPluginPublicPath(pluginId) || '').length
  )
  const matchingPathSegments = pathAfterPluginBase
    ? pathAfterPluginBase.split('/').filter(Boolean)
    : []

  let PageComponent = null
  for (const page of publicPages) {
    const pageSegments = page.path ? page.path.split('/').filter(Boolean) : []
    if (pageSegments.length === matchingPathSegments.length) {
      PageComponent = page.component
      break
    }
  }

  if (!PageComponent) {
    notFound()
  }

  return (
    <PageComponent
      params={matchedParams}
      pluginId={pluginId}
      publicPath={getPluginPublicPath(pluginId) || ''}
    />
  )
}
