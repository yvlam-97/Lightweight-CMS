/**
 * Sync Plugin Schemas
 *
 * This script copies all plugin schema files to the prisma/schema folder
 * so Prisma can use its multi-file schema feature to generate the client.
 *
 * Run this before `prisma generate` or `prisma db push`.
 */

import * as fs from 'fs'
import * as path from 'path'

const PLUGINS_DIR = path.join(__dirname, '..', 'src', 'plugins')
const PRISMA_SCHEMA_DIR = path.join(__dirname, '..', 'prisma', 'schema')

function syncPluginSchemas() {
    console.log('Syncing plugin schemas...')

    // Ensure prisma/schema directory exists
    if (!fs.existsSync(PRISMA_SCHEMA_DIR)) {
        fs.mkdirSync(PRISMA_SCHEMA_DIR, { recursive: true })
    }

    // Remove old plugin schema files (but keep base.prisma)
    const existingFiles = fs.readdirSync(PRISMA_SCHEMA_DIR)
    for (const file of existingFiles) {
        if (file.startsWith('plugin-') && file.endsWith('.prisma')) {
            fs.unlinkSync(path.join(PRISMA_SCHEMA_DIR, file))
            console.log(`  Removed old: ${file}`)
        }
    }

    // Check if plugins directory exists
    if (!fs.existsSync(PLUGINS_DIR)) {
        console.log('No plugins directory found, skipping...')
        return
    }

    // Find all plugin directories
    const pluginDirs = fs
        .readdirSync(PLUGINS_DIR, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)

    let copiedCount = 0

    for (const pluginDir of pluginDirs) {
        const schemaPath = path.join(PLUGINS_DIR, pluginDir, 'schema.prisma')

        if (fs.existsSync(schemaPath)) {
            const targetPath = path.join(
                PRISMA_SCHEMA_DIR,
                `plugin-${pluginDir}.prisma`
            )
            const content = fs.readFileSync(schemaPath, 'utf-8')

            fs.writeFileSync(targetPath, content)
            console.log(`  Copied: ${pluginDir}/schema.prisma -> plugin-${pluginDir}.prisma`)
            copiedCount++
        }
    }

    console.log(`Done! Synced ${copiedCount} plugin schema(s).`)
}

// Run the script
syncPluginSchemas()
