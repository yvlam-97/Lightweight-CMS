import { PluginList } from '@/components/admin/PluginList'
import { getAllPlugins, getAllRegisteredPlugins } from '@/lib/plugins/registry'
import { loadPlugins } from '@/lib/plugins/loader'

// Ensure plugins are loaded on the server
async function getPlugins() {
    // Load plugins from the plugins/ folder
    await loadPlugins()

    // Get all plugins with their state
    return await getAllPlugins()
}

export default async function AdminPluginsPage() {
    const plugins = await getPlugins()

    // Convert to serializable format
    const serializablePlugins = plugins.map(plugin => ({
        id: plugin.id,
        name: plugin.name,
        description: plugin.description,
        version: plugin.version,
        author: plugin.author,
        enabled: plugin.enabled,
        defaultPublicPath: plugin.defaultPublicPath,
        customPublicPath: plugin.customPublicPath,
    }))

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Plugins</h1>
                <p className="text-gray-500 mt-2">
                    Enable or disable plugins to extend your CMS functionality.
                </p>
            </div>

            <PluginList plugins={serializablePlugins} />

            <div className="mt-8 card p-6 bg-blue-50 border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Creating Custom Plugins
                </h3>
                <p className="text-blue-800 text-sm mb-3">
                    To create a custom plugin, add a new folder in the <code className="bg-blue-100 px-1 rounded">plugins/</code> directory
                    with an <code className="bg-blue-100 px-1 rounded">index.ts</code> file that exports a plugin definition.
                </p>
                <pre className="bg-blue-100 p-3 rounded text-xs overflow-x-auto text-blue-900">
                    {`// plugins/my-plugin/index.ts
import { PluginDefinition } from '@/lib/plugins/types'

export const plugin: PluginDefinition = {
  id: 'my-plugin',
  name: 'My Custom Plugin',
  description: 'A description of what this plugin does',
  version: '1.0.0',
  author: 'Your Name',
  defaultPublicPath: '/my-feature',
  
  // Add admin navigation
  adminNavigation: {
    name: 'My Feature',
    href: '/admin/my-feature',
    icon: MyIcon,
  },
}`}
                </pre>
            </div>
        </div>
    )
}
