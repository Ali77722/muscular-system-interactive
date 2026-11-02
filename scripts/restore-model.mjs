import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const partsDir = join(root, 'model-parts')
const output = join(root, 'public', 'models', 'muscles.glb')
const manifest = JSON.parse(await readFile(join(root, 'public', 'models', 'manifest.json'), 'utf8'))
const names = (await readdir(partsDir)).filter((name) => /^muscles-\d{2}\.b64$/.test(name)).sort()
if (names.length === 0) throw new Error('Model chunks are missing from model-parts/.')
const buffers = []
for (const name of names) {
  const encoded = (await readFile(join(partsDir, name), 'utf8')).trim()
  if (!/^[A-Za-z0-9+/=]+$/.test(encoded)) throw new Error(`Invalid base64 in ${name}`)
  buffers.push(Buffer.from(encoded, 'base64'))
}
const model = Buffer.concat(buffers)
const digest = createHash('sha256').update(model).digest('hex')
if (model.length !== manifest.runtime.bytes || digest !== manifest.runtime.sha256) {
  throw new Error(`Model integrity check failed: ${model.length} bytes, SHA-256 ${digest}`)
}
await mkdir(dirname(output), { recursive: true })
await writeFile(output, model)
console.log(`Restored ${manifest.runtime.file}: ${model.length.toLocaleString()} bytes; SHA-256 verified.`)
