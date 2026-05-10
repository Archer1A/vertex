<script setup lang="ts">
import { computed } from 'vue'
import type { FlowNode } from '../mock/flow'

const emit = defineEmits<{
  (e: 'toggle', key: string): void
}>()

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
  const w = width.value
  const h = height.value
  const bevel = Math.round(h * 0.33)
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
  emit('toggle', props.nodeKey)
}
</script>

<template>
  <div class="flow-node" :style="{ transform: `translate(${x}px, ${y}px)` }">
    <button class="flow-node__hit" type="button" @click="onClick">
      <svg
        class="flow-node__svg"
        :width="width"
        :height="height"
        :viewBox="`0 0 ${width} ${height}`"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <polygon :points="points" class="flow-node__shape" stroke-linejoin="round" />
      </svg>

      <span class="flow-node__label" :title="node.name">{{ node.name }}</span>

      <span
        v-if="hasChildren"
        class="flow-node__badge"
        :class="{ 'flow-node__badge--open': expanded }"
      >
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
