# Time Series Properties + Series Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `timeseries` property type in `src/mock`, generate ProductionOrder daily planned/actual quantity series mock values per instance, and render them as an overlaid line chart in `LeftSelectionPanel` → `Series` for selected object instances.

**Architecture:** Extend mock schema (`PropertyType.baseType`, `PropertyValue`) to support `TimeSeriesValue`. When a graph node (object instance) is selected, `GraphCanvas` builds a `SelectedObject.timeSeries` payload for the panel. `LeftSelectionPanel` renders a lightweight SVG chart component with two series (planned vs actual).

**Tech Stack:** Vue 3 + Vite + TypeScript, existing mock data model, SVG (no new chart libraries).

---

## File Map (Create / Modify)

**Modify**
- `src/mock/types.ts` (add `timeseries` types + unions)
- `src/mock/production.ts` (add 2 property definitions + per-instance time series values)
- `src/types/graph.ts` (extend `SelectedObject` with `timeSeries`)
- `src/components/GraphCanvas.vue` (populate `SelectedObject.timeSeries`, hide timeseries from Properties list)
- `src/components/LeftSelectionPanel.vue` (Series tab: render chart)
- `package.json` (optional: add a test script)

**Create**
- `src/components/TimeSeriesChart.vue` (SVG chart)
- `scripts/timeseriesMock.test.mjs` (sanity test for mock structure)

---

### Task 1: Extend mock schema with `timeseries`

**Files:**
- Modify: `src/mock/types.ts`

- [ ] **Step 1: Add `TimeSeriesValue` types and extend unions**

In `src/mock/types.ts`, apply the following changes:

```ts
export interface PropertyType {
  // ...
  baseType:
    | 'string'
    | 'number'
    | 'integer'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'geopoint'
    | 'enum'
    | 'array'
    | 'struct'
    | 'timeseries'
  // ...
  timeSeries?: {
    granularity: 'day' | 'hour'
    valueBaseType: 'number' | 'integer'
    unit?: string
  }
}

export type TimeSeriesPoint = { ts: string; value: number | null }
export type TimeSeriesValue = {
  granularity: 'day' | 'hour'
  unit?: string
  points: TimeSeriesPoint[]
}

export type PropertyValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | { latitude: number; longitude: number }
  | TimeSeriesValue
  | null
```

- [ ] **Step 2: Typecheck (build) to ensure no TS errors**

Run: `npm run build`  
Expected: build succeeds (no TypeScript errors about `PropertyType['baseType']`).

---

### Task 2: Add ProductionOrder time series properties + mock values

**Files:**
- Modify: `src/mock/production.ts`

- [ ] **Step 1: Import `TimeSeriesValue` and add two new property definitions**

At top imports:

```ts
import { type ObjectType, type PropertyType, type ObjectInstance, type TimeSeriesValue } from './types'
```

Append to `productionOrderProperties`:

```ts
  {
    id: 'daily_planned_quantity',
    objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID,
    apiName: 'dailyPlannedQuantity',
    displayName: 'Daily Planned Quantity',
    description: '每日计划生产数量',
    baseType: 'timeseries',
    timeSeries: { granularity: 'day', valueBaseType: 'integer', unit: 'pcs' }
  },
  {
    id: 'daily_actual_quantity',
    objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID,
    apiName: 'dailyActualQuantity',
    displayName: 'Daily Actual Quantity',
    description: '每日实际生产数量',
    baseType: 'timeseries',
    timeSeries: { granularity: 'day', valueBaseType: 'integer', unit: 'pcs' }
  }
```

- [ ] **Step 2: Add a small helper to build daily series values**

Near the bottom of `src/mock/production.ts` (above `productionOrderInstances`), add:

```ts
function buildDailySeries(startDate: string, dailyValues: Array<number | null>, unit = 'pcs'): TimeSeriesValue {
  const start = new Date(`${startDate}T00:00:00Z`)
  const points = dailyValues.map((value, index) => {
    const dt = new Date(start)
    dt.setUTCDate(start.getUTCDate() + index)
    const ts = dt.toISOString().slice(0, 10)
    return { ts, value }
  })

  return { granularity: 'day', unit, points }
}
```

