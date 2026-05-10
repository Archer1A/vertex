# Graph Node Compact UI (Remove Metrics/Badges)

Date: 2026-05-10  
Owner: Codex (paired with user)  
Status: Draft (awaiting user approval)

## Summary

The current graph node card UI (`GraphNode`) is visually too large for the canvas density we want. The user requests:

1) **Shrink the overall node card** (header/icon/padding/selection halo).  
2) **Remove** the node’s **Metrics** row (e.g., “Schema / Records / Links”).  
3) **Remove** the node’s bottom **Badges** row (e.g., “ObjectType / active / project”, and instance badges like “已交付 …”).

This spec targets the UI-only change and keeps data/behavior intact.

## Goals

- Node cards take up less space and feel closer to a dense “enterprise graph editor” canvas.
- `GraphNode` renders only: selection background + surface header (icon + title/subtitle) + optional event badge.
- No canvas layout changes outside of the node itself.

## Non-Goals

- No changes to graph data generation or node positioning logic.
- No Cytoscape integration work.
- No new interactions or state changes.

## Proposed Approach (A)

**Delete the Metrics and Badges DOM blocks from `GraphNode.vue`**, rather than hiding via CSS.

Rationale:
- Removes layout complexity and avoids hidden-but-still-present DOM affecting sizing/spacing.
- Prevents accidental future styling regressions from unused sections.

## UI Changes (Design Details)

### Structure

`GraphNode` template will contain:
- `.graph-node__selection-bg`
- `.graph-node__surface`
  - `.graph-node__header`
    - `.graph-node__icon` (keeps existing icon variants)
    - `.graph-node__copy`
      - `.graph-node__title`
      - `.graph-node__subtitle`
    - optional `.graph-node__event-badge` (existing behavior)

Removed sections:
- `.graph-node__metrics`
- `.graph-node__badges`

### Sizing (Initial Targets)

We will shrink via CSS in `src/styles/global.css`:
- Reduce `.graph-node__surface` width/min-height for both object instance and object type nodes.
- Reduce header padding + gap.
- Reduce icon size by ~4–8px (and radius proportionally).
- Adjust `.graph-node__selection-bg` inset/border-radius so the “halo” matches the smaller card.

Exact pixel values are intentionally iterative; we will tune in the browser after the first pass.

## Acceptance Criteria

- On `http://127.0.0.1:5173/`:
  - Node cards are visibly smaller than before.
  - “Schema / Records / Links” row is not rendered anywhere.
  - Bottom badges row is not rendered anywhere.
  - Clicking nodes/canvas continues to work (no runtime errors).
- No obvious layout breakage (title/subtitle still truncate nicely, selection halo still aligns).

## Implementation Notes

- Files expected to change:
  - `src/components/GraphNode.vue` (remove template sections)
  - `src/styles/global.css` (shrink card + adjust selection halo and header/icon sizing)
- Optional: remove now-unused CSS blocks for `.graph-node__metrics`, `.graph-node__badges`, and related selectors if they become dead code.

