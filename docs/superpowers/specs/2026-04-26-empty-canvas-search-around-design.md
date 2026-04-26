# Empty Canvas Add Object And Search Around Design

## Context

The current Vue 3 + Vite + TypeScript prototype already contains the enterprise graph editor shell, including `GraphCanvas`, `LeftSelectionPanel`, `AddObjectDrawer`, `SearchAroundPanel`, graph nodes, edges, and mock aviation data in `src/mock/mock.ts`.

The current behavior loads all mock objects into the canvas by default. `Layer -> Add object` and `Search Around` have UI scaffolding, previews, and console logging, but they do not yet control the graph state in the canvas.

## Goals

- Start every sheet with an empty graph canvas.
- Let the user open `Layers -> Add object`, choose an object type, apply one `Equals` filter, preview matching objects, and add the matching objects to the canvas.
- Let the user select a canvas node, open `Search Around`, choose a relationship, preview related objects, and add those related objects and relationships to the canvas.
- Use the existing mock data from `src/mock/mock.ts`.
- Preserve the current Palantir Graph / Vertex-style layout, floating panels, toolbar, node dragging, and lightweight DOM/CSS graph rendering.

## Non-Goals

- Do not install or initialize Cytoscape.js.
- Do not implement a real backend or persistence.
- Do not implement advanced filter operators beyond `Equals`.
- Do not implement manual row selection inside Add Object results.
- Do not implement automatic graph layout beyond simple deterministic placement.
- Do not add authentication, routing, or sheet persistence.

## Recommended Approach

Use localized graph state in `GraphCanvas.vue`.

`GraphCanvas` owns the currently displayed nodes, edges, selected node id, node positions, and Search Around panel state. The existing child components stay mostly presentational: `AddObjectDrawer` emits selected object ids, and `SearchAroundPanel` emits related object ids and relationship metadata. This keeps the implementation scoped to the current prototype and avoids adding a store or pushing sheet-level graph state into `App.vue` before it is needed.

## User Flow

### Initial Canvas

When the page loads, the graph canvas is empty. The floating panels and controls remain visible. No node is selected.

The `Selection` tab shows an empty state such as "No object selected" instead of SFO airport properties. The `Layers` tab shows node groups with counts based on the current canvas, initially `0 nodes`.

### Add Object

The user opens `Layers -> Add object`.

The drawer lets the user choose an object type from the mock object types. The filter section supports one condition:

- Property: any filterable property for the chosen object type.
- Operator: `Equals`.
- Value: user-entered text, number, boolean value, date, or datetime text depending on the property type.

The preview shows matching mock object instances. Clicking `Add to canvas` emits the matching object ids to `GraphCanvas`.

`GraphCanvas` adds each matching object as a node if it is not already present. Duplicate object ids are skipped. Newly added nodes are placed near the center of the canvas with deterministic offsets so multiple added nodes do not fully overlap.

If no filter is applied, the preview and add action use all instances of the selected object type. If a filter matches no objects, the preview shows an empty state and adding changes nothing.

### Selection

Clicking a node selects it and updates the `Selection` tab with that object's title, subtitle, and property list.

Clicking empty canvas clears selection and hides transient node context menus. Dragging nodes continues to update their DOM/CSS positions.

### Search Around

The toolbar `Search Around` action is useful only when a node is selected. If no node is selected, it logs or presents an empty disabled state without selecting a default object.

When Search Around opens, it uses the selected node as the starting object. Available relationship choices come from `linkTypes` in `mock.ts` where the selected node's object type is the source or target.

For the current mock data:

- From an Airport node, `flightOriginAirport` finds flights whose `originAirportCode` equals the airport code.
- From an Airport node, `flightDestinationAirport` finds flights whose `destinationAirportCode` equals the airport code.
- From a Flight node, `flightOriginAirport` finds the origin airport.
- From a Flight node, `flightDestinationAirport` finds the destination airport.

The panel previews resulting objects. Clicking `Add to graph` adds the resulting objects as nodes and adds the relationship edges between the selected starting node and those result nodes.

Duplicate nodes and duplicate edges are skipped. Search Around does not remove existing nodes or edges.

## Data Model

`GraphCanvas.vue` keeps two local collections:

```ts
interface GraphNodeData {
  id: string
  label: string
  type: 'airport' | 'flight'
  objectTypeId: string
  instance: ObjectInstance
  x: number
  y: number
}

interface GraphEdgeData {
  id: string
  source: string
  target: string
  label: string
  linkTypeId: string
}
```

`graphNodes` starts as an empty array. `graphEdges` starts as an empty array and is updated only when relationships are added to the graph. Existing helper logic for labels, display strings, object type lookup, and airport/flight relationship resolution should be reused and tightened where needed.

## Component Responsibilities

### `GraphCanvas.vue`

- Owns graph nodes, graph edges, selected node id, panel state, and position helpers.
- Converts `ObjectInstance` records into `GraphNodeData`.
- Resolves mock relationships for Search Around.
- Handles node selection, drag, canvas click, and edge rendering.
- Passes current graph counts and selected object details to the left panel.

### `LeftSelectionPanel.vue`

- Shows `Layers`, `Selection`, and existing secondary tabs.
- Opens `AddObjectDrawer`.
- Emits `addToCanvas` payloads upward instead of only logging them.
- Shows an empty Selection state when no node is selected.

### `AddObjectDrawer.vue`

- Filters mock instances for the selected object type.
- Supports only `Equals`.
- Emits selected object type, matched object ids, and filter metadata.
- Keeps preview and count display.

### `SearchAroundPanel.vue`

- Receives the selected starting object instance or node context.
- Lets the user choose one available relationship.
- Computes and previews related mock objects.
- Emits an `addToGraph` payload containing result object ids and the chosen link type.

### `GraphNode.vue`

- Remains a lightweight visual node component with airport and flight variants.
- Keeps existing pointer and context menu events.

## Error And Empty States

- Empty initial graph: canvas remains blank with floating UI controls.
- No selected object: Selection tab shows an empty state; Search Around does not silently choose SFO.
- No Add Object matches: preview shows no matching objects; Add to canvas performs no mutation.
- Duplicate add: existing node ids and edge ids are skipped.
- Unsupported property value: display conversion falls back to an empty string.

## Testing

- Run `npm run build` to verify TypeScript and production build.
- Manually verify:
  - Initial graph has no nodes or edges.
  - Add Object with `Airport equals SFO` adds one SFO airport node.
  - Add Object with `Airport State Code equals CA` adds SFO and LAX.
  - Selecting SFO updates Selection properties.
  - Search Around from SFO via origin relation adds matching flights and edges.
  - Search Around from a flight adds its related airport.
  - Repeating the same Add Object or Search Around action does not create duplicate nodes or edges.

## Implementation Notes

Keep this version simple and prototype-oriented. The design should preserve the current enterprise SaaS styling and floating panel layout while making the graph interaction flow real enough to demonstrate object discovery and graph expansion from the mock data.
