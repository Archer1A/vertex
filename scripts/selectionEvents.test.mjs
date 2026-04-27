import fs from 'node:fs'
import assert from 'node:assert/strict'

const graphTypes = fs.readFileSync(new URL('../src/types/graph.ts', import.meta.url), 'utf8')
const graphCanvas = fs.readFileSync(new URL('../src/components/GraphCanvas.vue', import.meta.url), 'utf8')
const leftPanel = fs.readFileSync(new URL('../src/components/LeftSelectionPanel.vue', import.meta.url), 'utf8')

assert.match(graphTypes, /events\?: Array<\{/)
assert.match(graphCanvas, /events: getRelatedEventsForSelectedObject\(node\)/)
assert.match(leftPanel, /const activeSecondaryTab = ref\('Properties'\)/)
assert.match(leftPanel, /@click="activeSecondaryTab = 'Events'"/)
assert.match(leftPanel, /props\.selectedObject\?\.events\?\.length/)
assert.match(leftPanel, /event-card/)
assert.match(leftPanel, /event\.properties/)
assert.match(leftPanel, /Ask AI/)
assert.match(leftPanel, /askAiAboutEvent/)
assert.match(leftPanel, /getEventAiInsight/)
assert.match(leftPanel, /ai-insight/)
assert.match(leftPanel, /Pass Rate Percent/)
assert.match(leftPanel, /station-level yield degradation/)
