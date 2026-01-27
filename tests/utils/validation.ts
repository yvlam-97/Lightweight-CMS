/**
 * Plugin Validation Utilities
 *
 * These utilities help validate plugins during development and testing.
 * They can catch common issues like:
 *
 * 1. JSON serialization problems (React components in API responses)
 * 2. Missing required fields
 * 3. Invalid route configurations
 * 4. Route ordering issues
 */

import { PluginDefinition, PluginApiRoute } from '../../src/lib/plugins/types'

export interface ValidationResult {
    valid: boolean
    errors: string[]
    warnings: string[]
}

/**
 * Validates that a plugin definition is correctly structured.
 */
export function validatePlugin(plugin: PluginDefinition): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!plugin.id) errors.push('Plugin must have an id')
    if (!plugin.name) errors.push('Plugin must have a name')
    if (!plugin.description) errors.push('Plugin must have a description')
    if (!plugin.version) errors.push('Plugin must have a version')

    // ID format validation
    if (plugin.id && !/^[a-z][a-z0-9-]*$/.test(plugin.id)) {
        errors.push(
            `Plugin id "${plugin.id}" must be lowercase, start with a letter, and contain only letters, numbers, and hyphens`
        )
    }

    // Validate admin navigation
    if (plugin.adminNavigation) {
        if (!plugin.adminNavigation.name) {
            errors.push('Admin navigation must have a name')
        }
        if (!plugin.adminNavigation.href) {
            errors.push('Admin navigation must have an href')
        }
        if (typeof plugin.adminNavigation.icon !== 'function') {
            errors.push('Admin navigation icon must be a React component')
        }
    }

    // Validate admin pages
    if (plugin.adminPages) {
        const hasRootPage = plugin.adminPages.some((p) => p.path === '')
        if (!hasRootPage) {
            warnings.push(
                'Admin pages should include a root page (path: "") for the main listing'
            )
        }

        for (const page of plugin.adminPages) {
            if (typeof page.component !== 'function') {
                errors.push(
                    `Admin page "${page.path}" component must be a React component`
                )
            }
        }
    }

    // Validate public pages
    if (plugin.publicPages) {
        for (const page of plugin.publicPages) {
            if (typeof page.component !== 'function') {
                errors.push(
                    `Public page "${page.path}" component must be a React component`
                )
            }
        }
    }

    // Validate API routes
    if (plugin.apiRoutes) {
        const routeOrderingResult = validateApiRouteOrdering(plugin.apiRoutes)
        errors.push(...routeOrderingResult.errors)
        warnings.push(...routeOrderingResult.warnings)

        for (const route of plugin.apiRoutes) {
            const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
            const hasMethod = methods.some(
                (m) => typeof (route as any)[m] === 'function'
            )
            if (!hasMethod) {
                errors.push(
                    `API route "${route.path}" must have at least one HTTP method handler`
                )
            }
        }
    }

    // Validate homepage section
    if (plugin.homepageSection) {
        if (typeof plugin.homepageSection.component !== 'function') {
            errors.push('Homepage section component must be a React component')
        }
    }

    // Validate translations
    if (plugin.translations) {
        const locales = Object.keys(plugin.translations)
        if (locales.length > 1) {
            const firstLocaleKeys = Object.keys(
                plugin.translations[locales[0]]
            ).sort()

            for (const locale of locales.slice(1)) {
                const localeKeys = Object.keys(plugin.translations[locale]).sort()
                const missingKeys = firstLocaleKeys.filter(
                    (k) => !localeKeys.includes(k)
                )
                const extraKeys = localeKeys.filter(
                    (k) => !firstLocaleKeys.includes(k)
                )

                if (missingKeys.length > 0) {
                    warnings.push(
                        `Translation locale "${locale}" is missing keys: ${missingKeys.join(', ')}`
                    )
                }
                if (extraKeys.length > 0) {
                    warnings.push(
                        `Translation locale "${locale}" has extra keys: ${extraKeys.join(', ')}`
                    )
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    }
}

/**
 * Validates that API routes are ordered correctly.
 * Static routes should come before dynamic routes to avoid matching issues.
 *
 * This catches the exact bug we had where '/upload' was matched by '[id]' instead.
 */
export function validateApiRouteOrdering(
    routes: PluginApiRoute[]
): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Find routes that could conflict
    for (let i = 0; i < routes.length; i++) {
        const route = routes[i]

        // Check if this is a dynamic single-segment route like '[id]'
        if (/^\[[\w]+\]$/.test(route.path)) {
            // Look for static single-segment routes that come after
            for (let j = i + 1; j < routes.length; j++) {
                const laterRoute = routes[j]
                // Static single-segment route (no slashes, no brackets)
                if (
                    !laterRoute.path.includes('/') &&
                    !laterRoute.path.includes('[')
                ) {
                    errors.push(
                        `API route ordering issue: Static route "${laterRoute.path}" should come BEFORE dynamic route "${route.path}" to avoid incorrect matching`
                    )
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    }
}

/**
 * Tests if a plugin's metadata can be safely JSON serialized.
 * This catches the issue where React components in the response break JSON.stringify().
 */
export function validatePluginSerialization(
    plugin: PluginDefinition
): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // This is what the API route does - it should work without throwing
    const serializable = {
        id: plugin.id,
        name: plugin.name,
        description: plugin.description,
        version: plugin.version,
        author: plugin.author,
        defaultPublicPath: plugin.defaultPublicPath,
        adminNavigation: plugin.adminNavigation
            ? {
                name: plugin.adminNavigation.name,
                href: plugin.adminNavigation.href,
            }
            : undefined,
    }

    try {
        const jsonString = JSON.stringify(serializable)
        JSON.parse(jsonString)
    } catch (error) {
        errors.push(
            `Plugin metadata cannot be JSON serialized: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
    }

    // Warn about fields that contain non-serializable values
    if (plugin.adminPages?.some((p) => typeof p.component === 'function')) {
        // This is expected, just a reminder
        warnings.push(
            'adminPages contains React components - ensure API responses exclude component property'
        )
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    }
}

/**
 * Run all validations on a plugin.
 */
export function validatePluginFully(plugin: PluginDefinition): ValidationResult {
    const results = [
        validatePlugin(plugin),
        validatePluginSerialization(plugin),
    ]

    return {
        valid: results.every((r) => r.valid),
        errors: results.flatMap((r) => r.errors),
        warnings: results.flatMap((r) => r.warnings),
    }
}
