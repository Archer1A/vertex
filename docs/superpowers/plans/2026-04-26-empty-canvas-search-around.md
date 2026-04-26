# Empty Canvas Search Around Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the graph canvas start empty, let `Layers -> Add object` add Equals-filtered mock objects, and let Search Around add related mock nodes and edges.

**Architecture:** Keep graph state local to `GraphCanvas.vue`: nodes, edges, selected node, and Search Around state all live there. Child panels emit typed payloads upward; `GraphCanvas` converts mock `ObjectInstance` records into visual graph nodes and relationship edges. Existing Vue 3 Composition API and DOM/CSS graph rendering stay in place.

**Tech Stack:** Vue 3 Composition API, TypeScript, Vite, lucide-vue-next, existing mock data from `src/mock/mock.ts`.

---

## File Structure

- Create `src/types/graph.ts`
  - Shared UI graph types: `SelectedObject`, `GraphNodeData`, `GraphEdgeData`, `AddObjectPayload`, `SearchAroundAddPayload`.
- Modify `src/App.vue`
  - Remove hardcoded SFO selected object.
  - Continue owning sheets only.
  - Pass `activeSheetIndex` to `GraphCanvas`.
- Modify `src/components/GraphCanvas.vue`
  - Initialize graph nodes and edges as empty arrays.
  - Own add-object and search-around graph mutations.
  - Compute selected object details from the selected node.
  - Render only current graph edges.
- Modify `src/components/LeftSelectionPanel.vue`
  - Accept nullable selected object.
  - Emit `addToCanvas` from the add object drawer.
  - Render a selection empty state.
- Modify `src/components/AddObjectDrawer.vue`
  - Reduce filtering to a single `Equals` operator.
  - Emit matched object ids.
  - Preserve preview behavior.
- Modify `src/components/SearchAroundPanel.vue`
  - Use the selected starting instance instead of parsing the rendered selected object fields.
  - Emit `addToGraph` with result object ids and chosen link type.
- Modify `src/styles/global.css`
  - Add or refine empty state and disabled button styling only where the existing classes are insufficient.

## Task 1: Shared Graph Types

**Files:**
- Create: `src/types/graph.ts`
- Modify: `src/App.vue`
- Modify: `src/components/GraphCanvas.vue`
- Modify: `src/components/LeftSelectionPanel.vue`
- Modify: `src/components/SearchAroundPanel.vue`
- Test: `npm run build`

- [ ] **Step 1: Create shared graph UI types**

Create `src/types/graph.ts`:

```ts
import type { LinkType, ObjectInstance } from '../mock/mock'

export interface SelectedObject {
  title: string
  subtitle: string
  nodeLabel: string
  properties: Array<{
    key: string
    value: string
  }>
}

export interface GraphNodeData {
  id: string
  label: string
  type: 'airport' | 'flight'
  objectTypeId: string
  instance: ObjectInstance
  x: number
  y: number
}

export interface GraphEdgeData {
  id: string
  source: string
  target: string
  label: string
  linkTypeId: string
}

export type EqualsFilterPayload = {
  objectTypeId: string
  propertyApiName: string
  operator: 'equals'
  value: string
}

export type AddObjectPayload = {
  objectTypeId: string
  objectIds: string[]
  filter: EqualsFilterPayload | null
}

export type SearchAroundAddPayload = {
  linkType: LinkType
  objectIds: string[]
}
```

- [ ] **Step 2: Update imports away from `SelectedObject` in `App.vue`**

In `src/components/GraphCanvas.vue`, replace:

```ts
import type { SelectedObject } from '../App.vue'
```

with:

```ts
import type { AddObjectPayload, GraphEdgeData, GraphNodeData, SearchAroundAddPayload, SelectedObject } from '../types/graph'
```

In `src/components/LeftSelectionPanel.vue`, replace:

```ts
import type { SelectedObject } from '../App.vue'
```

with:

```ts
import type { AddObjectPayload, SelectedObject } from '../types/graph'
```

In `src/components/SearchAroundPanel.vue`, replace:

```ts
import type { SelectedObject } from '../App.vue'
```

with:

```ts
import type { SearchAroundAddPayload, SelectedObject } from '../types/graph'
```

- [ ] **Step 3: Remove hardcoded selected object from `App.vue`**

