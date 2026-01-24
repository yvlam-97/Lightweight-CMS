import type { PluginDefinition } from './types'

/**
 * Registry of plugin module loaders.
 * Add new plugins here to make them available in the system.
 *
 * Each entry maps a plugin ID to a dynamic import function.
 */
export const pluginModules: Record<
    string,
    () => Promise<{ default: PluginDefinition }>
> = {
    concerts: () => import('@plugins/concerts'),
}

/**
 * Load a plugin module by ID.
 */
export async function loadPluginModule(
    pluginId: string
): Promise<PluginDefinition | null> {
    const loader = pluginModules[pluginId]
    if (!loader) return null

    try {
        const module = await loader()
        return module.default
    } catch (error) {
        console.error(`Failed to load plugin module ${pluginId}:`, error)
        return null
    }
}

/**
 * Check if a plugin module exists.
 */
export function hasPluginModule(pluginId: string): boolean {
    return pluginId in pluginModules
}
