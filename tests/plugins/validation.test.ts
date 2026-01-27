/**
 * Plugin Validation Tests
 *
 * Tests for the plugin validation utilities.
 * These ensure the validators catch real issues.
 */

import {
    validatePlugin,
    validateApiRouteOrdering,
    validatePluginSerialization,
    validatePluginFully,
} from '../utils/validation'
import { PluginDefinition } from '../../src/lib/plugins/types'

// Minimal valid plugin for testing
const createValidPlugin = (): PluginDefinition => ({
    id: 'test-plugin',
    name: 'Test Plugin',
    description: 'A test plugin',
    version: '1.0.0',
    author: 'Test Author',
})

describe('validatePlugin', () => {
    it('should pass for a valid minimal plugin', () => {
        const result = validatePlugin(createValidPlugin())
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
    })

    it('should fail for missing required fields', () => {
        const plugin = {} as PluginDefinition
        const result = validatePlugin(plugin)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Plugin must have an id')
        expect(result.errors).toContain('Plugin must have a name')
        expect(result.errors).toContain('Plugin must have a description')
        expect(result.errors).toContain('Plugin must have a version')
    })

    it('should fail for invalid plugin id format', () => {
        const plugin = {
            ...createValidPlugin(),
            id: 'InvalidId', // Should be lowercase
        }
        const result = validatePlugin(plugin)
        expect(result.valid).toBe(false)
        expect(result.errors.some((e) => e.includes('lowercase'))).toBe(true)
    })

    it('should fail for invalid id starting with number', () => {
        const plugin = {
            ...createValidPlugin(),
            id: '123plugin',
        }
        const result = validatePlugin(plugin)
        expect(result.valid).toBe(false)
    })

    it('should pass for valid kebab-case id', () => {
        const plugin = {
            ...createValidPlugin(),
            id: 'my-plugin-123',
        }
        const result = validatePlugin(plugin)
        expect(result.valid).toBe(true)
    })
})

describe('validateApiRouteOrdering', () => {
    it('should pass for correctly ordered routes', () => {
        const routes = [
            { path: '', GET: async () => new Response() },
            { path: 'upload', POST: async () => new Response() },
            { path: 'file/[key]', GET: async () => new Response() },
            { path: '[id]', GET: async () => new Response() },
        ]
        const result = validateApiRouteOrdering(routes)
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
    })

    it('should fail when static route comes after dynamic route', () => {
        // This is the exact bug we had - 'upload' was matched by '[id]'
        const routes = [
            { path: '', GET: async () => new Response() },
            { path: '[id]', GET: async () => new Response() }, // Dynamic first - BAD!
            { path: 'upload', POST: async () => new Response() }, // Static after - will never match!
        ]
        const result = validateApiRouteOrdering(routes)
        expect(result.valid).toBe(false)
        expect(result.errors.some((e) => e.includes('upload'))).toBe(true)
        expect(result.errors.some((e) => e.includes('[id]'))).toBe(true)
    })

    it('should pass when dynamic routes have different segment counts', () => {
        // '[id]/photos' won't conflict with 'upload' since they have different segment counts
        const routes = [
            { path: '', GET: async () => new Response() },
            { path: '[id]/photos', GET: async () => new Response() },
            { path: 'upload', POST: async () => new Response() },
        ]
        const result = validateApiRouteOrdering(routes)
        expect(result.valid).toBe(true)
    })
})

describe('validatePluginSerialization', () => {
    it('should pass for a serializable plugin', () => {
        const result = validatePluginSerialization(createValidPlugin())
        expect(result.valid).toBe(true)
    })

    it('should pass even with React components (they are excluded from serialization)', () => {
        const plugin: PluginDefinition = {
            ...createValidPlugin(),
            adminPages: [
                {
                    path: '',
                    component: () => null, // React component
                },
            ],
            adminNavigation: {
                name: 'Test',
                href: '/admin/p/test',
                icon: () => null, // React component
            },
        }
        const result = validatePluginSerialization(plugin)
        expect(result.valid).toBe(true)
        // Should have a warning about React components
        expect(result.warnings.some((w) => w.includes('React components'))).toBe(
            true
        )
    })
})

describe('validatePluginFully', () => {
    it('should combine all validation results', () => {
        const plugin = {} as PluginDefinition
        const result = validatePluginFully(plugin)
        expect(result.valid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should pass for a complete valid plugin', () => {
        const plugin: PluginDefinition = {
            ...createValidPlugin(),
            adminNavigation: {
                name: 'Test',
                href: '/admin/p/test-plugin',
                icon: () => null,
            },
            adminPages: [
                { path: '', component: () => null },
                { path: 'new', component: () => null },
                { path: '[id]', component: () => null },
            ],
            apiRoutes: [
                { path: '', GET: async () => new Response() },
                { path: 'upload', POST: async () => new Response() },
                { path: '[id]', GET: async () => new Response() },
            ],
        }
        const result = validatePluginFully(plugin)
        expect(result.valid).toBe(true)
    })
})