- [ ] **Step 3: Add per-instance `daily_planned_quantity` and `daily_actual_quantity` values**

Update each item in `productionOrderInstances` to include two keys (use property `id` keys to match existing mock style):

```ts
export const productionOrderInstances: ObjectInstance[] = [
  {
    id: 'inst_po_001',
    objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID,
    properties: {
      production_order_number: 'PO-2024-001',
      quantity: 50,
      planned_start_date: '2024-08-01',
      planned_end_date: '2024-09-15',
      status: '生产中',
      daily_planned_quantity: buildDailySeries('2024-08-01', [4, 4, 4, 4, 4, 0, 0, 5, 5, 5, 5, 5, 0, 0]),
      daily_actual_quantity: buildDailySeries('2024-08-01', [3, 4, 4, 3, 5, 0, 0, 4, 5, 5, 4, 5, 0, 0])
    }
  },
  // repeat for inst_po_002, inst_po_003 with different patterns
]
```

- [ ] **Step 4: Run the mock sanity test (added in Task 5)**

Run: `node scripts/timeseriesMock.test.mjs`  
Expected: exits with code 0.

---

### Task 3: Extend `SelectedObject` to carry time series payload

**Files:**
- Modify: `src/types/graph.ts`

- [ ] **Step 1: Add `SelectedObject.timeSeries`**

In `src/types/graph.ts`, extend `SelectedObject`:

```ts
  timeSeries?: Array<{
    apiName: string
    displayName: string
    unit?: string
    granularity: 'day' | 'hour'
    points: Array<{ ts: string; value: number | null }>
  }>
```

- [ ] **Step 2: Build to ensure types flow**

Run: `npm run build`  
Expected: no TypeScript errors.

---

### Task 4: Populate time series in GraphCanvas selection payload

**Files:**
- Modify: `src/components/GraphCanvas.vue`

- [ ] **Step 1: Import `TimeSeriesValue` type**

At the top (existing mock imports), include:

```ts
import type { TimeSeriesValue } from '../mock/mock'
```

- [ ] **Step 2: Add helpers to detect/extract `TimeSeriesValue`**

Inside `<script setup>` add:

```ts
function isTimeSeriesValue(value: unknown): value is TimeSeriesValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'granularity' in value &&
    'points' in value
  )
}

function getTimeSeriesForInstance(instance: ObjectInstance, objectTypeId: string): NonNullable<SelectedObject['timeSeries']> {
  const objectType = getObjectTypeById(objectTypeId)
  if (!objectType) return []

  return objectType.properties
    .filter((property) => property.baseType === 'timeseries')
    .map((property) => {
      const raw = instance.properties[property.apiName] ?? instance.properties[property.id]
      if (!isTimeSeriesValue(raw)) return null
      return {
        apiName: property.apiName,
        displayName: property.displayName,
        unit: raw.unit,
        granularity: raw.granularity,
        points: raw.points
      }
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
}
```

- [ ] **Step 3: Exclude timeseries properties from the Properties list for object instances**

In `toSelectedObject(node)` instance branch, change property mapping to:

```ts
  const properties =
    objectType?.properties
      .filter((property) => property.baseType !== 'timeseries')
      .map((property) => ({
        key: property.displayName,
        value: getInstancePropertyText(node.instance, property),
        apiName: property.apiName
      })) ?? []
```

And add `timeSeries` into the returned object:

```ts
  return {
    title: node.label,
    subtitle: objectType?.displayName ?? node.objectTypeId,
    nodeLabel: node.label,
    nodeKind: node.nodeKind,
    objectTypeId: node.objectTypeId,
    properties,
    timeSeries: getTimeSeriesForInstance(node.instance, node.objectTypeId),
    events
  }
```

- [ ] **Step 4: Build**

