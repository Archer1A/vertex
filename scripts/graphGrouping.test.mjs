import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const outDir = '/tmp/vertex-graph-grouping-test'
mkdirSync(outDir, { recursive: true })
writeFileSync(`${outDir}/package.json`, '{"type":"module"}\n')

execFileSync(
  './node_modules/.bin/tsc',
  [
    'src/utils/graphGrouping.ts',
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

const { groupNodesByIds } = await import(pathToFileURL(`${outDir}/utils/graphGrouping.js`))

const makeNode = (id, objectTypeId, x, y) => ({
  id,
  label: id.toUpperCase(),
  type: objectTypeId === 'object_type_airport' ? 'airport' : 'flight',
  objectTypeId,
  instance: {
    id,
    objectTypeId,
    properties: {}
  },
  x,
  y
})

const nodes = [
  makeNode('a', 'object_type_airport', 10, 20),
  makeNode('b', 'object_type_airport', 20, 30),
  makeNode('c', 'object_type_airport', 30, 40),
  makeNode('x', 'object_type_flight', 60, 20),
  makeNode('y', 'object_type_flight', 70, 30),
  makeNode('z', 'object_type_flight', 80, 40)
]

const edges = [
  { id: 'a-origin-x', source: 'a', target: 'x', label: 'origin', linkTypeId: 'origin' },
  { id: 'b-destination-y', source: 'b', target: 'y', label: 'destination', linkTypeId: 'destination' },
  { id: 'c-origin-z', source: 'c', target: 'z', label: 'origin', linkTypeId: 'origin' },
  { id: 'x-origin-a', source: 'x', target: 'a', label: 'origin', linkTypeId: 'origin' },
  { id: 'a-origin-b', source: 'a', target: 'b', label: 'origin', linkTypeId: 'origin' }
]

const result = groupNodesByIds(nodes, edges, ['a', 'b', 'c'], () => 'Airport')

assert.equal(result.nodes.length, 4)
assert.equal(result.groupedNodeId, 'group_object_type_airport_a_b_c')

const groupedNode = result.nodes.find((node) => node.id === result.groupedNodeId)
assert.ok(groupedNode)
assert.equal(groupedNode.label, '3 Airport')
assert.equal(groupedNode.objectTypeId, 'object_type_airport')
assert.equal(groupedNode.x, 20)
assert.equal(groupedNode.y, 30)

assert.deepEqual(
  result.edges.map((edge) => [edge.source, edge.target, edge.linkTypeId]).sort(),
  [
    ['group_object_type_airport_a_b_c', 'x', 'origin'],
    ['group_object_type_airport_a_b_c', 'y', 'destination'],
    ['group_object_type_airport_a_b_c', 'z', 'origin'],
    ['x', 'group_object_type_airport_a_b_c', 'origin']
  ].sort()
)

assert.throws(
  () => groupNodesByIds(nodes, edges, ['a', 'x'], () => 'Object'),
  /same object type/
)

console.log('graph grouping tests passed')
