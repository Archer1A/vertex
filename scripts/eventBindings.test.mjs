import fs from 'node:fs'
import assert from 'node:assert/strict'

const mockEvents = fs.readFileSync(new URL('../src/mock/events.ts', import.meta.url), 'utf8')
const mockIndex = fs.readFileSync(new URL('../src/mock/index.ts', import.meta.url), 'utf8')
const graphCanvas = fs.readFileSync(new URL('../src/components/GraphCanvas.vue', import.meta.url), 'utf8')
const graphNode = fs.readFileSync(new URL('../src/components/GraphNode.vue', import.meta.url), 'utf8')
const leftPanel = fs.readFileSync(new URL('../src/components/LeftSelectionPanel.vue', import.meta.url), 'utf8')
const graphTypes = fs.readFileSync(new URL('../src/types/graph.ts', import.meta.url), 'utf8')
const globalCss = fs.readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8')

assert.match(mockEvents, /EVENT_OBJECT_TYPE_ID\s*=\s*'object_type_event'/)
assert.match(mockEvents, /export const eventObjectType: ObjectType = \{/)
assert.match(mockEvents, /apiName:\s*'event'/)
assert.match(mockEvents, /export const eventBindings:\s*Array<\{ objectInstanceId: string; eventId: string \}>\s*=\s*\[/)
assert.match(mockEvents, /badge_color/)
assert.match(mockIndex, /export \* from '\.\/events'/)

assert.match(graphTypes, /eventIds\?: string\[\]/)
assert.match(graphCanvas, /getEventsForObjectInstance/)
assert.match(graphCanvas, /getNodeEventCount/)
assert.match(graphCanvas, /event-badge-color/)
assert.match(graphNode, /eventBadgeColor\?: string/)
assert.match(globalCss, /--event-badge-color/)

assert.match(leftPanel, /\(props\.selectedObject\?\.(?:events)\?\.(?:length)\s*\?\?\s*0\)\s*>\s*0/)
assert.match(leftPanel, /\?\s*'Events'/)

console.log('event bindings wiring tests passed')
