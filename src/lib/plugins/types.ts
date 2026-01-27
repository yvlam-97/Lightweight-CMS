import { ComponentType, ReactNode } from 'react'

/**
 * Plugin System Types
 *
 * This defines the API for creating plugins for the CMS.
 * Plugins can add admin pages, public pages, API routes, and navigation items.
 */

// Icon component type for navigation
export type IconComponent = ComponentType<{ className?: string }>

// Navigation item for admin sidebar
export interface PluginNavItem {
  name: string
  href: string
  icon: IconComponent
}

// Admin page configuration
export interface PluginAdminPage {
  // The path relative to /admin/p/[pluginId]/ (e.g., '', 'new', '[id]')
  path: string
  // The React component to render
  component: ComponentType<{
    params?: Record<string, string>
    pluginId: string
  }>
}

// Public page configuration
export interface PluginPublicPage {
  // The path relative to the plugin's public path (e.g., '', '[slug]')
  path: string
  // The React component to render
  component: ComponentType<{
    params?: Record<string, string>
    pluginId: string
    publicPath: string
  }>
}

// Homepage section component props
export interface HomepageSectionProps {
  pluginId: string
  publicPath: string
}

// Homepage section configuration
export interface PluginHomepageSection {
  // Priority for ordering (higher = appears first, default 0)
  priority?: number
  // The React component to render on the homepage
  component: ComponentType<HomepageSectionProps>
}

// API route handler type - compatible with Next.js route handlers
export type ApiRouteHandler = (
  req: Request,
  context: { params: Promise<Record<string, string>> }
) => Promise<Response>

// API route configuration
export interface PluginApiRoute {
  // The path relative to /api/p/[pluginId]/ (e.g., '', '[id]')
  path: string
  // HTTP method handlers
  GET?: ApiRouteHandler
  POST?: ApiRouteHandler
  PUT?: ApiRouteHandler
  DELETE?: ApiRouteHandler
  PATCH?: ApiRouteHandler
}

// Plugin settings field definition
export interface PluginSettingField {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'url'
  description?: string
  defaultValue?: string | number | boolean | string[]
  options?: { label: string; value: string }[] // For select type
  required?: boolean
}

// Main plugin definition interface
export interface PluginDefinition {
  // Unique identifier for the plugin (e.g., 'concerts', 'gallery')
  id: string

  // Display name shown in admin
  name: string

  // Description of what the plugin does
  description: string

  // Plugin version
  version: string

  // Plugin author
  author?: string

  // Default base URL for public routes (can be customized by user)
  defaultPublicPath?: string

  // Translations for each locale (e.g., { en: { pluginId: { ... } }, nl: { pluginId: { ... } } })
  // These will be merged with the core translations
  translations?: Record<string, Record<string, unknown>>

  // Admin navigation item (href should be /admin/p/[pluginId])
  adminNavigation?: PluginNavItem

  // Admin pages (rendered under /admin/p/[pluginId]/...)
  adminPages?: PluginAdminPage[]

  // Public pages (rendered under the configured public path)
  publicPages?: PluginPublicPage[]

  // API routes (rendered under /api/p/[pluginId]/...)
  apiRoutes?: PluginApiRoute[]

  // Optional homepage section (displayed on the public homepage)
  homepageSection?: PluginHomepageSection

  // Plugin-specific settings fields
  settingsFields?: PluginSettingField[]

  // Lifecycle hooks
  onEnable?: () => Promise<void>
  onDisable?: () => Promise<void>
}

// Plugin instance with runtime state
export interface PluginInstance extends PluginDefinition {
  // Whether the plugin is currently enabled
  enabled: boolean

  // Custom public path (overrides defaultPublicPath)
  customPublicPath?: string

  // Plugin-specific settings values
  settings?: Record<string, string | number | boolean | string[]>
}

// Plugin state stored in database
export interface PluginState {
  id: string
  pluginId: string
  enabled: boolean
  customPublicPath?: string | null
  settings: string | null // JSON string
  createdAt: Date
  updatedAt: Date
}

// Plugin context type for React components
export interface PluginContextType {
  plugins: PluginInstance[]
  enabledPlugins: string[]
  isLoading: boolean
  isPluginEnabled: (pluginId: string) => boolean
  getPlugin: (pluginId: string) => PluginInstance | undefined
  getPluginPublicPath: (pluginId: string) => string | undefined
  refreshPlugins: () => Promise<void>
}

// Plugin registration function type
export type RegisterPlugin = (plugin: PluginDefinition) => void

// Helper type for plugin components to receive common props
export interface PluginComponentProps {
  pluginId: string
  basePath: string
}
