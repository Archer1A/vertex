<script setup lang="ts">
import { computed, ref } from 'vue'
import FlowNodeView from './FlowNode.vue'
import { flowData, type FlowNode } from '../mock/flow'

type PositionedFlowNode = {
  key: string
  node: FlowNode
  x: number
  y: number
  depth: number
}

const NODE_W = 200
const NODE_H = 120
const GAP_X = 56
const GAP_Y = 8
const PAD_X = 16
const PAD_Y = 8

const expandedByKey = ref<Record<string, boolean>>({})
const manualOffsetsByKey = ref<Record<string, { x: number; y: number }>>({})

function isExpanded(key: string) {
  return expandedByKey.value[key] ?? false
}

function setExpanded(key: string, open: boolean) {
  expandedByKey.value = { ...expandedByKey.value, [key]: open }
}

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

  function place(nodes: FlowNode[], prefix: string, depth: number, startX: number) {
    let col = 0
    nodes.forEach((node, idx) => {
      const key = prefix ? `${prefix}/${idx}` : `${idx}`
      const offset = manualOffsetsByKey.value[key] ?? { x: 0, y: 0 }
      const x = startX + col * (NODE_W + GAP_X) + offset.x
      const y = PAD_Y + depth * (NODE_H + GAP_Y) + offset.y
      out.push({ key, node, x, y, depth })

      col += 1

      const hasChildren = (node.childrenFlow?.length ?? 0) > 0
      if (hasChildren && isExpanded(key)) {
        place(node.childrenFlow, key, depth + 1, x)
      }
    })
  }

  place(flowData, '', 0, PAD_X)
  return out
})

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
  positioned.value.forEach((p) => {
    positions[p.key] = { x: p.x, y: p.y }
  })
  console.log(JSON.stringify(positions, null, 2))
}
</script>

<template>
  <div class="flow-canvas" @click="onCanvasClick">
    <div class="flow-canvas__surface">
      <FlowNodeView
        v-for="item in positioned"
        :key="item.key"
        :node="item.node"
        :nodeKey="item.key"
        :x="item.x"
        :y="item.y"
        :width="200"
        :height="120"
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
  background: #f6f7f9;
}

.flow-canvas__print-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  padding: 6px 12px;
  border: 1px solid #6366f1;
  border-radius: 6px;
  background: #eef2ff;
  font: 500 12px/1.2 Inter, sans-serif;
  color: #4338ca;
  cursor: pointer;
}

.flow-canvas__print-btn:hover {
  background: #e0e7ff;
}

.flow-canvas__surface {
  position: absolute;
  inset: 0;
}
</style>
