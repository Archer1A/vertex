# Node Metrics Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a right-side node metrics workspace that opens on graph node double-click, shows metric cards and detail rows, and reveals a create metric form only after clicking the new metric card.

**Architecture:** `GraphCanvas.vue` owns the workspace open/close state and selected node context. A new `MetricsWorkspacePanel.vue` owns create-mode and form state, derives measure/dimension options from the current node's object type, and emits `close`. Styling is added to `src/styles/global.css` using the existing enterprise graph UI language.

**Tech Stack:** Vue 3 Composition API, TypeScript, Vite, lucide-vue-next, plain CSS.

---

## File Structure

- Create `src/components/MetricsWorkspacePanel.vue`
  - Renders the metrics workspace overlay content.
  - Owns local create-mode and form state.
  - Receives `GraphNodeData` and `ObjectType`.
  - Emits `close`.
- Modify `src/components/GraphCanvas.vue`
  - Imports and renders `MetricsWorkspacePanel`.
  - Adds `isMetricsWorkspaceOpen` and `metricsWorkspaceNodeId`.
  - Opens the workspace on node `dblclick`.
  - Closes on panel close and `Escape`.
- Modify `src/styles/global.css`
  - Adds styles for the right two-thirds overlay, metric cards, data table, and create form.
- Verify with `npm run build`.

---

### Task 1: Create Metrics Workspace Component

**Files:**
- Create: `src/components/MetricsWorkspacePanel.vue`

- [ ] **Step 1: Create the component file**

Use `apply_patch` to add `src/components/MetricsWorkspacePanel.vue` with this content:

