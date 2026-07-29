#!/usr/bin/env node
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const distAssets = join(process.cwd(), 'dist', 'assets')
const outDir = join(process.cwd(), 'assets')

mkdirSync(outDir, { recursive: true })

for (const name of ['app.js', 'app.css']) {
  const from = join(distAssets, name)
  if (!existsSync(from)) {
    console.error(`Missing ${from}. Run "npm run build" first.`)
    process.exit(1)
  }
  copyFileSync(from, join(outDir, name))
  console.log(`synced ${name}`)
}
