import { PluginDefinition } from './types'
import { registerPlugin, clearRegistry } from './registry'
import { pluginModules, loadPluginModule } from './modules'

/**
 * Load all plugins from the centralized plugin modules registry.
 *
 * Plugins are registered in src/lib/plugins/modules.ts with static imports
 * to avoid webpack "Critical dependency" warnings.
 */
export async function loadPlugins(): Promise<PluginDefinition[]> {
    const loadedPlugins: PluginDefinition[] = []

    for (const pluginId of Object.keys(pluginModules)) {
        try {
            const plugin = await loadPluginModule(pluginId)
            if (plugin) {
                registerPlugin(plugin)
                loadedPlugins.push(plugin)
            }
        } catch (error) {
            console.error(`Failed to load plugin ${pluginId}:`, error)
        }
    }

    if (loadedPlugins.length > 0) {
        console.log(`Loaded ${loadedPlugins.length} plugin(s): ${loadedPlugins.map(p => p.id).join(', ')}`)
    }

    return loadedPlugins
}

/**
 * Reload all plugins.
 * This clears the registry and reloads from disk.
 */
export async function reloadPlugins(): Promise<PluginDefinition[]> {
    clearRegistry()
    return loadPlugins()
}

/**
 * Get list of available plugin IDs.
 */
export function getAvailablePluginIds(): string[] {
    return Object.keys(pluginModules)
}
