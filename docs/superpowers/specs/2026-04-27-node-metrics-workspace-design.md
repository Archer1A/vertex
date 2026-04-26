# Node Metrics Workspace Design

## Context

The current Vue 3 + Vite + TypeScript graph prototype already renders a Palantir Graph / Vertex-style canvas with floating panels, draggable DOM graph nodes, Search Around, Add Object, and mock aviation object data.

This design adds a node-level metrics workspace. The workspace opens when the user double-clicks a graph node and slides in from the right side of the graph canvas. It is a UI prototype, not a real analytics engine.

## Goals

- Open a metrics workspace by double-clicking a node.
- Render the workspace inside `GraphCanvas` as an absolute-positioned overlay.
- Make the workspace occupy the right two-thirds of the graph canvas, leaving the left third of the graph visible.
- Default to a read-only metrics overview with metric cards, a "new metric" card, a data detail table, and pagination.
- Show the metric creation form only after the user clicks the "new metric" card.
- Use the double-clicked node as context for the workspace header and form field options.
- Generate metric and dimension select options from the current node's object type properties in `src/mock/mock.ts`.
- Keep metric cards and detail rows as fixed mock data for the first version.
- Preserve existing graph canvas behavior and floating UI; the workspace simply overlays whatever it covers.

## Non-Goals

- Do not persist created metrics.
- Do not add newly saved metrics to the card list.
- Do not connect to a backend.
- Do not install a charting library.
- Do not implement real metric calculations.
- Do not change sheet persistence or graph data ownership.
- Do not refactor `SearchAroundPanel` into a generic shell for this first version.

## Recommended Approach

Add a new `MetricsWorkspacePanel.vue` component and let `GraphCanvas.vue` own the open/close state.

`GraphCanvas` already owns graph node state, selected node state, object type lookup context, and other canvas overlays. Keeping the new workspace there avoids lifting node-specific data into `App.vue` and avoids a broad refactor of the existing Search Around panel. The new component can follow the same overlay pattern as `SearchAroundPanel`, while keeping its own local create-mode and form state.

## User Flow

### Open

The user double-clicks a graph node.

`GraphCanvas` selects that node, stores its id as the metrics workspace context, and opens `MetricsWorkspacePanel`.

The workspace appears on the right side of the canvas:

- `position: absolute`
- `top: 0`
- `right: 0`
- `bottom: 0`
- `width: 66.666%`
- z-index above existing toolbars and panels

Clicking the exposed left side of the canvas does not close the workspace.

### Default Metrics Overview

When opened, the workspace shows only the overview content:

- Header with the selected node title, object type subtitle, a small "Metrics" label, and a close button.
- Metric card grid with three fixed metric cards:
  - Sales amount
  - Order count
  - Conversion rate
- A fourth "new metric" card.
- Static mini chart previews inside the metric cards using CSS or inline SVG.
- A separator.
- A data detail table with fixed rows.
- A simple pagination row.

The create metric form is hidden in this default state.

### Enter Create Mode

The user clicks the "new metric" card.

The workspace switches to a two-column internal layout:

- Left content area keeps the metric cards and data detail table.
- Right create panel appears with a width around 360px to 400px.

The right create panel contains:

- Metric name input.
- Measure select.
- Dimension select.
- Aggregation method select.
- Time grain select.
- Filter condition section with an "add condition" button.
- Sort order select.
- Display type radio group:
  - Line chart
  - Bar chart
  - Area chart
  - Value card
- Cancel button.
- Save metric button.

Cancel exits create mode. Save logs the form payload and stays prototype-only.

### Close

The workspace closes when the user clicks the header close button or presses `Escape`.

For this first version, closing does not prompt for unsaved form data.

## Data Model

`GraphCanvas.vue` adds local state:

```ts
const isMetricsWorkspaceOpen = ref(false)
const metricsWorkspaceNodeId = ref('')
```

It derives the current workspace node from `graphNodes`, and the current object type from `getObjectTypeById(node.objectTypeId)`.

`MetricsWorkspacePanel.vue` receives:

```ts
interface Props {
  node: GraphNodeData
  objectType: ObjectType
}
```

The panel keeps local state:

```ts
const isCreateMode = ref(false)
const metricName = ref('')
const selectedMeasure = ref('')
const selectedDimension = ref('')
const aggregation = ref('sum')
const timeGrain = ref('day')
const sortOrder = ref('default')
const displayType = ref('line')
```

Measure options are generated from numeric properties first:

- `baseType === 'number'`

Dimension options are generated from categorical and time-like properties:

- `baseType === 'string'`
- `baseType === 'enum'`
- `baseType === 'date'`
- `baseType === 'datetime'`

If no measure or dimension options exist, the select renders a placeholder option and the form remains usable as a visual prototype.

## Component Responsibilities

### `GraphCanvas.vue`

- Own metrics workspace open/close state.
- Handle node double-click.
- Select the double-clicked node when opening the workspace.
- Resolve the current workspace node and object type.
- Render `MetricsWorkspacePanel` inside the canvas.
- Close the workspace on panel close event.
- Close the workspace on `Escape`, with cleanup on unmount.
- Preserve existing click, drag, context menu, Search Around, and Add Object behavior.

### `GraphNode.vue`

- Remains a presentational node component.
- Allows native `dblclick` to bubble to `GraphCanvas`.
- Keeps existing pointer, click, and context menu behavior.

### `MetricsWorkspacePanel.vue`

- Render the workspace header, overview content, metric cards, data table, pagination, and create form.
- Own create-mode and form state.
- Generate form select options from the provided object type.
- Stop click propagation so panel interactions do not clear canvas selection.
- Emit `close`.
- Log prototype actions:
  - new metric clicked
  - add condition clicked
  - cancel clicked
  - save metric clicked

## Error And Empty States

- If the double-clicked node cannot be found, the workspace does not open.
- If the current node's object type cannot be found, the workspace does not render.
- If no numeric properties exist, the measure select shows a placeholder.
- If no dimension properties exist, the dimension select shows a placeholder.
- Clicking inside the workspace does not trigger canvas deselection.
- Clicking the exposed canvas can still run existing canvas behavior, but it does not close the metrics workspace.

## Visual Style

The workspace should match the existing enterprise SaaS graph UI:

- White and very light gray surfaces.
- Border color aligned with `#d9dde3` / existing CSS variables.
- Main text in `#1f2933`.
- Secondary text in `#6b7280`.
- Blue for selected or primary actions.
- Compact spacing and typography.
- Card radius no larger than the current design language.
- Light shadows only where needed to separate the overlay from the canvas.

The panel should look like a serious node details workspace, not a marketing page or dashboard hero.

## Testing

Run:

```bash
npm run build
```

Manual verification:

- Double-clicking a graph node opens the metrics workspace on the right two-thirds of the canvas.
- The left third of the graph remains visible.
- The workspace opens in overview mode, without the create form.
- Clicking the "new metric" card opens the right-side create form.
- Measure options come from numeric properties on the selected node's object type.
- Dimension options come from string, enum, date, and datetime properties on the selected node's object type.
- Cancel exits create mode.
- Save logs the form payload.
- Add condition logs an action.
- Header close button closes the workspace.
- `Escape` closes the workspace.
- Clicking the exposed canvas does not close the workspace.
- Existing Search Around, node selection, node dragging, and canvas click behavior continue to work.

## Implementation Notes

Keep this version UI-first and prototype-oriented. The only dynamic relationship to graph data is the selected node context and object type-derived form options. Everything else in the metrics workspace can remain fixed mock content until real metric definitions and persistence are introduced.