Replace the script in `src/App.vue` with:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import TopBar from './components/TopBar.vue'
import SheetBar from './components/SheetBar.vue'
import GraphCanvas from './components/GraphCanvas.vue'

const sheets = ref(['Sheet 1', 'Sheet 2'])
const activeSheet = ref('Sheet 1')

const activeSheetIndex = computed(() => sheets.value.indexOf(activeSheet.value))

function selectSheet(sheet: string) {
  activeSheet.value = sheet
}

function addSheet() {
  const sheetName = `Sheet ${sheets.value.length + 1}`
  sheets.value.push(sheetName)
  activeSheet.value = sheetName
  console.log('add sheet', sheetName)
}
</script>
```

Replace the `GraphCanvas` usage in the template with:

```vue
<GraphCanvas :active-sheet-index="activeSheetIndex" />
```

- [ ] **Step 4: Run build and capture expected type failures**

Run:

```bash
npm run build
```

Expected: TypeScript fails because `GraphCanvas.vue` still declares a required `selectedObject` prop and several components still expect non-null selected objects. These failures confirm the old hardcoded SFO data path has been removed.

- [ ] **Step 5: Commit**

```bash
git add src/types/graph.ts src/App.vue src/components/GraphCanvas.vue src/components/LeftSelectionPanel.vue src/components/SearchAroundPanel.vue
git commit -m "refactor: move graph UI types out of app"
```

## Task 2: Empty Canvas State In `GraphCanvas`

**Files:**
- Modify: `src/components/GraphCanvas.vue`
- Test: `npm run build`

- [ ] **Step 1: Remove local graph type declarations and selected object prop**

In `src/components/GraphCanvas.vue`, delete the local `GraphNodeData` and `GraphEdgeData` interfaces. Replace the props declaration with:

```ts
const props = defineProps<{
  activeSheetIndex: number
}>()
```

Keep `props` because `activeSheetIndex` is still part of the current component contract.

- [ ] **Step 2: Initialize graph state as empty arrays**

Replace:

```ts
const selectedNodeId = ref('airport_sfo')
const searchAroundStartNodeId = ref('airport_sfo')
const graphNodes = reactive<GraphNodeData[]>(createGraphNodes())
const graphEdges = computed<GraphEdgeData[]>(createGraphEdges)
```

with:

```ts
const selectedNodeId = ref('')
const searchAroundStartNodeId = ref('')
const graphNodes = reactive<GraphNodeData[]>([])
const graphEdges = reactive<GraphEdgeData[]>([])
```

- [ ] **Step 3: Compute selected node and selected object**

Add these computed values after `graphStats`:

```ts
const selectedGraphNode = computed(() => {
  return graphNodes.find((node) => node.id === selectedNodeId.value) ?? null
})

