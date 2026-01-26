import { loadPlugins } from './loader'
import { getEnabledPlugins, getPluginPublicPath, getAllRegisteredPlugins } from './registry'
import { PluginHomepageSection, HomepageSectionProps } from './types'
import { ComponentType } from 'react'

// Use global to persist across hot reloads in development
const globalForPlugins = globalThis as unknown as {
    pluginsLoaded: boolean
    pluginsLoadPromise: Promise<void> | null
}

// Initialize if not set
if (globalForPlugins.pluginsLoaded === undefined) {
    globalForPlugins.pluginsLoaded = false
}
if (globalForPlugins.pluginsLoadPromise === undefined) {
    globalForPlugins.pluginsLoadPromise = null
}

/**
 * Ensure plugins are loaded (call this in server components/API routes)
 * Uses a promise to prevent concurrent loading
 */
export async function ensurePluginsLoaded() {
    // Already loaded
    if (globalForPlugins.pluginsLoaded && getAllRegisteredPlugins().length > 0) {
        return
    }

    // Currently loading - wait for it
    if (globalForPlugins.pluginsLoadPromise) {
        await globalForPlugins.pluginsLoadPromise
        return
    }

    // Start loading
    globalForPlugins.pluginsLoadPromise = (async () => {
        await loadPlugins()
        globalForPlugins.pluginsLoaded = true
    })()

    await globalForPlugins.pluginsLoadPromise
    globalForPlugins.pluginsLoadPromise = null
}

/**
 * Get enabled plugins for server components
 */
export async function getServerEnabledPlugins() {
    await ensurePluginsLoaded()
    return await getEnabledPlugins()
}

/**
 * Check if a plugin is enabled (for server components)
 */
export async function isServerPluginEnabled(pluginId: string): Promise<boolean> {
    const plugins = await getServerEnabledPlugins()
    return plugins.some(p => p.id === pluginId)
}

/**
 * Get the public path for a plugin (for server components)
 */
export async function getServerPluginPublicPath(pluginId: string): Promise<string | null> {
    await ensurePluginsLoaded()
    return await getPluginPublicPath(pluginId)
}

/**
 * Get navigation items for enabled plugins
 * @param locale - Optional locale for translated nav names
 */
export async function getEnabledPluginNavItems(locale?: string): Promise<Array<{ name: string; href: string }>> {
    const plugins = await getServerEnabledPlugins()
    const navItems: Array<{ name: string; href: string }> = []

    for (const plugin of plugins) {
        if (plugin.adminNavigation && plugin.defaultPublicPath) {
            const publicPath = plugin.customPublicPath || plugin.defaultPublicPath

            // Try to get translated name from plugin translations
            let name = plugin.adminNavigation.name
            if (locale && plugin.translations?.[locale]) {
                const pluginTranslations = plugin.translations[locale] as Record<string, Record<string, string>>
                const pluginNamespace = pluginTranslations[plugin.id]
                if (pluginNamespace?.navName) {
                    name = pluginNamespace.navName
                }
            }

            navItems.push({
                name,
                href: publicPath,
            })
        }
    }

    return navItems
}

/**
 * Get homepage sections from enabled plugins, sorted by priority
 */
export async function getEnabledHomepageSections(): Promise<
    Array<{
        pluginId: string
        publicPath: string
        priority: number
        component: ComponentType<HomepageSectionProps>
    }>
> {
    const plugins = await getServerEnabledPlugins()
    const sections: Array<{
        pluginId: string
        publicPath: string
        priority: number
        component: ComponentType<HomepageSectionProps>
    }> = []

    for (const plugin of plugins) {
        if (plugin.homepageSection) {
            const publicPath = plugin.customPublicPath || plugin.defaultPublicPath || `/${plugin.id}`
            sections.push({
                pluginId: plugin.id,
                publicPath,
                priority: plugin.homepageSection.priority ?? 0,
                component: plugin.homepageSection.component,
            })
        }
    }

    // Sort by priority (higher first)
    sections.sort((a, b) => b.priority - a.priority)

    return sections
}

/**
 * Get translations from all enabled plugins for a specific locale
 * Returns an object that can be merged with core translations
 */
export async function getPluginTranslations(locale: string): Promise<Record<string, unknown>> {
    const plugins = await getServerEnabledPlugins()
    const translations: Record<string, unknown> = {}

    for (const plugin of plugins) {
        if (plugin.translations && plugin.translations[locale]) {
            // Merge plugin translations into the main translations object
            Object.assign(translations, plugin.translations[locale])
        }
    }

    return translations
}
