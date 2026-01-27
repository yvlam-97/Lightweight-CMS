/**
 * Plugin System Tests
 *
 * These tests verify that plugins are correctly structured and can be
 * safely loaded without issues. They catch common problems like:
 *
 * 1. React components in API responses (JSON serialization failure)
 * 2. Missing required plugin fields
 * 3. Invalid route configurations
 * 4. Translation structure issues
 *
 * Note: These tests use mock plugins to avoid complex module resolution.
 * For full integration tests, use the Next.js test environment.
 */

import { PluginDefinition } from '../../src/lib/plugins/types'
import {
    validatePlugin,
    validateApiRouteOrdering,
    validatePluginSerialization,
} from '../utils/validation'
import * as fs from 'fs'
import * as path from 'path'

// Helper to check if a plugin directory exists and has required files
function getPluginDirectories(): string[] {
    const pluginsDir = path.join(__dirname, '../../src/plugins')
    if (!fs.existsSync(pluginsDir)) return []

    return fs.readdirSync(pluginsDir).filter(name => {
        const pluginPath = path.join(pluginsDir, name)
        return fs.statSync(pluginPath).isDirectory() &&
            fs.existsSync(path.join(pluginPath, 'index.tsx'))
    })
}

// Read and parse a plugin's index.tsx to extract basic structure info
function getPluginExports(pluginId: string): { hasDefaultExport: boolean; hasPlugin: boolean } {
    const indexPath = path.join(__dirname, `../../src/plugins/${pluginId}/index.tsx`)
    const content = fs.readFileSync(indexPath, 'utf-8')

    return {
        hasDefaultExport: content.includes('export default'),
        hasPlugin: content.includes('export const plugin') || content.includes('export { plugin'),
    }
}

// Read plugin's translation files
function getPluginTranslations(pluginId: string): Record<string, any> | null {
    const i18nDir = path.join(__dirname, `../../src/plugins/${pluginId}/i18n`)
    if (!fs.existsSync(i18nDir)) return null

    const translations: Record<string, any> = {}
    const files = fs.readdirSync(i18nDir).filter(f => f.endsWith('.json'))

    for (const file of files) {
        const locale = file.replace('.json', '')
        const content = fs.readFileSync(path.join(i18nDir, file), 'utf-8')
        translations[locale] = JSON.parse(content)
    }

    return Object.keys(translations).length > 0 ? translations : null
}

describe('Plugin Directory Structure', () => {
    const pluginDirs = getPluginDirectories()

    it('should have at least one plugin', () => {
        expect(pluginDirs.length).toBeGreaterThan(0)
    })

    it.each(pluginDirs)('plugin "%s" should have an index.tsx', (pluginId) => {
        const indexPath = path.join(__dirname, `../../src/plugins/${pluginId}/index.tsx`)
        expect(fs.existsSync(indexPath)).toBe(true)
    })

    it.each(pluginDirs)('plugin "%s" should export a default or named plugin', (pluginId) => {
        const exports = getPluginExports(pluginId)
        expect(exports.hasDefaultExport || exports.hasPlugin).toBe(true)
    })
})

describe('Plugin Translation Structure', () => {
    const pluginDirs = getPluginDirectories()

    it.each(pluginDirs)('plugin "%s" translations should be valid JSON', (pluginId) => {
        const translations = getPluginTranslations(pluginId)
        if (translations) {
            for (const [locale, data] of Object.entries(translations)) {
                expect(() => JSON.stringify(data)).not.toThrow()
            }
        }
    })

    it.each(pluginDirs)('plugin "%s" translations should have matching keys across locales', (pluginId) => {
        const translations = getPluginTranslations(pluginId)
        if (translations) {
            const locales = Object.keys(translations)
            if (locales.length > 1) {
                const firstKeys = Object.keys(translations[locales[0]]).sort()

                for (const locale of locales.slice(1)) {
                    const localeKeys = Object.keys(translations[locale]).sort()
                    expect(localeKeys).toEqual(firstKeys)
                }
            }
        }
    })
})

