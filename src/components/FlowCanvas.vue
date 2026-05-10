<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import FlowNodeView from './FlowNode.vue'
import { flowData, type FlowNode } from '../mock/flow'

type PositionedFlowNode = {
  key: string
  node: FlowNode
  x: number
  y: number
  depth: number
  width: number
  height: number
  variant: 'root' | 'child'
  rootIndex: number
}

type Connector = {
  key: string
  path: string
  variant: 'main' | 'branch'
}

const MAX_ROOT_NODE_WIDTH = 176
const MIN_ROOT_NODE_WIDTH = 118
const ROOT_NODE_HEIGHT = 92
const CHILD_NODE_HEIGHT = 76
const CANVAS_PADDING_X = 48
const MIN_ROOT_GAP = 16
const MAX_ROOT_GAP = 72
const CHILD_STACK_GAP = 14
const CHILD_STACK_OFFSET = 78

const expandedByKey = ref<Record<string, boolean>>(createDefaultExpandedState())
const manualOffsetsByKey = ref<Record<string, { x: number; y: number }>>({})
const canvasRef = ref<HTMLDivElement | null>(null)
const canvasSize = ref({ width: 1440, height: 720 })
let resizeObserver: ResizeObserver | null = null

const keyToNode = computed(() => {
  const map = new Map<string, FlowNode>()

  function walk(nodes: FlowNode[], prefix: string) {
    nodes.forEach((node, idx) => {
      const key = prefix ? `${prefix}/${idx}` : `${idx}`
      map.set(key, node)
      if ((node.childrenFlow?.length ?? 0) > 0) walk(node.childrenFlow, key)
    })
  }

  walk(flowData, '')
  return map
})

const positioned = computed<PositionedFlowNode[]>(() => {
  const out: PositionedFlowNode[] = []
  const rootCount = flowData.length
  const canvasWidth = canvasSize.value.width
  const canvasHeight = canvasSize.value.height
  const availableWidth = Math.max(0, canvasWidth - CANVAS_PADDING_X * 2)
  const preferredGap = (availableWidth - MAX_ROOT_NODE_WIDTH * rootCount) / Math.max(rootCount - 1, 1)
  const rootGap = clamp(
    rootCount > 1 ? preferredGap : MAX_ROOT_GAP,
    MIN_ROOT_GAP,
    MAX_ROOT_GAP
  )
  const rootWidth = clamp(
    (availableWidth - rootGap * Math.max(rootCount - 1, 0)) / rootCount,
    MIN_ROOT_NODE_WIDTH,
    MAX_ROOT_NODE_WIDTH
  )
  const childWidth = clamp(rootWidth - 10, 112, 164)
  const totalRootWidth = rootWidth * rootCount + rootGap * Math.max(rootCount - 1, 0)
  const startX = Math.max(28, (canvasWidth - totalRootWidth) / 2)
  const rootY = clamp(canvasHeight * 0.28, 116, 188)

  flowData.forEach((node, idx) => {
    const key = `${idx}`
    const offset = manualOffsetsByKey.value[key] ?? { x: 0, y: 0 }
    const x = startX + idx * (rootWidth + rootGap) + offset.x
    const y = rootY + offset.y

    out.push({
      key,
      node,
      x,
      y,
      depth: 0,
      width: rootWidth,
      height: ROOT_NODE_HEIGHT,
      variant: 'root',
      rootIndex: idx
    })

    if (!isExpanded(key)) return

    node.childrenFlow.forEach((child, childIdx) => {
      const childKey = `${key}/${childIdx}`
      const childOffset = manualOffsetsByKey.value[childKey] ?? { x: 0, y: 0 }
      const childX = x + (rootWidth - childWidth) / 2 + childOffset.x
      const childY =
        y +
        ROOT_NODE_HEIGHT +
        CHILD_STACK_OFFSET +
        childIdx * (CHILD_NODE_HEIGHT + CHILD_STACK_GAP) +
        childOffset.y

      out.push({
        key: childKey,
        node: child,
        x: childX,
        y: childY,
        depth: 1,
        width: childWidth,
        height: CHILD_NODE_HEIGHT,
        variant: 'child',
        rootIndex: idx
      })
    })
  })

  return out
})

const connectors = computed<Connector[]>(() => {
  const byKey = new Map(positioned.value.map((item) => [item.key, item]))
  const out: Connector[] = []

  flowData.forEach((node, idx) => {
    const current = byKey.get(`${idx}`)
    const next = byKey.get(`${idx + 1}`)

    if (current && next) {
      const startX = current.x + current.width - 8
      const endX = next.x + 8
      const centerY = current.y + current.height / 2
      const midX = startX + (endX - startX) / 2

      out.push({
        key: `main-${idx}`,
        variant: 'main',
        path: `M ${startX} ${centerY} C ${midX} ${centerY}, ${midX} ${centerY}, ${endX} ${centerY}`
      })
    }

    if (!isExpanded(`${idx}`)) return

    node.childrenFlow.forEach((_, childIdx) => {
      const parent = byKey.get(`${idx}`)
      const child = byKey.get(`${idx}/${childIdx}`)
      if (!parent || !child) return

      const parentCenterX = parent.x + parent.width / 2
      const childCenterX = child.x + child.width / 2
      const parentBottomY = parent.y + parent.height - 4
      const childTopY = child.y + 4
      const bendY = parentBottomY + Math.min(42, (childTopY - parentBottomY) / 2)

      out.push({
        key: `branch-${idx}-${childIdx}`,
        variant: 'branch',
        path: `M ${parentCenterX} ${parentBottomY} L ${parentCenterX} ${bendY} L ${childCenterX} ${bendY} L ${childCenterX} ${childTopY}`
      })
    })
  })

  return out
})

