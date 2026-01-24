'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { PluginInstance, PluginContextType } from './types'

const PluginContext = createContext<PluginContextType | undefined>(undefined)

interface PluginProviderProps {
    children: ReactNode
    initialPlugins?: PluginInstance[]
}

/**
 * Plugin provider component that makes plugin state available throughout the app.
 */
export function PluginProvider({ children, initialPlugins = [] }: PluginProviderProps) {
    const [plugins, setPlugins] = useState<PluginInstance[]>(initialPlugins)
    const [isLoading, setIsLoading] = useState(!initialPlugins.length)

    // Fetch plugins from API on mount if not provided
    useEffect(() => {
        if (initialPlugins.length === 0) {
            refreshPlugins()
        }
    }, [])

    const refreshPlugins = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/admin/plugins')
            if (response.ok) {
                const data = await response.json()
                setPlugins(data.plugins || [])
            }
        } catch (error) {
            console.error('Failed to fetch plugins:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const enabledPlugins = plugins.filter((p) => p.enabled).map((p) => p.id)

    const isPluginEnabled = useCallback(
        (pluginId: string) => {
            return plugins.some((p) => p.id === pluginId && p.enabled)
        },
        [plugins]
    )

    const getPlugin = useCallback(
        (pluginId: string) => {
            return plugins.find((p) => p.id === pluginId)
        },
        [plugins]
    )

    const getPluginPublicPath = useCallback(
        (pluginId: string) => {
            const plugin = plugins.find((p) => p.id === pluginId)
            if (!plugin) return undefined
            return plugin.customPublicPath || plugin.defaultPublicPath
        },
        [plugins]
    )

    const value: PluginContextType = {
        plugins,
        enabledPlugins,
        isLoading,
        isPluginEnabled,
        getPlugin,
        getPluginPublicPath,
        refreshPlugins,
    }

    return (
        <PluginContext.Provider value={value}>
            {children}
        </PluginContext.Provider>
    )
}

/**
 * Hook to access plugin context.
 */
export function usePlugins(): PluginContextType {
    const context = useContext(PluginContext)
    if (context === undefined) {
        throw new Error('usePlugins must be used within a PluginProvider')
    }
    return context
}

/**
 * Hook to check if a specific plugin is enabled.
 */
export function usePluginEnabled(pluginId: string): boolean {
    const { isPluginEnabled } = usePlugins()
    return isPluginEnabled(pluginId)
}

/**
 * Hook to get a specific plugin.
 */
export function usePlugin(pluginId: string): PluginInstance | undefined {
    const { getPlugin } = usePlugins()
    return getPlugin(pluginId)
}

/**
 * Hook to get the public path for a plugin.
 */
export function usePluginPublicPath(pluginId: string): string | undefined {
    const { getPluginPublicPath } = usePlugins()
    return getPluginPublicPath(pluginId)
}
