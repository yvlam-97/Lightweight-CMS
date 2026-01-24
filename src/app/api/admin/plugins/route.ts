import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
    getAllPlugins,
    enablePlugin,
    disablePlugin,
    updatePluginPublicPath,
    updatePluginSettings,
} from '@/lib/plugins/registry'
import { ensurePluginsLoaded } from '@/lib/plugins/server'

/**
 * GET /api/admin/plugins
 * Get all registered plugins with their enabled/disabled state
 */
export async function GET(req: NextRequest) {
    try {
        await ensurePluginsLoaded()
        const plugins = await getAllPlugins()
        return NextResponse.json({ plugins })
    } catch (error) {
        console.error('Error fetching plugins:', error)
        return NextResponse.json(
            { error: 'Failed to fetch plugins' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/admin/plugins
 * Enable or disable a plugin, or update its settings
 */
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        await ensurePluginsLoaded()
        const data = await req.json()
        const { action, pluginId, customPublicPath, settings } = data

        if (!pluginId) {
            return NextResponse.json(
                { error: 'Plugin ID is required' },
                { status: 400 }
            )
        }

        let result

        switch (action) {
            case 'enable':
                result = await enablePlugin(pluginId, customPublicPath)
                break

            case 'disable':
                result = await disablePlugin(pluginId)
                break

            case 'updatePath':
                if (!customPublicPath) {
                    return NextResponse.json(
                        { error: 'Custom public path is required' },
                        { status: 400 }
                    )
                }
                result = await updatePluginPublicPath(pluginId, customPublicPath)
                break

            case 'updateSettings':
                if (!settings) {
                    return NextResponse.json(
                        { error: 'Settings are required' },
                        { status: 400 }
                    )
                }
                result = await updatePluginSettings(pluginId, settings)
                break

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        // Fetch updated plugin list
        const plugins = await getAllPlugins()

        return NextResponse.json({
            success: true,
            pluginState: result,
            plugins,
        })
    } catch (error) {
        console.error('Error updating plugin:', error)
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : 'Failed to update plugin',
            },
            { status: 500 }
        )
    }
}
