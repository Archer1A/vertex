# Event Bindings + Node Badges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a special `Event` objectType in `src/mock` that can bind to any object instance via `eventBindings`; show an event-count badge (colored) on nodes with events, and render those events in `LeftSelectionPanel` when the node is selected.

**Architecture:** Keep mock events as `ObjectInstance` records plus a separate `eventBindings` table. In `GraphCanvas`, derive node event metadata (count + badge color) from bindings and project bound events into `SelectedObject.events`. `GraphNode` remains presentation-only and receives badge color via props.

**Tech Stack:** Vue 3 (Composition API), Vite, TypeScript, CSS (global stylesheet), Node-based script tests (optional)

---

## File Structure

- Create: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/mock/events.ts` — `Event` objectType + instances + bindings + helpers.
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/mock/index.ts` — include `Event` in `objectTypes/objectInstances` and re-export helpers.
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/types/graph.ts` — extend node and selection types for event badge color if needed.
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/components/GraphCanvas.vue` — compute node event metadata; populate `SelectedObject.events`.
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/components/GraphNode.vue` — accept `eventBadgeColor` and style badge.
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/components/LeftSelectionPanel.vue` — auto-switch to `Events` secondary tab when selected node has events.
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/styles/global.css` — make badge color configurable via CSS variables.
- (Optional) Create: `/Users/vicwong/go/src/github.com/Archer1A/vertex/scripts/eventBindings.test.mjs` — guard against regressions in wiring.
- (Optional) Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/package.json` — add `test:event-bindings` script entry.

---

### Task 1: Add Event mock data and bindings

**Files:**
- Create: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/mock/events.ts`
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/mock/index.ts`

- [ ] **Step 1: Create `src/mock/events.ts`**

Create the file with:

```ts
import type { ObjectInstance, ObjectType, PropertyType } from './types'

export const EVENT_OBJECT_TYPE_ID = 'object_type_event'

const eventProperties: PropertyType[] = [
  { id: 'event_id', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventId', displayName: 'Event ID', baseType: 'string', required: true, isPrimaryKey: true },
  { id: 'event_title', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventTitle', displayName: 'Event Title', baseType: 'string', required: true, isTitleKey: true, searchable: true },
  { id: 'event_type', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventType', displayName: 'Event Type', baseType: 'string' },
  { id: 'severity', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'severity', displayName: 'Severity', baseType: 'string' },
  { id: 'started_at', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'startedAt', displayName: 'Started At', baseType: 'datetime' },
  { id: 'summary', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'summary', displayName: 'Summary', baseType: 'string' },
  { id: 'badge_color', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'badgeColor', displayName: 'Badge Color', baseType: 'string' }
]

export const eventObjectType: ObjectType = {
  id: EVENT_OBJECT_TYPE_ID,
  apiName: 'event',
  displayName: 'Event',
  description: 'Special event object type bound to other objects (mock only).',
  icon: 'alertTriangle',
  color: '#dc2626',
  status: 'active',
  primaryKeyPropertyId: 'event_id',
  titlePropertyId: 'event_title',
  properties: eventProperties
}

export const eventInstances: ObjectInstance[] = [
  {
    id: 'evt_001',
    objectTypeId: EVENT_OBJECT_TYPE_ID,
    properties: {
      event_id: 'evt_001',
      event_title: 'Burn-in failed',
      event_type: 'Hardware Test',
      severity: 'Critical',
      started_at: '2026-05-10T09:12:00+08:00',
      summary: 'Burn-in test reported ECC threshold pressure during soak.',
      badge_color: '#dc2626'
    }
  },
  {
    id: 'evt_002',
    objectTypeId: EVENT_OBJECT_TYPE_ID,
    properties: {
      event_id: 'evt_002',
      event_title: 'Pass rate low',
      event_type: 'Yield',
      severity: 'Warning',
      started_at: '2026-05-10T10:03:00+08:00',
      summary: 'Workstation yield degraded below threshold.',
      badge_color: '#f59e0b'
    }
  }
]

export type EventBinding = { objectInstanceId: string; eventId: string }

export const eventBindings: EventBinding[] = [
  // Bind events to existing instances (ensure these ids exist in current mock datasets)
  { objectInstanceId: 'inst_sku_002', eventId: 'evt_001' },
  { objectInstanceId: 'inst_dem_003', eventId: 'evt_002' }
]

export function getEventsForObjectInstance(objectInstanceId: string): ObjectInstance[] {
  const boundEventIds = new Set(eventBindings.filter((b) => b.objectInstanceId === objectInstanceId).map((b) => b.eventId))
  return eventInstances.filter((event) => boundEventIds.has(event.id))
}

export function getEventBadgeColor(event: ObjectInstance): string {
  const value = event.properties?.badge_color
  return typeof value === 'string' && value.trim() ? value : '#dc2626'
}
```

