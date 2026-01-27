'use client'

import { AlbumForm } from '../components/AlbumForm'

interface Props {
    params?: Record<string, string>
    pluginId: string
}

export function AlbumNewPage({ pluginId }: Props) {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Create New Album
            </h1>
            <AlbumForm />
        </div>
    )
}