```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  BadgeDollarSign,
  BarChart3,
  ChartArea,
  CirclePlus,
  Plus,
  Save,
  Table2,
  TrendingUp,
  X
} from 'lucide-vue-next'
import type { ObjectType, PropertyType } from '../mock/mock'
import type { GraphNodeData } from '../types/graph'

const props = defineProps<{
  node: GraphNodeData
  objectType: ObjectType
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

type MetricCard = {
  id: string
  title: string
  value: string
  delta: string
  chartType: 'line' | 'bar'
}

type DetailRow = {
  metricName: string
  date: string
  dimension: string
  value: string
  note: string
}

const metricCards: MetricCard[] = [
  { id: 'sales', title: '指标A：销售额', value: '¥128,000', delta: '↑ 12.5%', chartType: 'line' },
  { id: 'orders', title: '指标B：订单量', value: '2,381', delta: '↑ 8.2%', chartType: 'bar' },
  { id: 'conversion', title: '指标C：转化率', value: '3.42%', delta: '↑ 0.6%', chartType: 'line' }
]

const detailRows: DetailRow[] = [
  { metricName: '销售额', date: '2026-04-01', dimension: '华东', value: '¥32,000', note: '--' },
  { metricName: '销售额', date: '2026-04-02', dimension: '华北', value: '¥41,000', note: '--' },
  { metricName: '销售额', date: '2026-04-03', dimension: '华南', value: '¥55,000', note: '--' },
  { metricName: '订单量', date: '2026-04-01', dimension: 'App', value: '812', note: '--' },
  { metricName: '转化率', date: '2026-04-01', dimension: '官网', value: '3.42%', note: '--' }
]

const isCreateMode = ref(false)
const metricName = ref('')
const selectedMeasure = ref('')
const selectedDimension = ref('')
const aggregation = ref('sum')
const timeGrain = ref('day')
const sortOrder = ref('default')
const displayType = ref('line')

const measureOptions = computed(() => props.objectType.properties.filter((property) => property.baseType === 'number'))

const dimensionOptions = computed(() =>
  props.objectType.properties.filter((property) => {
    return ['string', 'enum', 'date', 'datetime'].includes(property.baseType)
  })
)

const headerTitle = computed(() => props.node.label)
const headerSubtitle = computed(() => props.objectType.displayName)

function openCreateMode() {
  isCreateMode.value = true
  selectedMeasure.value = measureOptions.value[0]?.apiName ?? ''
  selectedDimension.value = dimensionOptions.value[0]?.apiName ?? ''
  console.log('new metric clicked', props.node.id)
}

function cancelCreate() {
  isCreateMode.value = false
  console.log('cancel metric create')
}

function addCondition() {
  console.log('add metric condition')
}

function saveMetric() {
  const payload = {
    nodeId: props.node.id,
    objectTypeId: props.objectType.id,
    metricName: metricName.value,
    measure: selectedMeasure.value,
    dimension: selectedDimension.value,
    aggregation: aggregation.value,
    timeGrain: timeGrain.value,
    sortOrder: sortOrder.value,
    displayType: displayType.value
  }

  console.log('save metric', payload)
}

function propertyLabel(property: PropertyType) {
  return `${property.displayName} (${property.apiName})`
}

watch(
  () => props.node.id,
  () => {
    isCreateMode.value = false
    metricName.value = ''
    selectedMeasure.value = ''
    selectedDimension.value = ''
    aggregation.value = 'sum'
    timeGrain.value = 'day'
    sortOrder.value = 'default'
    displayType.value = 'line'
  }
)
</script>

<template>
  <aside class="metrics-workspace" aria-label="Node metrics workspace" @click.stop>
    <header class="metrics-workspace__header">
      <div class="metrics-workspace__title">
        <span class="metrics-workspace__badge">
          <TrendingUp :size="14" />
          Metrics
        </span>
        <div>
          <h2>{{ headerTitle }}</h2>
          <p>{{ headerSubtitle }}</p>
        </div>
      </div>
      <button class="metrics-workspace__close" type="button" aria-label="Close metrics workspace" @click="emit('close')">
        <X :size="16" />
      </button>
    </header>

    <div class="metrics-workspace__body" :class="{ 'metrics-workspace__body--create': isCreateMode }">
      <section class="metrics-workspace__content" aria-label="Metrics overview">
        <div class="metrics-cards" aria-label="Metric cards">
          <article v-for="card in metricCards" :key="card.id" class="metric-card">
            <div class="metric-card__header">
              <span>{{ card.title }}</span>
              <BadgeDollarSign v-if="card.id === 'sales'" :size="16" />
              <BarChart3 v-else :size="16" />
            </div>
            <strong>当前值：{{ card.value }}</strong>
            <small>环比：{{ card.delta }}</small>
            <div class="metric-card__chart" :class="`metric-card__chart--${card.chartType}`" aria-hidden="true">
              <svg v-if="card.chartType === 'line'" viewBox="0 0 160 56" preserveAspectRatio="none">
                <polyline points="4,44 28,22 54,34 82,16 112,30 154,10" />
              </svg>
              <span v-else v-for="height in [28, 44, 22, 36, 52, 30]" :key="height" :style="{ height: `${height}px` }"></span>
            </div>
            <span class="metric-card__caption">{{ card.chartType === 'line' ? '折线图预览' : '柱状图预览' }}</span>
          </article>

          <button class="metric-card metric-card--new" type="button" @click="openCreateMode">
            <Plus :size="28" />
            <strong>新增指标</strong>
            <span>点击后打开右侧创建指标面板</span>
          </button>
        </div>

        <div class="metrics-divider"></div>

        <section class="metrics-table-section" aria-label="Metric detail rows">
          <div class="metrics-table-section__title">
            <Table2 :size="16" />
            <h3>数据明细列表</h3>
          </div>

          <div class="metrics-table-wrap">
            <table class="metrics-table">
              <thead>
                <tr>
                  <th>指标名称</th>
                  <th>日期</th>
                  <th>维度</th>
                  <th>数值</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in detailRows" :key="`${row.metricName}-${row.date}-${row.dimension}`">
                  <td>{{ row.metricName }}</td>
                  <td>{{ row.date }}</td>
                  <td>{{ row.dimension }}</td>
                  <td>{{ row.value }}</td>
                  <td>{{ row.note }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="metrics-pagination" aria-label="Pagination">
            <button type="button">‹‹ 上一页</button>
            <button v-for="page in [1, 2, 3, 4, 5]" :key="page" type="button" :class="{ active: page === 1 }">
              {{ page }}
            </button>
            <button type="button">下一页 ››</button>
          </div>
        </section>
      </section>

      <aside v-if="isCreateMode" class="metric-create-panel" aria-label="Create metric">
        <header class="metric-create-panel__header">
          <ChartArea :size="18" />
          <h3>创建指标</h3>
        </header>

        <label class="metric-field">
          <span>指标名称：</span>
          <input v-model="metricName" type="text" placeholder="输入指标名称" />
        </label>

        <label class="metric-field">
          <span>度量：</span>
          <select v-model="selectedMeasure">
            <option value="" disabled>选择字段</option>
            <option v-for="property in measureOptions" :key="property.id" :value="property.apiName">
              {{ propertyLabel(property) }}
            </option>
          </select>
          <small>例如：销售额 / 订单数 / 用户数</small>
        </label>

        <label class="metric-field">
          <span>维度：</span>
          <select v-model="selectedDimension">
            <option value="" disabled>选择维度</option>
            <option v-for="property in dimensionOptions" :key="property.id" :value="property.apiName">
              {{ propertyLabel(property) }}
            </option>
          </select>
          <small>例如：日期 / 地区 / 渠道</small>
        </label>

        <label class="metric-field">
          <span>聚合方法：</span>
          <select v-model="aggregation">
            <option value="sum">求和</option>
            <option value="average">平均</option>
            <option value="max">最大</option>
            <option value="min">最小</option>
          </select>
          <small>可选：求和 / 平均 / 最大 / 最小</small>
        </label>

        <label class="metric-field">
          <span>时间粒度：</span>
          <select v-model="timeGrain">
            <option value="day">按天</option>
            <option value="week">按周</option>
            <option value="month">按月</option>
          </select>
          <small>可选：按天 / 按周 / 按月</small>
        </label>

        <div class="metric-field">
          <span>过滤条件：</span>
          <button class="metric-add-condition" type="button" @click="addCondition">
            <CirclePlus :size="16" />
            添加条件
          </button>
        </div>

        <label class="metric-field">
          <span>排序方式：</span>
          <select v-model="sortOrder">
            <option value="default">默认</option>
            <option value="ascending">升序</option>
            <option value="descending">降序</option>
          </select>
        </label>

        <fieldset class="metric-display-options">
          <legend>展示方式：</legend>
          <label><input v-model="displayType" type="radio" value="line" /> 折线图</label>
          <label><input v-model="displayType" type="radio" value="bar" /> 柱状图</label>
          <label><input v-model="displayType" type="radio" value="area" /> 面积图</label>
          <label><input v-model="displayType" type="radio" value="value" /> 数值卡</label>
        </fieldset>

        <footer class="metric-create-panel__actions">
          <button type="button" @click="cancelCreate">取消</button>
          <button class="metric-create-panel__save" type="button" @click="saveMetric">
            <Save :size="15" />
            保存指标
          </button>
        </footer>
      </aside>
    </div>
  </aside>
</template>
```

