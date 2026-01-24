import { NextRequest, NextResponse } from 'next/server'
import type { PluginDefinition } from '@/lib/plugins/types'
import { getPluginStates } from '@/lib/plugins/registry'
import { pluginModules, loadPluginModule } from '@/lib/plugins/modules'

type RouteContext = {
  params: Promise<{ pluginId: string; path?: string[] }>
}

async function handleRequest(
  request: NextRequest,
  context: RouteContext,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
) {
  const params = await context.params
  const pluginId = params.pluginId
  const pathSegments = params.path || []

  // Check if plugin exists
  if (!(pluginId in pluginModules)) {
    return NextResponse.json({ error: 'Plugin not found' }, { status: 404 })
  }

  // Check if plugin is enabled
  const states = await getPluginStates()
  const pluginState = states.find((s) => s.pluginId === pluginId)
  if (!pluginState?.enabled) {
    return NextResponse.json({ error: 'Plugin not enabled' }, { status: 403 })
  }

  // Load plugin
  const plugin = await loadPluginModule(pluginId)
  if (!plugin) {
    return NextResponse.json({ error: 'Failed to load plugin' }, { status: 500 })
  }

  // Find matching API route
  const apiRoutes = plugin.apiRoutes || []
  let matchedRoute = null
  let matchedParams: Record<string, string> = {}

  for (const route of apiRoutes) {
    const routeSegments = route.path ? route.path.split('/').filter(Boolean) : []

    // Check if segment counts match
    if (routeSegments.length !== pathSegments.length) continue

    let matches = true
    const tempParams: Record<string, string> = {}

    for (let i = 0; i < routeSegments.length; i++) {
      const routeSegment = routeSegments[i]
      const urlSegment = pathSegments[i]

      if (routeSegment.startsWith('[') && routeSegment.endsWith(']')) {
        // Dynamic segment
        const paramName = routeSegment.slice(1, -1)
        tempParams[paramName] = urlSegment
      } else if (routeSegment !== urlSegment) {
        matches = false
        break
      }
    }

    if (matches) {
      matchedRoute = route
      matchedParams = tempParams
      break
    }
  }

  if (!matchedRoute) {
    return NextResponse.json({ error: 'Route not found' }, { status: 404 })
  }

  // Get the handler for this method
  const handler = matchedRoute[method]
  if (!handler) {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  // Call the handler with extracted params
  return handler(request, { params: Promise.resolve(matchedParams) })
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handleRequest(request, context, 'GET')
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handleRequest(request, context, 'POST')
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return handleRequest(request, context, 'PUT')
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return handleRequest(request, context, 'DELETE')
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handleRequest(request, context, 'PATCH')
}
