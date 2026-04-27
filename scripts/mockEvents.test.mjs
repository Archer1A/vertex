import fs from 'node:fs'
import assert from 'node:assert/strict'

const source = fs.readFileSync(new URL('../src/mock/mock.ts', import.meta.url), 'utf8')
const graphCanvas = fs.readFileSync(new URL('../src/components/GraphCanvas.vue', import.meta.url), 'utf8')
const graphNode = fs.readFileSync(new URL('../src/components/GraphNode.vue', import.meta.url), 'utf8')
const globalCss = fs.readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8')

assert.match(source, /export const eventObjectType: ObjectType = \{/)
assert.match(source, /objectTypes: ObjectType\[\] = \[\s*workstationObjectType,\s*serverObjectType,\s*eventObjectType/s)
assert.match(source, /export const serverFailureEventLinkType: LinkType = \{/)
assert.match(source, /export const workstationPassRateEventLinkType: LinkType = \{/)
assert.match(source, /export const eventInstances: ObjectInstance\[\] = \[/)
const eventInstancesBlock = source.match(/export const eventInstances: ObjectInstance\[\] = \[(?<body>[\s\S]*?)\n\]/)?.groups?.body ?? ''
assert.equal((eventInstancesBlock.match(/objectTypeId: EVENT_OBJECT_TYPE_ID/g) ?? []).length, 4)
assert.equal((source.match(/serverId: 'server02'/g) ?? []).length, 1)
assert.equal((source.match(/serverId: 'server05'/g) ?? []).length, 1)
assert.equal((source.match(/serverId: 'server06'/g) ?? []).length, 1)
assert.equal((source.match(/workstationCode: 'Workstation2'/g) ?? []).length, 1)
assert.match(source, /eventType: 'Workstation Pass Rate Low'/)
assert.match(source, /passRatePercent: 87\.5/)
assert.match(source, /thresholdPercent: 90/)
assert.match(source, /\.\.\.eventInstances/)
assert.match(graphCanvas, /:event-count="getNodeEventCount\(node\)"/)
assert.match(graphNode, /graph-node__event-badge/)
assert.match(globalCss, /\.graph-node__event-badge/)