- [ ] **Step 2: Wire events into `src/mock/index.ts`**

Update imports at the top:

```ts
import { eventObjectType, eventInstances, eventBindings, getEventsForObjectInstance, getEventBadgeColor } from './events'
```

Append to `objectTypes` array:

```ts
  eventObjectType,
```

Append to `objectInstances` array:

```ts
  ...eventInstances,
```

Re-export near other exports:

```ts
export * from './events'
export { eventBindings, getEventsForObjectInstance, getEventBadgeColor }
```

- [ ] **Step 3: Verify TypeScript build still succeeds**

Run:

```bash
npm run build
```

Expected: build completes without TS errors.

- [ ] **Step 4: Commit**

```bash
git add src/mock/events.ts src/mock/index.ts
git commit -m "feat(mock): add Event objectType + bindings"
```

---

### Task 2: Show event badge on nodes and expose events to selection panel

**Files:**
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/types/graph.ts`
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/components/GraphCanvas.vue`
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/components/GraphNode.vue`
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/styles/global.css`

- [ ] **Step 1: Extend `GraphNodeData` to carry event metadata**

In `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/types/graph.ts`, extend `GraphNodeData`:

```ts
export interface GraphNodeData {
  // ...
  eventIds?: string[]
}
```

- [ ] **Step 2: Compute node event ids when creating instance nodes**

In `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/components/GraphCanvas.vue`, update imports:

```ts
import { getEventsForObjectInstance, getEventBadgeColor } from '../mock/mock'
```

Add helper:

```ts
function getNodeEvents(node: GraphNodeData) {
  if (node.nodeKind === 'objectType') return []
  return getEventsForObjectInstance(node.id)
}
```

Update `createGraphNode(...)` return object to include `eventIds`:

```ts
  const events = getEventsForObjectInstance(instance.id)
  return {
    // existing fields...
    eventIds: events.map((event) => event.id)
  }
```

- [ ] **Step 3: Implement `getNodeEventCount` and badge color accessor**

Replace `getNodeEventCount`:

```ts
function getNodeEventCount(node: GraphNodeData) {
  if (node.nodeKind === 'objectType') return 0
  return node.eventIds?.length ?? getEventsForObjectInstance(node.id).length
}
```

Add:

```ts
function getNodeEventBadgeColor(node: GraphNodeData) {
  if (node.nodeKind === 'objectType') return undefined
  const events = getNodeEvents(node)
  return events.length ? getEventBadgeColor(events[0]) : undefined
}
```

Update the `GraphNode` usage to pass color:

```vue
:event-badge-color="getNodeEventBadgeColor(node)"
```

- [ ] **Step 4: Populate `SelectedObject.events` for selected instance nodes**

In `toSelectedObject(node)`, for the `objectInstance` path, compute events:

```ts
  const relatedEvents = getEventsForObjectInstance(node.id)
  const events: NonNullable<SelectedObject['events']> = relatedEvents.map((eventInstance) => {
    const title = String(eventInstance.properties?.event_title ?? eventInstance.id)
    const severity = String(eventInstance.properties?.severity ?? '')
    const subtitle = severity ? `Severity: ${severity}` : 'Event'

    const props = eventInstance.properties ?? {}
    const toValue = (value: unknown) => (value === null || value === undefined ? '' : String(value))

    return {
      id: eventInstance.id,
      title,
      subtitle,
      properties: [
        { key: 'Event Title', value: title },
        { key: 'Event Type', value: toValue(props.event_type) },
        { key: 'Severity', value: toValue(props.severity) },
        { key: 'Started At', value: toValue(props.started_at) },
        { key: 'Summary', value: toValue(props.summary) }
      ].filter((item) => item.value.trim() !== '')
    }
  })
```

Then return object instance selection object with `events`:

```ts
  return {
    // existing fields...
    properties,
    events
  }
```

- [ ] **Step 5: Accept badge color in `GraphNode.vue`**

In `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/components/GraphNode.vue` props, add:

```ts
  eventBadgeColor?: string
```

Update badge element to apply CSS var:

```vue
<span
  v-if="hasEventBadge"
  class="graph-node__event-badge"
  :title="`Events: ${eventCount}`"
  :style="eventBadgeColor ? { '--event-badge-color': eventBadgeColor } : undefined"
>
  {{ eventCount }}
</span>
```