const selectedObjectForPanel = computed<SelectedObject | null>(() => {
  return selectedGraphNode.value ? toSelectedObject(selectedGraphNode.value) : null
})
```

Replace `graphStats` with:

```ts
const graphStats = computed(() => ({
  objects: objectTypes.length,
  nodes: graphNodes.length,
  edges: graphEdges.length
}))
```

- [ ] **Step 4: Replace edge computed usage**

Replace every `graphEdges.value` reference in `GraphCanvas.vue` with `graphEdges`.

The `edgeLines` computed should become:

```ts
const edgeLines = computed(() =>
  graphEdges
    .map((edge) => {
      const source = graphNodes.find((node) => node.id === edge.source)
      const target = graphNodes.find((node) => node.id === edge.target)

      if (!source || !target) {
        return null
      }

      return {
        ...edge,
        x1: source.x,
        y1: source.y,
        x2: target.x - (target.x - source.x) * 0.08,
        y2: target.y - (target.y - source.y) * 0.08
      }
    })
    .filter((edge): edge is NonNullable<typeof edge> => edge !== null)
)
```

- [ ] **Step 5: Pass nullable selected object to left panel**

In the template, replace:

```vue
:selected-object="selectedObject"
```

with:

```vue
:selected-object="selectedObjectForPanel"
```

- [ ] **Step 6: Run build and capture remaining expected failures**

Run:

```bash
npm run build
```

Expected: TypeScript still fails in `LeftSelectionPanel.vue` because it has not yet accepted `SelectedObject | null`, and Search Around still assumes a selected object is always available.

- [ ] **Step 7: Commit**

```bash
git add src/components/GraphCanvas.vue
git commit -m "feat: start graph canvas with empty local state"
```

## Task 3: Add Object Emits Real Graph Mutations

**Files:**
- Modify: `src/components/GraphCanvas.vue`
- Modify: `src/components/LeftSelectionPanel.vue`
- Modify: `src/components/AddObjectDrawer.vue`
- Test: `npm run build`

- [ ] **Step 1: Add node creation helpers in `GraphCanvas.vue`**

Add these helpers near the existing `createGraphNodes` function, then remove `createGraphNodes` if it is unused:

```ts
function clampPercent(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getDefaultNodePosition(instance: ObjectInstance, index: number) {
  const airportCode = toDisplayString(instance.properties.airport)
  const flightId = toDisplayString(instance.properties.flightId)
  const fallbackPosition = {
    x: 48 + (index % 4) * 8,
    y: 42 + Math.floor(index / 4) * 10
  }

  if (instance.objectTypeId === 'object_type_airport') {
    return airportPositions[airportCode] ?? fallbackPosition
  }

  return flightPositions[flightId] ?? fallbackPosition
}

function getAnchoredNodePosition(anchor: GraphNodeData, index: number, total: number) {
  const angle = total <= 1 ? 0 : (Math.PI * 2 * index) / total
  const radius = 16

  return {
    x: clampPercent(anchor.x + Math.cos(angle) * radius, 8, 92),
    y: clampPercent(anchor.y + Math.sin(angle) * radius, 10, 90)
  }
}

function createGraphNode(instance: ObjectInstance, index: number, anchor?: GraphNodeData, total = 1): GraphNodeData {
  const position = anchor ? getAnchoredNodePosition(anchor, index, total) : getDefaultNodePosition(instance, graphNodes.length + index)

  return {
    id: instance.id,
    label: getInstanceLabel(instance),
    type: instance.objectTypeId === 'object_type_airport' ? 'airport' : 'flight',
    objectTypeId: instance.objectTypeId,
    instance,
    x: position.x,
    y: position.y
  }
}

function addNodeIfMissing(instance: ObjectInstance, index: number, anchor?: GraphNodeData, total = 1) {
  const existingNode = graphNodes.find((node) => node.id === instance.id)

  if (existingNode) {
    return existingNode
  }

  const node = createGraphNode(instance, index, anchor, total)
  graphNodes.push(node)
  return node
}
```

- [ ] **Step 2: Add the add-object handler in `GraphCanvas.vue`**

Add:

```ts
function handleAddObjectsToCanvas(payload: AddObjectPayload) {
  const instancesToAdd = payload.objectIds
    .map((objectId) => objectInstances.find((instance) => instance.id === objectId))
    .filter((instance): instance is ObjectInstance => instance !== undefined)

  instancesToAdd.forEach((instance, index) => {
    addNodeIfMissing(instance, index)
  })

  if (instancesToAdd.length > 0) {
    selectedNodeId.value = instancesToAdd[0].id
  }

  console.log('add objects to canvas', payload)
}
```

In the `LeftSelectionPanel` usage, add:

```vue
@add-to-canvas="handleAddObjectsToCanvas"
```

- [ ] **Step 3: Update `LeftSelectionPanel.vue` props and emits**

Replace the props block with:

```ts
defineProps<{
  selectedObject: SelectedObject | null
  graphStats: {
    objects: number
    nodes: number
    edges: number
  }
  objectTypes: ObjectType[]
  objectInstances: ObjectInstance[]
  nodeGroups: Array<{
    objectTypeId: string
    displayName: string
    apiName: string
    icon?: string
    color?: string
    count: number
  }>
}>()
```

Replace the emits block with:

```ts
const emit = defineEmits<{
  (event: 'dockTool', payload: { tab: string; clientX: number; clientY: number }): void
  (event: 'addToCanvas', payload: AddObjectPayload): void
}>()
```

Replace `handleAddToCanvas` with:

```ts
function handleAddToCanvas(payload: AddObjectPayload) {
  selectedLayerObjectTypeId.value = payload.objectTypeId
  isAddObjectDrawerOpen.value = false
  emit('addToCanvas', payload)
  console.log('add object drawer payload', payload)
}
```

- [ ] **Step 4: Render Selection empty state in `LeftSelectionPanel.vue`**

Inside the `activePrimaryTab === 'Selection'` template branch, wrap the existing selected-object markup with:

```vue
<template v-if="selectedObject">
  <!-- existing selection object header, subtabs, filter, property list, and add button stay here -->
</template>

<div v-else class="selection-panel__empty">
  <div class="selection-panel__empty-title">No object selected</div>
  <div class="selection-panel__empty-copy">Select a node on the canvas to inspect its properties.</div>
</div>
```

Move the existing selected object header, secondary tabs, filter, `PropertyList`, and add button inside the `v-if` template.

- [ ] **Step 5: Simplify `AddObjectDrawer.vue` to Equals**

In `src/components/AddObjectDrawer.vue`, import the shared payload type:

```ts
import type { AddObjectPayload, EqualsFilterPayload } from '../types/graph'
```

Replace the local `FilterPayload` type and emit payload type with:

```ts
const emit = defineEmits<{
  (event: 'close'): void
  (event: 'addToCanvas', payload: AddObjectPayload): void
}>()
```

Replace:

```ts
const filterOperator = ref('contains')
const appliedFilter = ref<FilterPayload | null>(null)
```

with:

```ts
const filterOperator = ref<'equals'>('equals')
const appliedFilter = ref<EqualsFilterPayload | null>(null)
```

Replace the `operators` computed with:

```ts
const operators = computed(() => (selectedFilterProperty.value ? ['equals'] : []))
```

- [ ] **Step 6: Replace filter matching with Equals-only logic**

In `AddObjectDrawer.vue`, replace `matchesFilter` with:

```ts
function matchesFilter(value: PropertyValue, property: PropertyType, filter: EqualsFilterPayload | null) {
  if (!filter) {
    return true
  }

  const rawValue = toDisplayString(value).trim()
  const rawFilter = filter.value.trim()

  if (property.baseType === 'number') {
    const numericValue = Number(rawValue)
    const numericFilter = Number(rawFilter)
    return !Number.isNaN(numericValue) && !Number.isNaN(numericFilter) && numericValue === numericFilter
  }

  if (property.baseType === 'boolean') {
    return rawValue.toLowerCase() === rawFilter.toLowerCase()
  }

  if (property.baseType === 'date' || property.baseType === 'datetime') {
    const valueTime = new Date(rawValue).getTime()
    const filterTime = new Date(rawFilter).getTime()

    if (!Number.isNaN(valueTime) && !Number.isNaN(filterTime)) {
      return valueTime === filterTime
    }
  }

  return rawValue.toLowerCase() === rawFilter.toLowerCase()
}
```

Replace `applyFilter` with:

```ts
function applyFilter() {
  if (!selectedFilterProperty.value || isUnsupportedFilterType(selectedFilterProperty.value)) {
    return
  }

  appliedFilter.value = {
    objectTypeId: selectedObjectTypeId.value,
    propertyApiName: selectedFilterProperty.value.apiName,
    operator: 'equals',
    value: filterValue.value
  }

  console.log('apply add object filter', appliedFilter.value)
}
```

- [ ] **Step 7: Keep the operator control but show only Equals**

In the `Operator` `<select>`, keep the existing loop. It will render only one option:

```vue
<option v-for="operator in operators" :key="operator" :value="operator">
  {{ operator }}
</option>
```

- [ ] **Step 8: Run build**

Run:

```bash
npm run build
```

Expected: Build may still fail due to Search Around assumptions. Add Object and nullable Selection errors should be gone.

- [ ] **Step 9: Commit**

```bash
git add src/components/GraphCanvas.vue src/components/LeftSelectionPanel.vue src/components/AddObjectDrawer.vue
git commit -m "feat: add equals-filtered objects to canvas"
```

## Task 4: Search Around Adds Related Nodes And Edges

**Files:**
- Modify: `src/components/GraphCanvas.vue`
- Modify: `src/components/SearchAroundPanel.vue`
- Test: `npm run build`

- [ ] **Step 1: Make Search Around require a selected node**

In `GraphCanvas.vue`, replace `handleToolAction` with:

```ts
function handleToolAction(label: string) {
  if (label !== 'Search Around') {
    console.log('tool action', label)
    return
  }

  if (!selectedGraphNode.value) {
    isSearchAroundOpen.value = false
    console.log('search around requires selected node')
    return
  }

  searchAroundStartNodeId.value = selectedGraphNode.value.id
  searchAroundLinkType.value = null
  isSearchAroundOpen.value = true
}
```

Replace `searchAroundStartNode` with:

```ts
const searchAroundStartNode = computed(() => {
  return graphNodes.find((node) => node.id === searchAroundStartNodeId.value) ?? null
})
```

Replace `searchAroundSelectedObject` with:

```ts
const searchAroundSelectedObject = computed<SelectedObject | null>(() => {
  return searchAroundStartNode.value ? toSelectedObject(searchAroundStartNode.value) : null
})
```

- [ ] **Step 2: Add relationship helpers in `GraphCanvas.vue`**

Add:

```ts
function getRelatedInstances(startNode: GraphNodeData, linkType: LinkType) {
  if (startNode.objectTypeId === 'object_type_airport') {
    const airportCode = toDisplayString(startNode.instance.properties.airport)

    if (linkType.apiName === 'flightDestinationAirport') {
      return flightInstances.filter((flight) => toDisplayString(flight.properties.destinationAirportCode) === airportCode)
    }

    return flightInstances.filter((flight) => toDisplayString(flight.properties.originAirportCode) === airportCode)
  }

  const airportCode =
    linkType.apiName === 'flightDestinationAirport'
      ? startNode.instance.properties.destinationAirportCode
      : startNode.instance.properties.originAirportCode
  const airport = findAirportByCode(airportCode)

  return airport ? [airport] : []
}

function createRelationshipEdge(startNode: GraphNodeData, resultNode: GraphNodeData, linkType: LinkType): GraphEdgeData | null {
  const source = startNode.objectTypeId === linkType.sourceObjectTypeId ? startNode.id : resultNode.id
  const target = startNode.objectTypeId === linkType.targetObjectTypeId ? startNode.id : resultNode.id

  if (source === target) {
    return null
  }

  return {
    id: `${source}-${linkType.id}-${target}`,
    source,
    target,
    label: linkType.apiName === 'flightDestinationAirport' ? 'destination' : 'origin',
    linkTypeId: linkType.id
  }
}

function addEdgeIfMissing(edge: GraphEdgeData | null) {
  if (!edge) {
    return
  }

  if (graphEdges.some((existingEdge) => existingEdge.id === edge.id)) {
    return
  }

  graphEdges.push(edge)
}
```

- [ ] **Step 3: Add Search Around mutation handler**

Add:

```ts
function handleAddSearchAroundToGraph(payload: SearchAroundAddPayload) {
  const startNode = searchAroundStartNode.value

  if (!startNode) {
    console.log('search around add skipped: no start node')
    return
  }

  const resultInstances = payload.objectIds
    .map((objectId) => objectInstances.find((instance) => instance.id === objectId))
    .filter((instance): instance is ObjectInstance => instance !== undefined)

  resultInstances.forEach((instance, index) => {
    const resultNode = addNodeIfMissing(instance, index, startNode, resultInstances.length)
    addEdgeIfMissing(createRelationshipEdge(startNode, resultNode, payload.linkType))
  })

  if (resultInstances.length > 0) {
    selectedNodeId.value = startNode.id
  }

  console.log('add search around to graph', payload)
}
```

- [ ] **Step 4: Wire `SearchAroundPanel` in the template**

Replace the existing `SearchAroundPanel` block with:

```vue
<SearchAroundPanel
  v-if="isSearchAroundOpen && searchAroundStartNode && searchAroundSelectedObject"
  :selected-object="searchAroundSelectedObject"
  :starting-instance="searchAroundStartNode.instance"
  :starting-object-type-id="searchAroundStartNode.objectTypeId"
  :initial-link-type="searchAroundLinkType"
  @add-to-graph="handleAddSearchAroundToGraph"
  @close="isSearchAroundOpen = false"
  @click="handlePanelClick"
/>
```

- [ ] **Step 5: Update `SearchAroundPanel.vue` props and emits**

In `SearchAroundPanel.vue`, add `ObjectInstance` to the mock imports and replace the props and emits with:

```ts
const props = defineProps<{
  selectedObject: SelectedObject
  startingInstance: ObjectInstance
  startingObjectTypeId: string
  initialLinkType?: LinkType | null
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'addToGraph', payload: SearchAroundAddPayload): void
}>()
```

- [ ] **Step 6: Compute starting ids from `startingInstance`**

Replace `selectedAirportCode` and `selectedFlightId` with:

```ts
const selectedAirportCode = computed(() => {
  return toDisplayString(props.startingInstance.properties.airport)
})

