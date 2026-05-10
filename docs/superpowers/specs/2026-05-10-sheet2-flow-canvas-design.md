# Sheet 2 Flow Canvas (Isolated) — Design

## Goal

When the user clicks **Sheet 2**, show a **different canvas implementation** whose code + runtime behavior does **not** affect the existing **Sheet 1** graph canvas.

Sheet 2 canvas requirements:
- Node data source is `src/mock/flow.ts`
- Clicking a node toggles showing its `childrenFlow`
- Node UI style must be rewritten (new styles/classes) and must not affect Sheet 1 node styles
- Layout is left-to-right (Approach A): children appear to the **right** of their parent
- No need to keep existing floating panels/toolbar from the Graph canvas

Non-goals:
- No backend
- No Cytoscape integration yet
- No complex interactions (drag/zoom/pan) beyond click-to-expand

## Approach (Recommended)

Create a **separate canvas + node component pair** used only by Sheet 2:
- `src/components/FlowCanvas.vue`
- `src/components/FlowNode.vue`

And switch rendering from `App.vue`:
- Sheet 1 (and other sheets) keep using the existing `GraphCanvas.vue`
- Sheet 2 renders `FlowCanvas.vue`

Isolation strategy:
- Do not edit `GraphCanvas.vue` behavior for Sheet 2
- Do not edit `GraphNode.vue` styles
- Sheet 2 node styles use a brand-new class namespace (e.g. `.flow-node-*`) and/or `<style scoped>`

## Data Contract

Update `src/mock/flow.ts` to export:
- `export interface FlowNode`
- `export const flowData: FlowNode[]`

Type:
```ts
export interface FlowNode {
  name: string
  relationObjectType: string[]
  childrenFlow: FlowNode[]
}
```

## Rendering Model

### Visible Nodes

`FlowCanvas` keeps a set of expanded node keys:
- `expanded: Set<string>`

When rendering:
- All root nodes are always visible
- For each visible node:
  - If expanded and has `childrenFlow`, render children in the next column

Node identity:
- Use a stable string key built from path indices (e.g. `0`, `0/2`, `0/2/1`) so expansion state is deterministic.

### Layout (Left-to-Right)

Compute positions in a simple grid:
- `col = depth`
- `row = incremental index within that column` (top-to-bottom)

Constants:
- `colWidth` ~ 240px
- `rowHeight` ~ 92px
- `originX` ~ 60px
- `originY` ~ 40px

Algorithm outline:
1. Traverse visible nodes and group them by `depth`
2. Assign `x = originX + depth * colWidth`
3. Assign `y = originY + rowIndex * rowHeight`

### Edges

Do **not** render any parent → child edges/lines in the first version.

## UI & Styling (Sheet 2 Only)

`FlowNode` style goals (new style system, no impact on Sheet 1):
- Card-like node with subtle shadow and border
- Use an **SVG polygon node** (a “chevron/hex” shape) as the primary container, based on this reference:
  - `polygon` with 6 points (left tip → mid → bottom-left → bottom-right → mid-right → top-right)
  - light fill + dark stroke
  - centered text showing `node.name`
- Nodes with children show an expand affordance (e.g. a small badge or caret) but keep it subtle and fully isolated to `.flow-*` styles.

All CSS uses `.flow-*` prefixes and/or `<style scoped>`.

## Events / Logging

- Clicking blank canvas: `console.log('flow canvas clicked')`
- Clicking node: `console.log('flow node clicked', key, node.name)`
- Toggle expand:
  - If has children: expands/collapses and logs the action

## Files To Change / Add

Add:
- `src/components/FlowCanvas.vue`
- `src/components/FlowNode.vue`

Update:
- `src/App.vue` (switch Sheet 2 to `FlowCanvas`)
- `src/mock/flow.ts` (export `flowData` + `FlowNode` type)

## Acceptance Criteria

- Clicking **Sheet 2** shows a different canvas implementation than Sheet 1
- Interacting with Sheet 2 nodes (expand/collapse) does not affect Sheet 1 canvas nodes/state/styles
- Flow nodes render from `src/mock/flow.ts`
- Clicking a node with children shows its children to the right
- Flow node styles are visibly different from Sheet 1 node styles
