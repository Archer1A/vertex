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

const NODE_W = 420
const NODE_H = 96
const GAP_X = 84
const GAP_Y = 20
const PAD_X = 24
const PAD_Y = 24

const expandedByKey = ref<Record<string, boolean>>({})

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
  let row = 0

  function place(nodes: FlowNode[], prefix: string, depth: number) {
    nodes.forEach((node, idx) => {
      const key = prefix ? `${prefix}/${idx}` : `${idx}`
      const x = PAD_X + depth * (NODE_W + GAP_X)
      const y = PAD_Y + row * (NODE_H + GAP_Y)
      out.push({ key, node, x, y, depth })

      row += 1

      const hasChildren = (node.childrenFlow?.length ?? 0) > 0
      if (hasChildren && isExpanded(key)) {
        place(node.childrenFlow, key, depth + 1)
      }
    })
  }

  place(flowData, '', 0)
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
        :expanded="isExpanded(item.key)"
        @toggle="onToggle"
      />
    </div>
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

.flow-canvas__surface {
  position: absolute;
  inset: 0;
}
</style>