const selectedFlightId = computed(() => {
  return toDisplayString(props.startingInstance.properties.flightId)
})
```

- [ ] **Step 7: Emit Add to graph from `SearchAroundPanel.vue`**

Replace `addToGraph` with:

```ts
function addToGraph() {
  if (!selectedLinkType.value) {
    console.log('add to graph skipped: no link selected')
    return
  }

  const payload: SearchAroundAddPayload = {
    linkType: selectedLinkType.value,
    objectIds: resultInstances.value.map((instance) => instance.id)
  }

  emit('addToGraph', payload)
  console.log('add to graph', payload)
}
```

- [ ] **Step 8: Fix context-menu Search Around path**

In `GraphCanvas.vue`, replace `openSearchAroundForObjectType` with:

```ts
function openSearchAroundForObjectType(option: { linkType: LinkType }) {
  searchAroundStartNodeId.value = objectTypeChooser.nodeId
  searchAroundLinkType.value = option.linkType
  isSearchAroundOpen.value = true
  nodeTool.open = false
  objectTypeChooser.open = false
  console.log('open search around relation', option.linkType.apiName)
}
```

This keeps the current context menu behavior but relies on the selected node id set by `handleNodeContextMenu`.

- [ ] **Step 9: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add src/components/GraphCanvas.vue src/components/SearchAroundPanel.vue
git commit -m "feat: add search around results to graph"
```

