# Rich Graph Node Design

## Context

The current graph prototype uses Vue 3, Vite, TypeScript, and DOM/CSS-rendered graph nodes in `GraphNode.vue`. The canvas already supports multiple node types, drag selection, event badges, relationship edges, and a floating selection panel. The next iteration should make canvas nodes look more like enterprise graph entity cards while preserving the current DOM-based architecture and leaving room for a future Cytoscape.js or G6 renderer.

## Goal

Upgrade the graph node visual style to the selected "Rich entity card" direction. Nodes should show more useful information at a glance without making the canvas feel like a full data table. The selected node should feel clearly active, polished, and consistent with the Palantir-style vertex detail page.

## Non-Goals

- Do not replace the canvas with Cytoscape.js, G6, Vue Flow, or another graph framework in this iteration.
- Do not add real backend data fetching.
- Do not change graph layout behavior, drag behavior, or edge relationship logic except where node dimensions require minor positioning safeguards.
- Do not add a tooltip dependency unless the native CSS approach proves insufficient.

## User-Visible Behavior

Each node becomes a compact entity card with:

- A colored object-type icon block: workstation purple, server blue, event red.
- A primary title line that truncates when long.
- A secondary object-type label.
- Three compact metric cells using properties already available on the node instance.
- A small status or classification badge row.
- A stronger selected state with blue border, soft halo, and elevated shadow.
- A dragging state that keeps the same card structure while raising opacity and shadow.

Long text remains single-line truncated by default. On hover, the full title and other truncated values are shown through lightweight tooltips. The first implementation can use native `title` attributes and optional CSS tooltip wrappers where the value is rendered in the DOM. This satisfies the hover requirement without adding framework overhead.

## Node Data Mapping

The visual card uses existing mock instance properties:

- Workstation nodes:
  - Title: node label.
  - Subtitle: `[Burn-in] Workstation`.
  - Metrics: active servers over rack capacity, measured temperature, related event count.
  - Badges: station status and burn-in profile or owner team.
- Server nodes:
  - Title: node label.
  - Subtitle: `[Burn-in] Server`.
  - Metrics: burn-in status, thermal margin, related failure event count.
  - Badges: server model, rack slot, quarantine state when true.
- Event nodes:
  - Title: node label.
  - Subtitle: `[Burn-in] Event`.
  - Metrics: severity, pass rate or duration, event status.
  - Badges: event type and associated server or workstation.
- ObjectType nodes:
  - Title: object type display name.
  - Subtitle: `ObjectType`.
  - Metrics: property count, status, linked object count when available.
  - Badges: api name and primary key marker.

Missing values render as a muted dash so card structure stays stable.

## Component Design

`GraphNode.vue` should remain the node rendering boundary. It should accept a richer display payload rather than deriving all card text from CSS classes. A small display model can be computed in `GraphCanvas.vue` because that file already knows object types, instances, and related event counts.

Recommended shape:

```ts
export interface GraphNodeDisplayData {
  title: string
  subtitle: string
  accentColor: string
  metrics: Array<{ label: string; value: string; title?: string }>
  badges: Array<{ label: string; tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral'; title?: string }>
}
```

`GraphCanvas.vue` passes `display-data` into `GraphNode`. The existing `label`, `node-type`, `is-selected`, `is-dragging`, and `event-count` props can remain during the transition, but new rendering should prefer `displayData`.

## Styling

The card should stay compact enough for graph density:

- Width around 230px for full card nodes.
- Fixed internal areas for header, metric grid, and badge row to avoid layout shifting.
- Border radius no more than 8px, matching the app's enterprise SaaS style.
- Background white with subtle border and shadow.
- Selected state uses a blue border and soft outer halo.
- Event count can move from a floating red circle into the metric area, while critical event nodes may still show a small top-right indicator.
- Text must use ellipsis, no wrapping in the title row, and no viewport-scaled font sizes.

## Framework Decision

Do not introduce a graph framework yet. This is a node visual upgrade and the current DOM/CSS implementation is the fastest, lowest-risk path. The design keeps a clean display-data boundary so a later Cytoscape.js, G6, or Vue Flow renderer can reuse the same display model.

For future work:

- Cytoscape.js is a good fit for algorithmic graph interaction and large graph performance.
- AntV G6 is a good fit if custom rich HTML-like node visuals become central.
- Vue Flow is a good fit if the product becomes more node-editor/workflow-oriented than graph-analysis-oriented.

## Testing And Verification

Verification should include:

- `npm run build`
- Existing node and graph behavior tests, if available.
- Browser visual check at desktop viewport.
- Hover check for long title display.
- Selection, dragging, canvas click, context menu, and Search Around still work.

The implementation should avoid touching unrelated dirty files and should keep `.superpowers/` brainstorm artifacts out of the commit.