- [ ] **Step 6: Make badge CSS color configurable**

In `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/styles/global.css`, update `.graph-node__event-badge` to use `--event-badge-color`:

```css
.graph-node__event-badge {
  --event-badge-color: #dc2626;
  border: 1px solid color-mix(in srgb, var(--event-badge-color) 26%, transparent);
  background: color-mix(in srgb, var(--event-badge-color) 12%, white);
  color: var(--event-badge-color);
  /* keep the rest of existing rules */
}
```

If `color-mix()` is undesirable for your target browsers, replace with inline alpha via `rgba()` and keep only `color` customizable.

- [ ] **Step 7: Verify in dev server**

Run:

```bash
npm run dev
```

Manual checks:
- Add `Server SKU` or `Material Demand` instances to the canvas so `inst_sku_002` / `inst_dem_003` appear.
- Confirm those nodes show a badge and the badge color matches the bound event’s `badge_color`.
- Click the node → left panel shows `Events` count > 0 and event cards render.

- [ ] **Step 8: Commit**

```bash
git add src/types/graph.ts src/components/GraphCanvas.vue src/components/GraphNode.vue src/styles/global.css
git commit -m "feat: node event badge + selection events"
```

---

### Task 3: Auto-switch LeftSelectionPanel to Events when events exist

**Files:**
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/components/LeftSelectionPanel.vue`

- [ ] **Step 1: Update selection watch behavior**

Find the watcher:

```ts
watch(
  () => props.selectedObject?.nodeLabel,
  () => {
    // ...
    activeSecondaryTab.value = isObjectTypeSelection.value ? 'Instances' : 'Properties'
    // ...
  }
)
```

Replace the secondary tab assignment with:

```ts
    const hasEvents = (props.selectedObject?.events?.length ?? 0) > 0
    if (hasEvents) {
      activeSecondaryTab.value = 'Events'
    } else {
      activeSecondaryTab.value = isObjectTypeSelection.value ? 'Instances' : 'Properties'
    }
```

- [ ] **Step 2: Verify behavior**

Manual checks:
- Click a node with events → secondary tab lands on `Events`.
- Click a node with no events → secondary tab lands on `Properties` (or `Instances` for objectType nodes).

- [ ] **Step 3: Commit**

```bash
git add src/components/LeftSelectionPanel.vue
git commit -m "feat: auto-switch selection panel to Events"
```

---

### (Optional) Task 4: Add a lightweight script test

**Files:**
- Create: `/Users/vicwong/go/src/github.com/Archer1A/vertex/scripts/eventBindings.test.mjs`
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/package.json`

- [ ] **Step 1: Create `scripts/eventBindings.test.mjs`**

```js
import fs from 'node:fs'
import assert from 'node:assert/strict'

const mockIndex = fs.readFileSync(new URL('../src/mock/index.ts', import.meta.url), 'utf8')
const graphCanvas = fs.readFileSync(new URL('../src/components/GraphCanvas.vue', import.meta.url), 'utf8')
const graphNode = fs.readFileSync(new URL('../src/components/GraphNode.vue', import.meta.url), 'utf8')
const leftPanel = fs.readFileSync(new URL('../src/components/LeftSelectionPanel.vue', import.meta.url), 'utf8')

assert.match(mockIndex, /eventObjectType/)
assert.match(mockIndex, /eventInstances/)
assert.match(mockIndex, /eventBindings/)
assert.match(graphCanvas, /getEventsForObjectInstance/)
assert.match(graphCanvas, /getNodeEventCount/)
assert.match(graphNode, /eventBadgeColor/)
assert.match(leftPanel, /activeSecondaryTab\.value = 'Events'/)

console.log('event bindings wiring tests passed')
```

- [ ] **Step 2: Add npm script**

In `/Users/vicwong/go/src/github.com/Archer1A/vertex/package.json` add:

```json
"test:event-bindings": "node scripts/eventBindings.test.mjs"
```

- [ ] **Step 3: Run**

```bash
npm run test:event-bindings
```

Expected: prints `event bindings wiring tests passed`.

- [ ] **Step 4: Commit**

```bash
git add scripts/eventBindings.test.mjs package.json
git commit -m "test: add event bindings wiring guard"
```

---

## Self-review checklist

- Spec coverage: `Event` objectType exists, bindings exist, badge uses event color, selection shows events, and default tab switches when events exist.
- Placeholder scan: no TODO/TBD.
- Type consistency: property keys use underscore keys in mock (`event_title`, `badge_color`, etc.) and mappings in `GraphCanvas` match those keys.