## Task 5: Remove Dead Graph Creation Code And Refine Empty UI

**Files:**
- Modify: `src/components/GraphCanvas.vue`
- Modify: `src/styles/global.css`
- Test: `npm run build`

- [ ] **Step 1: Remove unused full-graph creation functions**

In `GraphCanvas.vue`, delete the old functions if no references remain:

```ts
function createGraphNodes(): GraphNodeData[] {
  return objectInstances.map((instance, index) => {
    const airportCode = toDisplayString(instance.properties.airport)
    const flightId = toDisplayString(instance.properties.flightId)
    const fallbackPosition = { x: 50 + (index % 5) * 8, y: 30 + Math.floor(index / 5) * 12 }
    const position =
      instance.objectTypeId === 'object_type_airport'
        ? airportPositions[airportCode] ?? fallbackPosition
        : flightPositions[flightId] ?? fallbackPosition

    return {
      id: instance.id,
      label: getInstanceLabel(instance),
      type: instance.objectTypeId === 'object_type_airport' ? 'airport' : 'flight',
      objectTypeId: instance.objectTypeId,
      instance,
      x: position.x,
      y: position.y
    }
  })
}

function createGraphEdges(): GraphEdgeData[] {
  return flightInstances.flatMap((flight) => {
    const originAirport = findAirportByCode(flight.properties.originAirportCode)
    const destinationAirport = findAirportByCode(flight.properties.destinationAirportCode)
    const flightNumber = toDisplayString(flight.properties.flightNumber)
    const edges: GraphEdgeData[] = []

    if (originAirport) {
      edges.push({
        id: `${flight.id}-${flightOriginAirportLinkType.id}`,
        source: flight.id,
        target: originAirport.id,
        label: 'origin',
        linkTypeId: flightOriginAirportLinkType.id
      })
    }

    if (destinationAirport) {
      edges.push({
        id: `${flight.id}-${flightDestinationAirportLinkType.id}`,
        source: flight.id,
        target: destinationAirport.id,
        label: flightNumber ? `${flightNumber} destination` : 'destination',
        linkTypeId: flightDestinationAirportLinkType.id
      })
    }

    return edges
  })
}
```

