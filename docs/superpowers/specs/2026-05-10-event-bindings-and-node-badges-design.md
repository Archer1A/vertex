# Event bindings + node event badge (mock / prototype)

## Goal

Add a special `Event` objectType to `src/mock` that can be *bound* to any other `ObjectType` instance via a lightweight binding table (no `linkTypes/linkInstances` needed). When an object instance node is added to the canvas, the UI checks whether it has bound events:

- If events exist: the node renders a right-top badge.
- On node click/selection: `LeftSelectionPanel` shows those events under the `Events` secondary tab.

This is a UI-prototype feature (no backend).

## Non-goals

- No Cytoscape integration.
- No event filtering/search.
- No bidirectional graph edges for events (events are not rendered as graph nodes in this iteration).
- No persistence beyond in-memory mock data.

## Data model (mock)

### 1) Event objectType and instances

Add `src/mock/events.ts`:

- `EVENT_OBJECT_TYPE_ID = 'object_type_event'`
- `eventObjectType: ObjectType` with `apiName: 'event'`
- `eventInstances: ObjectInstance[]`

Event properties include badge styling information:

- `badgeColor: string` (hex color string, e.g. `#dc2626`)

### 2) Bindings

In `src/mock/events.ts` add:

```ts
export type EventBinding = { objectInstanceId: string; eventId: string }
export const eventBindings: EventBinding[] = [...]
```

Bindings allow:

- any object instance → 0..n events
- an event → n object instances

### 3) Aggregation helpers

Also export helpers from `src/mock/events.ts`:

- `getEventsForObjectInstance(objectInstanceId: string): ObjectInstance[]`
- `getEventBadgeColor(event: ObjectInstance): string` (reads `properties.badgeColor`, fallbacks if missing)

### 4) Export surface

Update `src/mock/index.ts`:

- append `eventObjectType` to `objectTypes`
- append `eventInstances` to `objectInstances`
- re-export `eventBindings` and helper functions

## UI behavior

### 1) Badge visibility and color

Node-level rules:

- Only `objectInstance` nodes can show an event badge.
- Badge is shown when `eventCount > 0`.
- Badge content is `eventCount` (number).
- Badge color derives from the first bound event’s `badgeColor`.

### 2) `GraphCanvas` responsibilities

Update `src/components/GraphCanvas.vue`:

- When creating/adding object instance nodes, compute their bound events using `getEventsForObjectInstance(instance.id)`.
- Implement `getNodeEventCount(node)` using the bound events.
- Provide badge color via a new prop to `GraphNode` (e.g. `eventBadgeColor`).
- Extend `toSelectedObject(node)` so that for object instance nodes:
  - `SelectedObject.events` is populated from bound events, mapping event instance fields into panel cards.

### 3) `GraphNode` responsibilities

Update `src/components/GraphNode.vue`:

- Add optional prop: `eventBadgeColor?: string`
- Apply badge color via inline style variable (CSS var), with sensible defaults.

### 4) `LeftSelectionPanel` default tab

Update `src/components/LeftSelectionPanel.vue`:

- When `selectedObject` changes:
  - If `selectedObject.events?.length > 0`, default `activeSecondaryTab` to `Events`.
  - Else keep existing behavior (ObjectType → Instances, ObjectInstance → Properties).

## UX / styling notes

- Badge stays in the icon container’s top-right (existing `.graph-node__event-badge` positioning).
- Badge color uses `badgeColor` for background/border/text with small alpha adjustments to stay readable.

## Acceptance criteria

- `src/mock` contains an `Event` objectType + instances + bindings.
- Adding a node to the canvas that has bound events shows a badge at node icon top-right.
- Selecting that node shows the Events list in `LeftSelectionPanel` (and auto-switches to Events when events exist).
- Nodes with no events show no badge; Events tab shows empty state/count 0.

