# MetricsPanel Add-Metric UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an “Add metric (+)” placeholder tile and a right-side “Create metric” form panel in `MetricsPanel.vue` for visual prototyping only.

**Architecture:** Keep all state local to `MetricsPanel.vue`. Reuse existing `global.css` classes (`metrics-widget--add`, `metrics-panel__create`, `metrics-create__*`) to match existing styling and minimize new CSS.

**Tech Stack:** Vue 3 Composition API + TypeScript, lucide-vue-next icons, existing global CSS.

---

## File Structure / Responsibilities

- Modify: `src/components/MetricsPanel.vue`
  - Append a trailing “Add metric” widget in the charts section.
  - Add UI state (`isCreateOpen`, `formState`) and render a right-side create panel.
  - Wire selects to mock `objectTypes` and property lists (visual-only; no real save).

- No new CSS files: reuse `src/styles/global.css` existing `metrics-create*` + `metrics-widget--add`.

---

### Task 1: Add Create Panel State + Layout Split

**Files:**
- Modify: `src/components/MetricsPanel.vue:1`

- [ ] **Step 1: Add state + handlers**

Add refs for:

```ts
const isCreateOpen = ref(false)
const formState = ref({
  chartType: 'bar',
  objectTypeId: props.objectType.id,
  propertyKey: '',
  dimensionKey: 'status',
  aggregation: 'sum',
})
```

Add handlers:

```ts
function openCreate() { console.log('metrics:add'); isCreateOpen.value = true }
function closeCreate() { console.log('metrics:create:close'); isCreateOpen.value = false }
function submitCreate() { console.log('metrics:create:submit', formState.value) }
```

- [ ] **Step 2: Wrap body with main + create panel**

Change the body to:
- `div.metrics-panel__body` with conditional `metrics-panel__body--create-open`
- `div.metrics-panel__main` wrapping existing cards+table
- `Transition name="metrics-create-slide"` rendering `aside.metrics-panel__create` when open.

Expected: UI displays a right-side panel when `isCreateOpen` is true.

---

### Task 2: Add the “+ Add metric” Placeholder Tile

**Files:**
- Modify: `src/components/MetricsPanel.vue:1`

- [ ] **Step 1: Append add widget**

In the charts widgets grid, append:

```vue
<section class="metrics-widget metrics-widget--add" @click="openCreate">
  <div class="metrics-widget-add__icon"><Plus :size="18" /></div>
  <div class="metrics-widget-add__title">Add metric</div>
  <div class="metrics-widget-add__hint">Create a new chart</div>
</section>
```

Expected: plus tile appears as the last widget and is clickable.

---

### Task 3: Build Visual-Only Form Fields

**Files:**
- Modify: `src/components/MetricsPanel.vue:1`

- [ ] **Step 1: Import `objectTypes`**

Use mock exports:
```ts
import { objectTypes } from '../mock/mock'
```

- [ ] **Step 2: Add select option lists**

Computed options:
- `selectedObjectType` from `formState.objectTypeId`
- `propertyOptions` from `selectedObjectType.properties`

Provide placeholder dimension options and aggregation options as arrays of `{ value, label }`.

- [ ] **Step 3: Render the form**

Inside `.metrics-panel__create` render fields:
- Chart type
- ObjectType
- Property
- Dimension
- Aggregation

Footer: Cancel + Add (Add just logs).

---

### Task 4: Verify Build

- [ ] **Step 1: Run typecheck+build**

Run: `npm run build`

Expected: PASS (no TS errors).