Keep `flightDestinationAirportLinkType` and `flightOriginAirportLinkType` imports only if the file still uses them. If only `linkTypes` and `LinkType` are used, remove the two direct link type imports.

- [ ] **Step 2: Add empty preview text for Add Object**

In `AddObjectDrawer.vue`, inside `.add-object-preview__list`, after the `v-for` row block add:

```vue
<div v-if="previewInstances.length === 0" class="add-object-preview__empty">
  No matching objects
</div>
```

- [ ] **Step 3: Add CSS for add-object empty preview if missing**

In `src/styles/global.css`, near the Add Object styles, add:

```css
.add-object-preview__empty {
  padding: 16px 10px;
  color: var(--muted);
  font-size: 13px;
  text-align: center;
}
```

- [ ] **Step 4: Disable Search Around Add to graph when no relation is selected**

In `SearchAroundPanel.vue`, change the Add to graph button to:

```vue
<button type="button" :disabled="!selectedLinkType" @click="addToGraph">
  <Network :size="18" />
  <span>Add to graph</span>
</button>
```

In `src/styles/global.css`, near `.search-around-actions button:hover`, add:

```css
.search-around-actions button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.search-around-actions button:disabled:hover {
  background: #ffffff;
}
```

- [ ] **Step 5: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/GraphCanvas.vue src/components/AddObjectDrawer.vue src/components/SearchAroundPanel.vue src/styles/global.css
git commit -m "polish: refine graph empty states"
```

## Task 6: End-To-End Verification

**Files:**
- Read: `src/mock/mock.ts`
- Verify: browser or local dev server
- Test: `npm run build`

- [ ] **Step 1: Run production build**

Run:

```bash
npm run build
```

Expected: PASS with Vite build output and no TypeScript errors.

- [ ] **Step 2: Start local dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL, commonly `http://127.0.0.1:5173/`.

