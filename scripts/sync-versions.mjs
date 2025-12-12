import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const rootDir = process.cwd()
const packageJsonPath = resolve(rootDir, 'package.json')
const manifestPath = resolve(rootDir, 'public/manifest.json')

try {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))

  if (manifest.version !== packageJson.version) {
    console.log(`Updating manifest version from ${manifest.version} to ${packageJson.version}`)
    manifest.version = packageJson.version
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
    console.log('Manifest updated.')
  } else {
    console.log('Versions are already in sync.')
  }
} catch (err) {
  console.error('Failed to sync versions:', err)
  process.exit(1)
}
