<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FlowNode } from '../mock/flow'

const emit = defineEmits<{
  (e: 'toggle', key: string): void
  (e: 'move', key: string, dx: number, dy: number): void
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

const width = computed(() => props.width ?? 200)
const height = computed(() => props.height ?? 120)

const hasChildren = computed(() => (props.node.childrenFlow?.length ?? 0) > 0)
const buttonRef = ref<HTMLButtonElement | null>(null)
const isDragging = ref(false)
const didDrag = ref(false)

const points = computed(() => {
  return '80,20 100,60 80,100 160,100 180,60 160,20'
})

function onClick(e: MouseEvent) {
  e.stopPropagation()
  if (didDrag.value) {
    didDrag.value = false
    return
  }

  console.log('flow node clicked', props.nodeKey, props.node.name)
  emit('toggle', props.nodeKey)
}

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return

  e.stopPropagation()
  isDragging.value = true
  didDrag.value = false

  const start = {
    x: e.clientX,
    y: e.clientY
  }

  const move = (moveEvent: PointerEvent) => {
    if (!isDragging.value) return

    const dx = moveEvent.clientX - start.x
    const dy = moveEvent.clientY - start.y

    if (Math.abs(dx) + Math.abs(dy) < 2) return

    didDrag.value = true
    start.x = moveEvent.clientX
    start.y = moveEvent.clientY
    emit('move', props.nodeKey, dx, dy)
  }

  const up = () => {
    isDragging.value = false
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
  }

  buttonRef.value?.setPointerCapture(e.pointerId)
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}
</script>

<template>
  <div class="flow-node" :style="{ transform: `translate(${x}px, ${y}px)` }">
    <button
      ref="buttonRef"
      class="flow-node__hit"
      :class="{ 'flow-node__hit--dragging': isDragging }"
      type="button"
      @click="onClick"
      @pointerdown="onPointerDown"
    >
      <svg
        class="flow-node__svg"
        :width="width"
        :height="height"
        viewBox="0 0 200 120"
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
  width: 200px;
  height: 120px;
}

.flow-node__hit {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.flow-node__hit--dragging {
  cursor: grabbing;
}

.flow-node__svg {
  display: block;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 1px 2px rgba(16, 24, 40, 0.12));
}

.flow-node__shape {
  fill: none;
  stroke: #111111;
  stroke-width: 3;
}

.flow-node__label {
  position: absolute;
  left: 78px;
  width: 92px;
  top: 50%;
  transform: translateY(-50%);
  font: 600 13px/1.2 Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  pointer-events: none;
}

.flow-node__badge {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #d9dde3;
  color: #111827;
  font: 700 12px/1 Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
