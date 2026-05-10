# Sheet 2 Flow Canvas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Sheet 2 render an isolated Flow canvas that reads nodes from `src/mock/flow.ts` and expands `childrenFlow` on click, without affecting Sheet 1 canvas or node styles.

**Architecture:** Add `FlowCanvas.vue` + `FlowNode.vue` used only when the active sheet is Sheet 2. `FlowCanvas` computes a simple left-to-right layout for visible nodes and tracks expanded state by stable path keys (`0/2/1`). `FlowNode` uses an SVG polygon shape (no lines/edges between nodes).

**Tech Stack:** Vue 3 Composition API, TypeScript, Vite, SFC scoped CSS.

---

## File Structure (Lock-In)

- Create: `src/components/FlowCanvas.vue` — Sheet 2-only canvas, layout + expand/collapse logic.
- Create: `src/components/FlowNode.vue` — SVG polygon node visuals + click handling.
- Modify: `src/mock/flow.ts` — export `FlowNode` + `flowData`.
- Modify: `src/App.vue` — render `FlowCanvas` for Sheet 2; keep `GraphCanvas` for others; add `:key` isolation.

---

### Task 1: Export Flow Data From `flow.ts`

**Files:**
- Modify: `src/mock/flow.ts`

- [ ] **Step 1: Update the file to export types + data**

Replace the top portion with exported definitions and export the data:

```ts
// src/mock/flow.ts
// 定义单个节点的类型（递归）
export interface FlowNode {
  name: string
  relationObjectType: string[]
  childrenFlow: FlowNode[]
}

// TypeScript 对象
export const flowData: FlowNode[] = [
  // ... keep existing content exactly, just switch to single quotes if project uses it consistently
]
```

- [ ] **Step 2: Validate TypeScript build still succeeds**

Run: `npm run build`  
Expected: exit code 0

- [ ] **Step 3: Commit**

```bash
git add src/mock/flow.ts
git commit -m "feat: export flowData for sheet2"
```

---

### Task 2: Add `FlowNode.vue` (SVG Polygon Node)

**Files:**
- Create: `src/components/FlowNode.vue`

- [ ] **Step 1: Create the component**

```vue
<!-- src/components/FlowNode.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { FlowNode } from '../mock/flow'

const props = defineProps<{
  node: FlowNode
  nodeKey: string
  x: number
  y: number
  width?: number
  height?: number
  expanded?: boolean
}>()

const width = computed(() => props.width ?? 420)
const height = computed(() => props.height ?? 96)

const hasChildren = computed(() => (props.node.childrenFlow?.length ?? 0) > 0)

const points = computed(() => {
  // A chevron/hex polygon similar to reference SVG:
  // left bevel -> mid-left -> left bevel bottom -> right bevel bottom -> mid-right -> right bevel top
  const w = width.value
  const h = height.value
  const bevel = Math.round(h * 0.33) // ~ 32 when h=96
  const left = 0
  const right = w
  const top = 0
  const bottom = h
  const midY = Math.round(h / 2)

  return [
    `${left + bevel},${top}`,
    `${left + bevel * 1.6},${midY}`,
    `${left + bevel},${bottom}`,
    `${right - bevel},${bottom}`,
    `${right - bevel * 1.6},${midY}`,
    `${right - bevel},${top}`
  ].join(' ')
})

function onClick(e: MouseEvent) {
  e.stopPropagation()
  console.log('flow node clicked', props.nodeKey, props.node.name)
  // Let parent toggle expansion
  emit('toggle', props.nodeKey)
}

const emit = defineEmits<{
  (e: 'toggle', key: string): void
}>()
</script>

<template>
  <div class="flow-node" :style="{ transform: `translate(${x}px, ${y}px)` }">
    <button class="flow-node__hit" type="button" @click="onClick">
      <svg
        class="flow-node__svg"
        :width="width"
        :height="height"
        viewBox="0 0 420 96"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <polygon
          :points="points"
          class="flow-node__shape"
          stroke-linejoin="round"
        />
      </svg>
      <span class="flow-node__label" :title="node.name">{{ node.name }}</span>

      <span v-if="hasChildren" class="flow-node__badge" :class="{ 'flow-node__badge--open': expanded }">
        {{ expanded ? '−' : '+' }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.flow-node {
  position: absolute;
  left: 0;
  top: 0;
  width: 420px;
  height: 96px;
}

.flow-node__hit {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.flow-node__svg {
  display: block;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 1px 2px rgba(16, 24, 40, 0.12));
}

.flow-node__shape {
  fill: #f0f0f0;
  stroke: #111827;
  stroke-width: 2.6;
}

.flow-node__label {
  position: absolute;
  left: 36px;
  right: 44px;
  top: 50%;
  transform: translateY(-50%);
  font: 600 16px/1.2 Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  pointer-events: none;
}

.flow-node__badge {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #d9dde3;
  color: #111827;
  font: 700 14px/1 Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.10);
  pointer-events: none;
}

.flow-node__badge--open {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #3730a3;
}

.flow-node__hit:hover .flow-node__shape {
  fill: #f6f7fb;
}

.flow-node__hit:active .flow-node__svg {
  transform: translateY(1px);
}
</style>
```

- [ ] **Step 2: Manual check**

Run: `npm run dev` and open the app; no runtime errors in console.

- [ ] **Step 3: Commit**