- [ ] **Step 2: Verify the component compiles in isolation after integration**

Do not run the build yet in this task because the component is not imported. Continue to Task 2, then run the build.

---

### Task 2: Wire Metrics Workspace Into GraphCanvas

**Files:**
- Modify: `src/components/GraphCanvas.vue`

- [ ] **Step 1: Update imports**

Change the Vue import:

```ts
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
```

Add the new component import near the other component imports:

```ts
import MetricsWorkspacePanel from './MetricsWorkspacePanel.vue'
```

- [ ] **Step 2: Add workspace state near the existing overlay state**

Add after the Search Around refs:

```ts
const isMetricsWorkspaceOpen = ref(false)
const metricsWorkspaceNodeId = ref('')
```

- [ ] **Step 3: Add computed values for the workspace node and object type**

Add after `searchAroundSelectedObject`:

```ts
const metricsWorkspaceNode = computed(() => {
  return graphNodes.find((node) => node.id === metricsWorkspaceNodeId.value) ?? null
})

const metricsWorkspaceObjectType = computed(() => {
  return metricsWorkspaceNode.value ? getObjectTypeById(metricsWorkspaceNode.value.objectTypeId) ?? null : null
})
```

- [ ] **Step 4: Add open/close and Escape handlers**

Add after `selectNode`:

