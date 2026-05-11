import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const outDir = '/tmp/vertex-viewport-transform-test'
mkdirSync(outDir, { recursive: true })
writeFileSync(`${outDir}/package.json`, '{"type":"module"}\n')

execFileSync(
  './node_modules/.bin/tsc',
  [
    'src/utils/viewportTransform.ts',
    '--outDir',
    outDir,
    '--module',
    'ES2022',
    '--target',
    'ES2022',
    '--moduleResolution',
    'Bundler',
    '--strict',
    '--skipLibCheck'
  ],
  { stdio: 'inherit' }
)

const { clampGraphNodePosition, clampScale, getGraphPercentPosition, zoomViewportAtPoint } = await import(
  pathToFileURL(`${outDir}/viewportTransform.js`)
)

assert.equal(clampScale(0.1), 0.45)
assert.equal(clampScale(3), 2.4)
assert.equal(clampScale(1.25), 1.25)

const viewport = { x: 40, y: -20, scale: 1 }
const point = { x: 300, y: 160 }
const zoomed = zoomViewportAtPoint(viewport, 2, point)

assert.deepEqual(zoomed, { x: -220, y: -200, scale: 2 })

const beforeWorldX = (point.x - viewport.x) / viewport.scale
const beforeWorldY = (point.y - viewport.y) / viewport.scale
const afterWorldX = (point.x - zoomed.x) / zoomed.scale
const afterWorldY = (point.y - zoomed.y) / zoomed.scale

assert.equal(afterWorldX, beforeWorldX)
assert.equal(afterWorldY, beforeWorldY)

assert.deepEqual(
  getGraphPercentPosition({
    clientX: 540,
    clientY: 330,
    rect: { left: 100, top: 50, width: 800, height: 500 },
    viewport: { x: 40, y: -20, scale: 2 },
    offsetX: 0,
    offsetY: 0
  }),
  { x: 25, y: 30 }
)

assert.deepEqual(clampGraphNodePosition({ x: 6, y: 9 }), { x: 8, y: 10 })
assert.deepEqual(clampGraphNodePosition({ x: 30, y: 40 }), { x: 30, y: 40 })
assert.deepEqual(clampGraphNodePosition({ x: 99, y: 96 }), { x: 94, y: 90 })

console.log('viewport transform tests passed')