```bash
git add src/components/FlowNode.vue
git commit -m "feat: add flow node svg polygon"
```

---

### Task 3: Add `FlowCanvas.vue` (Layout + Expand/Collapse)

**Files:**
- Create: `src/components/FlowCanvas.vue`

- [ ] **Step 1: Implement Flow canvas**

```vue
<!-- src/components/FlowCanvas.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import FlowNode from './FlowNode.vue'
import { flowData, type FlowNode as FlowNodeType } from '../mock/flow'

type VisibleNode = {
  key: string
  node: FlowNodeType
  depth: number
  parentKey: string | null
}

const expanded = ref<Set<string>>(new Set())

const colWidth = 520
const rowHeight = 120
const originX = 60
const originY = 40

function hasChildren(node: FlowNodeType) {
  return (node.childrenFlow?.length ?? 0) > 0
}

function toggle(key: string, node: FlowNodeType) {
  if (!hasChildren(node)) return
  const next = new Set(expanded.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expanded.value = next
  console.log('flow node toggle', key, node.name, next.has(key) ? 'open' : 'closed')
}

function buildVisibleNodes(): VisibleNode[] {
  const out: VisibleNode[] = []

  const walk = (nodes: FlowNodeType[], depth: number, parentKey: string | null, prefix: string) => {
    nodes.forEach((node, idx) => {
      const key = prefix === '' ? `${idx}` : `${prefix}/${idx}`
      out.push({ key, node, depth, parentKey })
      if (expanded.value.has(key) && hasChildren(node)) {
        walk(node.childrenFlow, depth + 1, key, key)
      }
    })
  }

  walk(flowData, 0, null, '')
  return out
}

const visibleNodes = computed(() => buildVisibleNodes())

const positionedNodes = computed(() => {
  const byDepth = new Map<number, VisibleNode[]>()
  for (const item of visibleNodes.value) {
    const bucket = byDepth.get(item.depth) ?? []
    bucket.push(item)
    byDepth.set(item.depth, bucket)
  }

  const positions = new Map<string, { x: number; y: number }>()
  for (const [depth, items] of byDepth.entries()) {
    items.forEach((item, rowIndex) => {
      positions.set(item.key, {
        x: originX + depth * colWidth,
        y: originY + rowIndex * rowHeight
      })
    })
  }

  return visibleNodes.value.map((item) => ({
    ...item,
    x: positions.get(item.key)?.x ?? 0,
    y: positions.get(item.key)?.y ?? 0
  }))
})

function onCanvasClick() {
  console.log('flow canvas clicked')
}
</script>

<template>
  <div class="flow-canvas" @click="onCanvasClick">
    <div class="flow-canvas__viewport">
      <FlowNode
        v-for="item in positionedNodes"
        :key="item.key"
        :node="item.node"
        :node-key="item.key"
        :x="item.x"
        :y="item.y"
        :expanded="expanded.has(item.key)"
        @toggle="toggle(item.key, item.node)"
      />
    </div>
  </div>
</template>

<style scoped>
.flow-canvas {
  height: calc(100vh - 66px);
  background: #f6f7f9;
  position: relative;
  overflow: hidden;
}

.flow-canvas__viewport {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
```

- [ ] **Step 2: Manual check**

Open Sheet 2; clicking a node with children expands children to the right. No edge lines exist.

- [ ] **Step 3: Commit**

```bash
git add src/components/FlowCanvas.vue
git commit -m "feat: add sheet2 flow canvas"
```

---

### Task 4: Switch `App.vue` Rendering For Sheet 2

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Conditionally render FlowCanvas for Sheet 2**

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import TopBar from './components/TopBar.vue'
import SheetBar from './components/SheetBar.vue'
import GraphCanvas from './components/GraphCanvas.vue'
import FlowCanvas from './components/FlowCanvas.vue'

const sheets = ref(['Sheet 1', 'Sheet 2'])
const activeSheet = ref('Sheet 1')

const activeSheetIndex = computed(() => sheets.value.indexOf(activeSheet.value))

const isFlowSheet = computed(() => activeSheet.value === 'Sheet 2')

function selectSheet(sheet: string) {
  activeSheet.value = sheet
}

function addSheet() {
  const sheetName = `Sheet ${sheets.value.length + 1}`
  sheets.value.push(sheetName)
  activeSheet.value = sheetName
  console.log('add sheet', sheetName)
}
</script>

<template>
  <TopBar />
  <SheetBar
    :sheets="sheets"
    :active-sheet="activeSheet"
    @select-sheet="selectSheet"
    @add-sheet="addSheet"
  />

  <FlowCanvas v-if="isFlowSheet" :key="`flow-${activeSheet}`" />
  <GraphCanvas v-else :key="`graph-${activeSheet}`" :active-sheet-index="activeSheetIndex" />
</template>
```

Notes:
- The `:key` ensures per-sheet isolation of component instance state.

- [ ] **Step 2: Validate build**

Run: `npm run build`  
Expected: exit code 0

- [ ] **Step 3: Commit**

```bash
git add src/App.vue
git commit -m "feat: render flow canvas on sheet2"
```

---

### Task 5: Final Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Typecheck + build**

Run: `npm run build`  
Expected: PASS

- [ ] **Step 2: Manual smoke**

Run: `npm run dev` and verify:
- Sheet 1: existing graph canvas unchanged
- Sheet 2: flow canvas visible with SVG polygon nodes, clicking expands children