Run: `npm run build`  
Expected: build succeeds.

---

### Task 5: Render series as an overlaid line chart in LeftSelectionPanel

**Files:**
- Create: `src/components/TimeSeriesChart.vue`
- Modify: `src/components/LeftSelectionPanel.vue`
- Create: `scripts/timeseriesMock.test.mjs`
- Modify (optional): `package.json`

- [ ] **Step 1: Create `TimeSeriesChart.vue` (SVG, two+ lines)**

Create `src/components/TimeSeriesChart.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'

type Point = { ts: string; value: number | null }
type Series = { key: string; label: string; color: string; unit?: string; points: Point[] }

const props = defineProps<{
  series: Series[]
  height?: number
}>()

const height = computed(() => props.height ?? 160)
const width = 320
const padding = { top: 14, right: 12, bottom: 22, left: 34 }

const allValues = computed(() => {
  const values: number[] = []
  for (const s of props.series) {
    for (const p of s.points) {
      if (typeof p.value === 'number') values.push(p.value)
    }
  }
  return values
})

const domain = computed(() => {
  const values = allValues.value
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 1
  const span = max - min || 1
  const pad = span * 0.1
  return { min: min - pad, max: max + pad }
})

function xAt(index: number, count: number) {
  const innerW = width - padding.left - padding.right
  if (count <= 1) return padding.left + innerW / 2
  return padding.left + (innerW * index) / (count - 1)
}

function yAt(value: number) {
  const innerH = height.value - padding.top - padding.bottom
  const t = (value - domain.value.min) / (domain.value.max - domain.value.min || 1)
  return padding.top + (1 - t) * innerH
}

function pathFor(points: Point[]) {
  const cmds: string[] = []
  const count = points.length
  let started = false
  for (let i = 0; i < count; i++) {
    const v = points[i]?.value
    if (typeof v !== 'number') {
      started = false
      continue
    }
    const x = xAt(i, count)
    const y = yAt(v)
    if (!started) {
      cmds.push(`M ${x} ${y}`)
      started = true
    } else {
      cmds.push(`L ${x} ${y}`)
    }
  }
  return cmds.join(' ')
}

const xLabels = computed(() => {
  const firstSeries = props.series[0]
  if (!firstSeries || firstSeries.points.length < 2) return []
  const pts = firstSeries.points
  const first = pts[0]?.ts ?? ''
  const last = pts[pts.length - 1]?.ts ?? ''
  return [
    { x: padding.left, text: first },
    { x: width - padding.right, text: last }
  ]
})
</script>

<template>
  <div class="ts-chart">
    <div class="ts-chart__legend">
      <div v-for="s in series" :key="s.key" class="ts-chart__legend-item">
        <span class="ts-chart__swatch" :style="{ background: s.color }" />
        <span class="ts-chart__label">{{ s.label }}</span>
      </div>
    </div>
    <svg :viewBox="`0 0 ${width} ${height}`" class="ts-chart__svg" role="img" aria-label="Time series chart">
      <rect x="0" y="0" :width="width" :height="height" fill="transparent" />
      <g class="ts-chart__grid">
        <line :x1="padding.left" :x2="width - padding.right" :y1="height - padding.bottom" :y2="height - padding.bottom" />
        <line :x1="padding.left" :x2="padding.left" :y1="padding.top" :y2="height - padding.bottom" />
      </g>
      <g class="ts-chart__lines">
        <path
          v-for="s in series"
          :key="s.key"
          :d="pathFor(s.points)"
          :stroke="s.color"
          fill="none"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <g class="ts-chart__labels">
        <text v-for="l in xLabels" :key="l.text" :x="l.x" :y="height - 6" text-anchor="middle">{{ l.text }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.ts-chart {
  display: grid;
  gap: 8px;
}
.ts-chart__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
}
.ts-chart__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ts-chart__swatch {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.ts-chart__svg {
  width: 100%;
  height: auto;
  background: #ffffff;
  border: 1px solid #d9dde3;
  border-radius: 10px;
}
.ts-chart__grid line {
  stroke: #e6e9ee;
  stroke-width: 1;
}
.ts-chart__labels text {
  font-size: 10px;
  fill: #6b7280;
}
</style>
```

