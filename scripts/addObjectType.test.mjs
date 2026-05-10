import fs from 'node:fs'
import assert from 'node:assert/strict'

const graphTypes = fs.readFileSync(new URL('../src/types/graph.ts', import.meta.url), 'utf8')
const graphCanvas = fs.readFileSync(new URL('../src/components/GraphCanvas.vue', import.meta.url), 'utf8')
const leftPanel = fs.readFileSync(new URL('../src/components/LeftSelectionPanel.vue', import.meta.url), 'utf8')
const addObjectDrawer = fs.readFileSync(new URL('../src/components/AddObjectDrawer.vue', import.meta.url), 'utf8')

assert.match(graphTypes, /nodeKind: 'objectType' \| 'objectInstance'/)
assert.match(graphTypes, /AddObjectTypePayload/)
assert.match(graphTypes, /AddObjectInstancePayload/)

assert.match(leftPanel, />\s*Add objectType\s*</)
assert.match(leftPanel, /function handleAddObjectType/)
assert.doesNotMatch(leftPanel, /function handleAddToCanvas/)

assert.match(addObjectDrawer, /Add objectType/)
assert.match(addObjectDrawer, /emit\('addToCanvas', payload\)/)
assert.doesNotMatch(addObjectDrawer, /add-object-preview/)
assert.doesNotMatch(addObjectDrawer, /Filter objects/)

assert.match(graphCanvas, /function createObjectTypeGraphNode/)
assert.match(graphCanvas, /function handleAddObjectTypeToCanvas/)
assert.match(graphCanvas, /function syncObjectTypeEdgesForNode/)
assert.match(graphCanvas, /function createObjectTypeRelationshipEdge/)
assert.match(graphCanvas, /payload\.nodeKind === 'objectType'/)
assert.match(graphCanvas, /node\.nodeKind === 'objectType'/)
assert.match(graphCanvas, /linkTypes\s*\n\s*\.filter\(\(linkType\) => \{/)
assert.match(graphCanvas, /candidate\.nodeKind === 'objectType'/)
assert.match(graphCanvas, /syncObjectTypeEdgesForNode\(node\)/)