- [ ] **Step 3: Verify empty initial graph**

Open the local URL. Expected screen:

- TopBar and SheetBar are visible.
- Graph canvas has no nodes and no edges.
- Floating left panel, main toolbar, right panel, lower-left controls, and Series button are still visible.
- Selection tab shows `No object selected`.

- [ ] **Step 4: Verify Add Object with one airport**

In the UI:

1. Open `Layers`.
2. Click `Add object`.
3. Choose `[Example Data] Airport`.
4. Choose property `Airport`.
5. Keep operator `equals`.
6. Enter `SFO`.
7. Apply filter.
8. Click `Add to canvas`.

Expected:

- One SFO airport node appears.
- The node is selected.
- Selection tab shows SFO airport properties.
- Layer count for Airport is `1 nodes`.

- [ ] **Step 5: Verify Add Object with multiple airports**

In the UI:

1. Open `Layers -> Add object`.
2. Choose `[Example Data] Airport`.
3. Choose property `Airport State Code`.
4. Keep operator `equals`.
5. Enter `CA`.
6. Apply filter.
7. Click `Add to canvas`.

Expected:

- SFO remains single, not duplicated.
- LAX is added.
- Airport layer count is `2 nodes`.

- [ ] **Step 6: Verify Search Around from SFO**

In the UI:

1. Select the SFO node.
2. Click toolbar `Search Around`.
3. Choose `[Example Data] Flight Origin Airport`.
4. Open result preview.
5. Click `Add to graph`.

Expected:

- Flights whose `originAirportCode` is `SFO` are added.
- Edges appear between those flights and SFO.
- Repeating the same action does not duplicate nodes or edges.

- [ ] **Step 7: Verify Search Around from a flight**

In the UI:

1. Select a flight node such as `UA1175`.
2. Click toolbar `Search Around`.
3. Choose `[Example Data] Flight Destination Airport`.
4. Click `Add to graph`.

Expected:

- The destination airport for the selected flight is present on the canvas.
- The destination edge is present.
- Existing nodes are reused.

- [ ] **Step 8: Stop dev server**

If the dev server is running in the foreground, press `Ctrl-C`.

- [ ] **Step 9: Commit verification note if code changed during verification**

If verification required code fixes, commit those exact changed files:

```bash
git add src
git commit -m "fix: address graph interaction verification issues"
```

If no code changed during verification, do not create a commit.

## Self-Review

- Spec coverage: initial empty canvas is covered in Tasks 2 and 6; Equals Add Object is covered in Task 3; Search Around graph mutation is covered in Task 4; empty states and duplicate handling are covered in Tasks 3, 4, and 5; build/manual verification is covered in Task 6.
- Scope: this plan stays within the existing Vue prototype and does not add Cytoscape, routing, backend calls, persistence, or a global store.
- Type consistency: shared payloads are introduced in Task 1 and used by later tasks with the same names: `AddObjectPayload`, `EqualsFilterPayload`, `SearchAroundAddPayload`, `GraphNodeData`, `GraphEdgeData`, and `SelectedObject`.
