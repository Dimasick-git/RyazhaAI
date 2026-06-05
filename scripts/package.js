#!/usr/bin/env node
/**
 * Cross-platform packaging script for RyazhaAI release.
 * Replaces the Windows-only `powershell -Command "Compress-Archive ..."` call.
 * Requires: npm install --save-dev archiver
 */

import archiver from 'archiver'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const releaseDir = path.resolve(__dirname, '../release')
const outputPath = path.join(releaseDir, 'RyazhaAI-release.zip')

// Entries to include in the zip (relative to releaseDir)
const ENTRIES = [
  { type: 'directory', src: path.join(releaseDir, 'dist'), name: 'dist' },
  { type: 'directory', src: path.join(releaseDir, 'switch'), name: 'switch' },
  { type: 'file', src: path.join(releaseDir, 'RyazhaAI.nro'), name: 'RyazhaAI.nro' },
  { type: 'file', src: path.resolve(__dirname, '../README.md'), name: 'README.md' },
]

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(releaseDir, { recursive: true })

  const output = fs.createWriteStream(outputPath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  await new Promise((resolve, reject) => {
    output.on('close', resolve)
    archive.on('error', reject)
    archive.pipe(output)

    for (const entry of ENTRIES) {
      if (entry.type === 'directory') {
        if (fs.existsSync(entry.src)) {
          archive.directory(entry.src, entry.name)
        } else {
          console.warn(`Warning: directory not found, skipping: ${entry.src}`)
        }
      } else {
        if (fs.existsSync(entry.src)) {
          archive.file(entry.src, { name: entry.name })
        } else {
          console.warn(`Warning: file not found, skipping: ${entry.src}`)
        }
      }
    }

    archive.finalize()
  })

  console.log(`Release archive created: ${outputPath} (${archive.pointer()} bytes)`)
}

main().catch((err) => {
  console.error('Packaging failed:', err)
  process.exit(1)
})
