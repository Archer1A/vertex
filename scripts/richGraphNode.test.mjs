import fs from 'node:fs'
import assert from 'node:assert/strict'

const graphTypes = fs.readFileSync(new URL('../src/types/graph.ts', import.meta.url), 'utf8')
const graphCanvas = fs.readFileSync(new URL('../src/components/GraphCanvas.vue', import.meta.url), 'utf8')
const graphNode = fs.readFileSync(new URL('../src/components/GraphNode.vue', import.meta.url), 'utf8')
const globalCss = fs.readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8')

assert.match(graphTypes, /export interface GraphNodeDisplayData/)
assert.match(graphTypes, /tone: 'info' \| 'success' \| 'warning' \| 'danger' \| 'neutral'/)

assert.match(graphCanvas, /function getNodeDisplayData\(node: GraphNodeData\): GraphNodeDisplayData/)
assert.match(graphCanvas, /:display-data="getNodeDisplayData\(node\)"/)
assert.match(graphCanvas, /:node-kind="node\.nodeKind"/)
assert.match(graphCanvas, /activeServers/)
assert.match(graphCanvas, /measuredTemperatureC/)
assert.match(graphCanvas, /isCancelled/)
assert.match(graphCanvas, /metric\('Schema'/)
assert.match(graphCanvas, /metric\('Records'/)
assert.match(graphCanvas, /metric\('Links'/)

assert.match(graphNode, /displayData: GraphNodeDisplayData/)
assert.match(graphNode, /nodeKind\?: 'objectType' \| 'objectInstance'/)
assert.match(graphNode, /:title="displayData\.title"/)
assert.match(graphNode, /graph-node--object-type/)
assert.match(graphNode, /Box v-if="nodeKind === 'objectType'"/)
assert.match(graphNode, /graph-node__metric/)
assert.match(graphNode, /graph-node__badge/)
assert.match(graphNode, /:style="\{ '--node-accent': displayData\.accentColor \}"/)

assert.match(globalCss, /width: 230px;/)
assert.match(globalCss, /graph-node--object-type/)
assert.match(globalCss, /graph-node--object-type \.graph-node__surface::before/)
assert.match(globalCss, /graph-node--object-type \.graph-node__header/)
assert.match(globalCss, /graph-node__metrics/)
assert.match(globalCss, /graph-node__badge--danger/)
assert.match(globalCss, /box-shadow: 0 0 0 4px rgba\(37, 99, 235, 0\.18\)/)