- [ ] **Step 2: Update `LeftSelectionPanel.vue` to render Series tab**

In `src/components/LeftSelectionPanel.vue`:

1) Import the chart:

```ts
import TimeSeriesChart from './TimeSeriesChart.vue'
```

2) Add computed series payload:

```ts
const timeSeriesRows = computed(() => props.selectedObject?.timeSeries ?? [])
const planned = computed(() => timeSeriesRows.value.find((row) => row.apiName === 'dailyPlannedQuantity'))
const actual = computed(() => timeSeriesRows.value.find((row) => row.apiName === 'dailyActualQuantity'))
const chartSeries = computed(() => {
  const series = []
  if (planned.value) {
    series.push({ key: planned.value.apiName, label: planned.value.displayName, color: '#2563eb', unit: planned.value.unit, points: planned.value.points })
  }
  if (actual.value) {
    series.push({ key: actual.value.apiName, label: actual.value.displayName, color: '#7c3aed', unit: actual.value.unit, points: actual.value.points })
  }
  return series
})
```

3) Replace the current `v-else` empty state with a dedicated Series branch:

```vue
<template v-else-if="activeSecondaryTab === 'Series'">
  <div v-if="chartSeries.length" class="series-panel">
    <div class="series-panel__title">Daily production</div>
    <TimeSeriesChart :series="chartSeries" :height="180" />
  </div>
  <div v-else class="selection-panel__empty">
    <div class="selection-panel__empty-title">Series</div>
    <div class="selection-panel__empty-copy">No series configured for this object.</div>
  </div>
</template>
```

4) Add minimal styles in the `<style scoped>` of `LeftSelectionPanel.vue`:

```css
.series-panel {
  padding: 12px 12px 16px;
  display: grid;
  gap: 10px;
}
.series-panel__title {
  font-size: 12px;
  color: #6b7280;
}
```

- [ ] **Step 3: Add mock sanity test script**

Create `scripts/timeseriesMock.test.mjs`:

```js
import { productionOrderInstances, getObjectTypeById, PRODUCTION_ORDER_OBJECT_TYPE_ID } from '../src/mock/mock.js'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const ot = getObjectTypeById(PRODUCTION_ORDER_OBJECT_TYPE_ID)
assert(ot, 'ProductionOrder ObjectType missing')

const tsProps = ot.properties.filter((p) => p.baseType === 'timeseries')
assert(tsProps.length >= 2, 'Expected >=2 timeseries properties on ProductionOrder')

for (const inst of productionOrderInstances) {
  const props = inst.properties ?? {}
  for (const p of tsProps) {
    const v = props[p.apiName] ?? props[p.id]
    assert(v && typeof v === 'object', `Missing timeseries value for ${inst.id}:${p.apiName}`)
    assert(Array.isArray(v.points), `Timeseries points missing for ${inst.id}:${p.apiName}`)
    assert(v.points.length > 0, `Timeseries points empty for ${inst.id}:${p.apiName}`)
  }
}

console.log('timeseriesMock.test: OK')
```

- [ ] **Step 4 (optional): Add package.json script**

In `package.json` scripts, add:

```json
"test:timeseries-mock": "node scripts/timeseriesMock.test.mjs"
```

- [ ] **Step 5: Verify**

Run:
- `node scripts/timeseriesMock.test.mjs` → expected `timeseriesMock.test: OK`
- `npm run build` → expected success

---

## Self-Review Checklist

- Spec coverage: mock schema, ProductionOrder properties + values, SelectedObject payload, Series chart UI.
- Placeholder scan: no TODO/TBD in this plan.
- Type consistency: property `apiName` matches UI lookup (`dailyPlannedQuantity`, `dailyActualQuantity`); instance values are stored under property id keys but extracted via `apiName` or `id`.