```ts
function openMetricsWorkspace(nodeId: string) {
  const node = graphNodes.find((item) => item.id === nodeId)

  if (!node) {
    console.log('metrics workspace skipped: node not found', nodeId)
    return
  }

  selectedNodeId.value = nodeId
  selectedNodeIds.value = [nodeId]
  metricsWorkspaceNodeId.value = nodeId
  isMetricsWorkspaceOpen.value = true
  nodeTool.open = false
  objectTypeChooser.open = false

  console.log('open metrics workspace', nodeId)
}

function closeMetricsWorkspace() {
  isMetricsWorkspaceOpen.value = false
  metricsWorkspaceNodeId.value = ''
  console.log('close metrics workspace')
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isMetricsWorkspaceOpen.value) {
    closeMetricsWorkspace()
  }
}
```

- [ ] **Step 5: Add lifecycle listener cleanup**

Above the existing `onBeforeUnmount`, add:

```ts
onMounted(() => {
  document.addEventListener('keydown', handleDocumentKeydown)
})
```

Update the existing `onBeforeUnmount` block to include listener cleanup:

```ts
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleDocumentKeydown)
  dragState.dragging = false
  dragState.nodeId = ''
})
```

- [ ] **Step 6: Render the workspace overlay**

Add this block in the template after `SearchAroundPanel` and before `RightVerticalPanel`:

```vue
    <MetricsWorkspacePanel
      v-if="isMetricsWorkspaceOpen && metricsWorkspaceNode && metricsWorkspaceObjectType"
      :node="metricsWorkspaceNode"
      :object-type="metricsWorkspaceObjectType"
      @close="closeMetricsWorkspace"
      @click="handlePanelClick"
    />
```

- [ ] **Step 7: Open the workspace from node double-click**

Add this listener to the existing `GraphNode` in the `v-for`:

```vue
      @dblclick.stop="openMetricsWorkspace(node.id)"
```

Keep the existing pointer, click, and context menu listeners unchanged.

- [ ] **Step 8: Run build to catch TypeScript and template errors**

Run:

```bash
npm run build
```

Expected: build succeeds. If it fails, fix only errors related to `MetricsWorkspacePanel` import, props, or the new computed values.

---

### Task 3: Add Metrics Workspace Styling

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add workspace CSS before `.node-context-toolbar`**

Insert the following CSS before the existing `.node-context-toolbar` rule:

