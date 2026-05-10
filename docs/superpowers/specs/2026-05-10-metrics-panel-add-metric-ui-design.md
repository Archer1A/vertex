# MetricsPanel “Add Metric” UI (Prototype) — Design Spec

Date: 2026-05-10

## Context

The current `MetricsPanel.vue` shows:
- “Key metrics” cards (KPI-like tiles)
- Optional chart widgets (ECharts) for ObjectType view
- A data table section

We want a visual-only “create metric” interaction consistent with enterprise analytics UIs.

## Goals

- Add a final “empty metric” widget with a **+** affordance to the metrics area.
- Clicking it opens a right-side vertical **Create metric** form panel inside `MetricsPanel`.
- The form is **visual only**: no persistence, no real metric creation, no chart generation.
- Keep the existing layout and styling language; reuse existing CSS where possible.

## Non-goals

- No backend calls.
- No saving created metrics to any store.
- No actually adding a new card/chart after submit.
- No validation beyond basic disabled/placeholder states.

## UX / Behavior

### Entry point

- In the charts widgets region (under KPI cards), append one “Add metric” widget:
  - Dashed border
  - Centered icon **+**
  - Title “Add metric”
  - Hint “Create a new chart”
- Click behavior:
  - `console.log('metrics:add')`
  - Opens the create form panel (right side).

### Create panel

- The create panel slides in on the **right side** within the metrics panel.
- Layout becomes a two-column split:
  - Left: existing content (cards + charts + table)
  - Right: create form
- Close behavior:
  - Close button in the create panel header
  - “Cancel” button in the footer
  - Both close actions only toggle UI state.

### Form fields (visual-only)

All fields are selectable but do not affect other parts of the UI.

- Chart Type: select (`Card`, `Pie`, `Bar`, `Line`)
- ObjectType: select from mock `objectTypes`
- Property: select from the chosen ObjectType properties (fallback placeholder options if empty)
- Dimension: select (placeholder options such as `status`, `type`, `date`)
- Aggregation: select (`Sum`, `Avg`, `Min`, `Max`, `Count`)

Submit:
- “Add” button logs `console.log('metrics:create:submit', formState)` and closes (optional; acceptable either close or keep open—prototype choice).

## Component / Code Changes

### `src/components/MetricsPanel.vue`

- Add local UI state:
  - `isCreateOpen: Ref<boolean>`
  - `createFormState: Ref<{ chartType; objectTypeId; propertyKey; dimensionKey; aggregation }>`
- Add “Add metric” widget in the charts section.
  - Use the existing `.metrics-widget--add` styles already in `global.css`.
- Render create panel on the right when `isCreateOpen` is true.
  - Use existing classes already present in `global.css`:
    - `.metrics-panel__body--create-open`
    - `.metrics-panel__main`
    - `.metrics-panel__create`
    - `.metrics-create__*`
    - `.metrics-create-slide` transition

### Data sources

- Use mock exports for options:
  - `objectTypes` for ObjectType select.
  - `objectType.properties` for Property select options.

## Styling

- Reuse existing design tokens and classes from `src/styles/global.css`:
  - `.metrics-widget--add` for the “+” tile
  - `.metrics-panel__create` and `.metrics-create__*` for the right-side form UI
- Keep spacing consistent with existing metrics widgets (3-column grid).

## Acceptance Criteria

- The last widget in the metrics widgets region is an “Add metric” tile with a **+** icon.
- Clicking it opens a right-side create form panel without shifting the overall page layout.
- The form shows the required fields and is scrollable when needed.
- No real metric creation; clicks only log actions.
- `npm run build` passes.