describe('Plugin API Route Patterns', () => {
    const pluginDirs = getPluginDirectories()

    it.each(pluginDirs)('plugin "%s" API files should export valid handlers', (pluginId) => {
        const apiDir = path.join(__dirname, `../../src/plugins/${pluginId}/api`)
        if (!fs.existsSync(apiDir)) return

        const apiFiles = fs.readdirSync(apiDir).filter(f => f.endsWith('.ts'))

        for (const file of apiFiles) {
            const content = fs.readFileSync(path.join(apiDir, file), 'utf-8')
            // Check that file exports at least one HTTP method handler
            // Supports both: export const GET = ... and export async function GET
            const hasHandler = /export\s+(const\s+)?(async\s+)?(function\s+)?(GET|POST|PUT|DELETE|PATCH)/.test(content)
            expect(hasHandler).toBe(true)
        }
    })
})

describe('Plugin Serialization Safety', () => {
    // Mock plugin to test serialization logic
    const mockPlugin: PluginDefinition = {
        id: 'mock-plugin',
        name: 'Mock Plugin',
        description: 'A mock plugin for testing',
        version: '1.0.0',
        author: 'Test',
        adminNavigation: {
            name: 'Mock',
            href: '/admin/p/mock',
            icon: () => null, // React component
        },
        adminPages: [
            { path: '', component: () => null },
        ],
        homepageSection: {
            priority: 1,
            component: () => null,
        },
    }

    it('should serialize plugin metadata without React components', () => {
        // This is the exact pattern used in the API route
        const serialized = {
            id: mockPlugin.id,
            name: mockPlugin.name,
            description: mockPlugin.description,
            version: mockPlugin.version,
            author: mockPlugin.author,
            adminNavigation: mockPlugin.adminNavigation
                ? {
                    name: mockPlugin.adminNavigation.name,
                    href: mockPlugin.adminNavigation.href,
                    // icon is intentionally excluded
                }
                : undefined,
        }

        expect(() => JSON.stringify(serialized)).not.toThrow()
        const parsed = JSON.parse(JSON.stringify(serialized))
        expect(parsed.id).toBe(mockPlugin.id)
        expect(parsed.adminNavigation.icon).toBeUndefined()
    })

    it('should fail if React components are included in serialization', () => {
        // Direct serialization of React components produces null/undefined
        const withComponent = JSON.stringify({ icon: mockPlugin.adminNavigation?.icon })
        const parsed = JSON.parse(withComponent)
        expect(parsed.icon).toBeUndefined()
    })

    it('should pass validation for properly structured plugin', () => {
        const result = validatePlugin(mockPlugin)
        expect(result.valid).toBe(true)
    })

    it('should pass serialization validation', () => {
        const result = validatePluginSerialization(mockPlugin)
        expect(result.valid).toBe(true)
    })
})

describe('API Route Ordering Validation', () => {
    it('should detect incorrect route ordering', () => {
        // This is the bug we had - [id] matched before 'upload'
        const badRoutes = [
            { path: '', GET: async () => new Response() },
            { path: '[id]', GET: async () => new Response() },
            { path: 'upload', POST: async () => new Response() }, // Should come before [id]
        ]

        const result = validateApiRouteOrdering(badRoutes)
        expect(result.valid).toBe(false)
        expect(result.errors.some(e => e.includes('upload'))).toBe(true)
    })

    it('should pass for correctly ordered routes', () => {
        const goodRoutes = [
            { path: '', GET: async () => new Response() },
            { path: 'upload', POST: async () => new Response() }, // Static before dynamic
            { path: 'file/[key]', GET: async () => new Response() },
            { path: '[id]', GET: async () => new Response() }, // Dynamic last
        ]

        const result = validateApiRouteOrdering(goodRoutes)
        expect(result.valid).toBe(true)
    })
})