```css
.metrics-workspace {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 38;
  display: flex;
  flex-direction: column;
  width: 66.666%;
  min-width: 620px;
  overflow: hidden;
  border-left: 1px solid #d3d8df;
  background: #f7f9fc;
  box-shadow: -10px 0 28px rgba(15, 23, 42, 0.12);
}

.metrics-workspace__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid #d3d8df;
  background: #ffffff;
}

.metrics-workspace__title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.metrics-workspace__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 8px;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.metrics-workspace__header h2 {
  margin: 0;
  overflow: hidden;
  color: #1f2933;
  font-size: 15px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metrics-workspace__header p {
  margin: 3px 0 0;
  color: #6b7280;
  font-size: 12px;
}

.metrics-workspace__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
}

.metrics-workspace__close:hover {
  background: #f1f4f7;
}

.metrics-workspace__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-height: 0;
  flex: 1;
}

.metrics-workspace__body--create {
  grid-template-columns: minmax(360px, 1fr) 380px;
}

.metrics-workspace__content {
  min-width: 0;
  overflow: auto;
  padding: 18px;
}

.metrics-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(180px, 1fr));
  gap: 14px;
}

.metric-card {
  display: flex;
  flex-direction: column;
  min-height: 184px;
  padding: 14px;
  border: 1px solid #d9dde3;
  border-radius: 6px;
  background: #ffffff;
  color: #1f2933;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.metric-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #1f2933;
  font-size: 13px;
  font-weight: 700;
}

.metric-card strong {
  margin-top: 10px;
  font-size: 14px;
}

.metric-card small {
  margin-top: 6px;
  color: #15803d;
  font-size: 12px;
}

.metric-card__chart {
  display: flex;
  align-items: end;
  justify-content: center;
  height: 62px;
  margin-top: 12px;
  color: #2563eb;
}

.metric-card__chart svg {
  width: 100%;
  height: 100%;
}

.metric-card__chart polyline {
  fill: none;
  stroke: currentColor;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.metric-card__chart--bar {
  gap: 8px;
}

.metric-card__chart--bar span {
  width: 13px;
  border-radius: 2px 2px 0 0;
  background: #2563eb;
}

.metric-card__caption {
  margin-top: 8px;
  color: #6b7280;
  font-size: 12px;
  text-align: center;
}

.metric-card--new {
  align-items: center;
  justify-content: center;
  gap: 9px;
  border-style: dashed;
  color: #64748b;
  cursor: pointer;
}

.metric-card--new:hover {
  border-color: #93c5fd;
  background: #f8fbff;
  color: #1d4ed8;
}

.metric-card--new span {
  max-width: 180px;
  color: #6b7280;
  font-size: 12px;
  text-align: center;
}

.metrics-divider {
  height: 1px;
  margin: 20px 0 16px;
  background: #d9dde3;
}

.metrics-table-section__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.metrics-table-section__title h3 {
  margin: 0;
  color: #1f2933;
  font-size: 14px;
}

.metrics-table-wrap {
  overflow: auto;
  border: 1px solid #d9dde3;
  border-radius: 6px;
  background: #ffffff;
}

.metrics-table {
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
  font-size: 13px;
}

.metrics-table th,
.metrics-table td {
  height: 36px;
  padding: 0 12px;
  border-bottom: 1px solid #edf0f3;
  text-align: left;
  white-space: nowrap;
}

.metrics-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
}

.metrics-table td {
  color: #1f2933;
}

.metrics-table tbody tr:last-child td {
  border-bottom: 0;
}

.metrics-pagination {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  color: #64748b;
  font-size: 12px;
}

.metrics-pagination button {
  height: 28px;
  min-width: 28px;
  border: 1px solid #d9dde3;
  border-radius: 4px;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
}

.metrics-pagination button.active {
  border-color: #60a5fa;
  background: #eff6ff;
  color: #1d4ed8;
}

.metric-create-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  overflow: auto;
  border-left: 1px solid #d3d8df;
  background: #ffffff;
  padding: 16px;
}

.metric-create-panel__header {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  margin: -16px -16px 2px;
  padding: 0 16px;
  border-bottom: 1px solid #d9dde3;
}

.metric-create-panel__header h3 {
  margin: 0;
  color: #1f2933;
  font-size: 14px;
}

.metric-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #1f2933;
  font-size: 13px;
}

.metric-field input,
.metric-field select {
  width: 100%;
  height: 34px;
  padding: 0 9px;
  border: 1px solid #cfd6de;
  border-radius: 4px;
  background: #ffffff;
  color: #1f2933;
  font: inherit;
}

.metric-field small {
  color: #6b7280;
  font-size: 12px;
}

.metric-add-condition {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: fit-content;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #d9dde3;
  border-radius: 4px;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
  font-size: 12px;
}

.metric-add-condition:hover {
  background: #f8fafc;
}

.metric-display-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  margin: 0;
  padding: 0;
  border: 0;
  color: #1f2933;
  font-size: 13px;
}

.metric-display-options legend {
  grid-column: 1 / -1;
  margin-bottom: 2px;
  padding: 0;
}

.metric-display-options label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.metric-create-panel__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: auto;
  padding-top: 10px;
}

.metric-create-panel__actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid #d9dde3;
  border-radius: 4px;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
  font-size: 13px;
}

.metric-create-panel__actions .metric-create-panel__save {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
}

@media (max-width: 1100px) {
  .metrics-workspace {
    min-width: 0;
    width: 72%;
  }

  .metrics-workspace__body--create {
    grid-template-columns: minmax(280px, 1fr) 340px;
  }
}
```

- [ ] **Step 2: Run build after styles are added**

