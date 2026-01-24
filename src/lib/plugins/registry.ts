import { PluginDefinition, PluginInstance, PluginState } from './types'
import { prisma } from '@/lib/prisma'

// In-memory cache of registered plugins
const registeredPlugins: Map<string, PluginDefinition> = new Map()

/**
 * Register a plugin definition.
 * This is called when plugins are loaded from the plugins/ folder.
 */
export function registerPlugin(plugin: PluginDefinition): void {
    if (registeredPlugins.has(plugin.id)) {
        // Already registered, skip silently
        return
    }
    registeredPlugins.set(plugin.id, plugin)
}

/**
 * Unregister a plugin.
 */
export function unregisterPlugin(pluginId: string): void {
    registeredPlugins.delete(pluginId)
}

/**
 * Get a registered plugin definition by ID.
 */
export function getRegisteredPlugin(pluginId: string): PluginDefinition | undefined {
    return registeredPlugins.get(pluginId)
}

/**
 * Get all registered plugin definitions.
 */
export function getAllRegisteredPlugins(): PluginDefinition[] {
    return Array.from(registeredPlugins.values())
}

/**
 * Clear all registered plugins (useful for testing).
 */
export function clearRegistry(): void {
    registeredPlugins.clear()
}

/**
 * Get the plugin state from the database.
 */
export async function getPluginState(pluginId: string): Promise<PluginState | null> {
    try {
        return await prisma.pluginState.findUnique({
            where: { pluginId },
        })
    } catch (error) {
        console.error(`Error getting plugin state for ${pluginId}:`, error)
        return null
    }
}

/**
 * Get all plugin states from the database.
 */
export async function getAllPluginStates(): Promise<PluginState[]> {
    try {
        return await prisma.pluginState.findMany()
    } catch (error) {
        console.error('Error getting all plugin states:', error)
        return []
    }
}

// Alias for convenience
export const getPluginStates = getAllPluginStates

/**
 * Enable a plugin.
 */
export async function enablePlugin(
    pluginId: string,
    customPublicPath?: string
): Promise<PluginState> {
    const plugin = getRegisteredPlugin(pluginId)
    if (!plugin) {
        throw new Error(`Plugin "${pluginId}" is not registered`)
    }

    const state = await prisma.pluginState.upsert({
        where: { pluginId },
        update: {
            enabled: true,
            customPublicPath: customPublicPath || plugin.defaultPublicPath || null,
        },
        create: {
            pluginId,
            enabled: true,
            customPublicPath: customPublicPath || plugin.defaultPublicPath || null,
            settings: null,
        },
    })

    // Call the plugin's onEnable hook if it exists
    if (plugin.onEnable) {
        try {
            await plugin.onEnable()
        } catch (error) {
            console.error(`Error in onEnable hook for plugin ${pluginId}:`, error)
        }
    }

    return state
}

/**
 * Disable a plugin.
 */
export async function disablePlugin(pluginId: string): Promise<PluginState> {
    const plugin = getRegisteredPlugin(pluginId)

    const state = await prisma.pluginState.upsert({
        where: { pluginId },
        update: {
            enabled: false,
        },
        create: {
            pluginId,
            enabled: false,
            settings: null,
        },
    })

    // Call the plugin's onDisable hook if it exists
    if (plugin?.onDisable) {
        try {
            await plugin.onDisable()
        } catch (error) {
            console.error(`Error in onDisable hook for plugin ${pluginId}:`, error)
        }
    }

    return state
}

/**
 * Update plugin settings.
 */
export async function updatePluginSettings(
    pluginId: string,
    settings: Record<string, any>
): Promise<PluginState> {
    return await prisma.pluginState.upsert({
        where: { pluginId },
        update: {
            settings: JSON.stringify(settings),
        },
        create: {
            pluginId,
            enabled: false,
            settings: JSON.stringify(settings),
        },
    })
}

/**
 * Update the custom public path for a plugin.
 */
export async function updatePluginPublicPath(
    pluginId: string,
    customPublicPath: string
): Promise<PluginState> {
    return await prisma.pluginState.update({
        where: { pluginId },
        data: { customPublicPath },
    })
}

/**
 * Get all enabled plugins as PluginInstance objects.
 * Combines the registered plugin definitions with their database state.
 */
export async function getEnabledPlugins(): Promise<PluginInstance[]> {
    const states = await getAllPluginStates()
    const enabledStates = states.filter((s) => s.enabled)

    const plugins: PluginInstance[] = []

    for (const state of enabledStates) {
        const definition = getRegisteredPlugin(state.pluginId)
        if (definition) {
            plugins.push({
                ...definition,
                enabled: true,
                customPublicPath: state.customPublicPath || undefined,
                settings: state.settings ? JSON.parse(state.settings) : undefined,
            })
        }
    }

    return plugins
}

/**
 * Get all plugins (both enabled and disabled) as PluginInstance objects.
 */
export async function getAllPlugins(): Promise<PluginInstance[]> {
    const states = await getAllPluginStates()
    const stateMap = new Map(states.map((s) => [s.pluginId, s]))

    const plugins: PluginInstance[] = []

    for (const definition of getAllRegisteredPlugins()) {
        const state = stateMap.get(definition.id)
        plugins.push({
            ...definition,
            enabled: state?.enabled || false,
            customPublicPath: state?.customPublicPath || undefined,
            settings: state?.settings ? JSON.parse(state.settings) : undefined,
        })
    }

    return plugins
}

/**
 * Check if a plugin is enabled.
 */
export async function isPluginEnabled(pluginId: string): Promise<boolean> {
    const state = await getPluginState(pluginId)
    return state?.enabled || false
}

/**
 * Get the public path for a plugin.
 * Returns the custom path if set, otherwise the default path.
 */
export async function getPluginPublicPath(pluginId: string): Promise<string | null> {
    const state = await getPluginState(pluginId)
    const plugin = getRegisteredPlugin(pluginId)

    if (state?.customPublicPath) {
        return state.customPublicPath
    }

    return plugin?.defaultPublicPath || null
}