onMounted(() => {
  if (!canvasRef.value) return

  resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry) return

    canvasSize.value = {
      width: entry.contentRect.width,
      height: entry.contentRect.height
    }
  })
  resizeObserver.observe(canvasRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

function createDefaultExpandedState() {
  const next: Record<string, boolean> = {}
  flowData.forEach((node, idx) => {
    if ((node.childrenFlow?.length ?? 0) > 0 && idx >= 1 && idx <= 4) {
      next[`${idx}`] = true
    }
  })
  return next
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function isExpanded(key: string) {
  return expandedByKey.value[key] ?? false
}

function setExpanded(key: string, open: boolean) {
  expandedByKey.value = { ...expandedByKey.value, [key]: open }
}

function onCanvasClick() {
  console.log('flow canvas clicked')
}

function onToggle(key: string) {
  const node = keyToNode.value.get(key)
  if (!node) return

  const hasChildren = (node.childrenFlow?.length ?? 0) > 0
  if (!hasChildren) return

  const open = !isExpanded(key)
  setExpanded(key, open)
  console.log('flow node toggle', key, node.name, open ? 'open' : 'closed')
}

function onMove(key: string, dx: number, dy: number) {
  const current = manualOffsetsByKey.value[key] ?? { x: 0, y: 0 }
  manualOffsetsByKey.value = {
    ...manualOffsetsByKey.value,
    [key]: {
      x: current.x + dx,
      y: current.y + dy
    }
  }
}

function printPositions() {
  const positions: Record<string, { x: number; y: number }> = {}
  positioned.value.forEach((item) => {
    positions[item.key] = { x: item.x, y: item.y }
  })
  console.log(JSON.stringify(positions, null, 2))
}
</script>

<template>
  <div ref="canvasRef" class="flow-canvas" @click="onCanvasClick">
    <div class="flow-canvas__chrome">
      <span class="flow-canvas__eyebrow">Flow Sheet</span>
      <strong>项目交付流程图</strong>
      <span>{{ positioned.length }} nodes · {{ connectors.length }} links</span>
    </div>

    <svg class="flow-canvas__links" :viewBox="`0 0 ${canvasSize.width} ${canvasSize.height}`">
      <path
        v-for="connector in connectors"
        :key="connector.key"
        class="flow-canvas__link"
        :class="`flow-canvas__link--${connector.variant}`"
        :d="connector.path"
      />
    </svg>

    <div class="flow-canvas__surface">
      <FlowNodeView
        v-for="item in positioned"
        :key="item.key"
        :node="item.node"
        :node-key="item.key"
        :x="item.x"
        :y="item.y"
        :width="item.width"
        :height="item.height"
        :depth="item.depth"
        :variant="item.variant"
        :expanded="isExpanded(item.key)"
        @toggle="onToggle"
        @move="onMove"
      />
    </div>

    <button class="flow-canvas__print-btn" type="button" @click.stop="printPositions">
      打印坐标
    </button>
  </div>
</template>

<style scoped>
.flow-canvas {
  position: relative;
  height: calc(100vh - 66px);
  width: 100%;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 34%, rgba(79, 70, 229, 0.08), transparent 28%),
    linear-gradient(rgba(148, 163, 184, 0.13) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.13) 1px, transparent 1px),
    #f6f8fb;
  background-size: auto, 28px 28px, 28px 28px, auto;
}

.flow-canvas__chrome {
  position: absolute;
  left: 18px;
  top: 14px;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
  padding: 0 13px;
  border: 1px solid rgba(203, 213, 225, 0.86);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
  color: #64748b;
  font: 500 12px/1 Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  backdrop-filter: blur(10px);
}

.flow-canvas__chrome strong {
  color: #1f2937;
  font-weight: 700;
}

.flow-canvas__eyebrow {
  color: #2563eb;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.flow-canvas__links {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.flow-canvas__link {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.flow-canvas__link--main {
  stroke: #94a3b8;
  stroke-width: 2;
}

.flow-canvas__link--branch {
  stroke: #a5b4fc;
  stroke-width: 1.6;
  stroke-dasharray: 5 5;
}

.flow-canvas__surface {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.flow-canvas__print-btn {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 10;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid #c7d2fe;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(30, 41, 59, 0.1);
  color: #3730a3;
  cursor: pointer;
  font: 700 12px/1 Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.flow-canvas__print-btn:hover {
  background: #eef2ff;
}
</style>