Run:

```bash
npm run build
```

Expected: build succeeds.

---

### Task 4: Verify Interaction Behavior

**Files:**
- Modify only if verification reveals a defect in:
  - `src/components/GraphCanvas.vue`
  - `src/components/MetricsWorkspacePanel.vue`
  - `src/styles/global.css`

- [ ] **Step 1: Run production build**

Run:

```bash
npm run build
```

Expected: `vue-tsc -b && vite build` exits with code 0.

- [ ] **Step 2: Run existing graph grouping test**

Run:

```bash
npm run test:graph-grouping
```

Expected: the graph grouping script exits with code 0.

- [ ] **Step 3: Start the dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 4: Manually verify the approved spec**

In the browser:

- Add at least one object to the empty canvas if the current sheet has no nodes.
- Double-click a graph node.
- Confirm the metrics workspace opens on the right side and occupies about two-thirds of the canvas.
- Confirm the left third of the graph remains visible.
- Confirm the workspace opens in overview mode and the create form is hidden.
- Click `新增指标`.
- Confirm the create form appears on the right side of the workspace.
- Confirm the measure select contains numeric properties from the selected node's object type.
- Confirm the dimension select contains string, enum, date, and datetime properties from the selected node's object type.
- Click `添加条件` and confirm a console log appears.
- Click `保存指标` and confirm the form payload is logged.
- Click `取消` and confirm create mode exits.
- Reopen create mode, press `Escape`, and confirm the entire workspace closes.
- Reopen the workspace, click exposed canvas space, and confirm the workspace remains open.

- [ ] **Step 5: Stop the dev server**

Use `Ctrl+C` in the running dev server session.

---

### Task 5: Final Review And Commit

**Files:**
- Review:
  - `src/components/MetricsWorkspacePanel.vue`
  - `src/components/GraphCanvas.vue`
  - `src/styles/global.css`
  - `docs/superpowers/plans/2026-04-27-node-metrics-workspace.md`

- [ ] **Step 1: Check changed files**

Run:

```bash
git status --short
```

Expected changed files include:

```text
 M src/components/GraphCanvas.vue
 M src/styles/global.css
?? src/components/MetricsWorkspacePanel.vue
?? docs/superpowers/plans/2026-04-27-node-metrics-workspace.md
```

The `.superpowers/` directory may appear because the visual companion was attempted during brainstorming. Do not add it to this feature commit.

- [ ] **Step 2: Inspect the diff**

Run:

```bash
git diff -- src/components/GraphCanvas.vue src/styles/global.css src/components/MetricsWorkspacePanel.vue
```

Expected:

- `GraphCanvas.vue` only adds metrics workspace state, computed values, handlers, lifecycle cleanup, component rendering, and node double-click wiring.
- `MetricsWorkspacePanel.vue` contains the new workspace UI and local form state.
- `global.css` only adds metrics workspace styles.

- [ ] **Step 3: Re-run verification commands**

Run:

```bash
npm run build
npm run test:graph-grouping
```

Expected: both commands exit with code 0.

- [ ] **Step 4: Commit implementation changes**

Run:

```bash
git add src/components/GraphCanvas.vue src/styles/global.css src/components/MetricsWorkspacePanel.vue docs/superpowers/plans/2026-04-27-node-metrics-workspace.md
git commit -m "feat: add node metrics workspace"
```

Expected: commit succeeds.

If the environment cannot write `.git/index.lock`, leave the working tree changes in place and report that the commit step was blocked by filesystem permissions.

---

## Self-Review

- Spec coverage: covered double-click open, right two-thirds overlay, default overview, delayed create form, object type-derived measure/dimension options, close button, Escape close, prototype-only save, fixed metric cards/detail rows, and preserving existing canvas behavior.
- Placeholder scan: no open implementation placeholders are included; all file paths, handlers, commands, and CSS selectors are explicit.
- Type consistency: `MetricsWorkspacePanel` props use `GraphNodeData` from `src/types/graph.ts` and `ObjectType` from `src/mock/mock.ts`; `GraphCanvas` already has access to `getObjectTypeById` and `graphNodes`.
