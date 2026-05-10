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
  depth?: number
  variant?: 'root' | 'child'
  expanded?: boolean
}>()

const width = computed(() => props.width ?? 176)
const height = computed(() => props.height ?? 92)
const variant = computed(() => props.variant ?? 'root')
const hasChildren = computed(() => (props.node.childrenFlow?.length ?? 0) > 0)
const relationCount = computed(() => props.node.relationObjectType?.length ?? 0)
const childCount = computed(() => props.node.childrenFlow?.length ?? 0)
const buttonRef = ref<HTMLButtonElement | null>(null)
const isDragging = ref(false)
const didDrag = ref(false)

const stepLabel = computed(() => {
  const rootIndex = Number(props.nodeKey.split('/')[0]) + 1
  if (variant.value === 'child') return `S${rootIndex}.${Number(props.nodeKey.split('/')[1]) + 1}`
  return String(rootIndex).padStart(2, '0')
})

const nodeTone = computed(() => {
  if (props.node.name === '开始') {
    return {
      accent: '#059669',
      fill: '#ecfdf5',
      stroke: '#86efac',
      glow: 'rgba(5, 150, 105, 0.16)',
      text: '#064e3b'
    }
  }

  if (props.node.name === '结束') {
    return {
      accent: '#475569',
      fill: '#f8fafc',
      stroke: '#cbd5e1',
      glow: 'rgba(71, 85, 105, 0.16)',
      text: '#1e293b'
    }
  }

  if (variant.value === 'child') {
    return {
      accent: '#7c3aed',
      fill: '#f5f3ff',
      stroke: '#c4b5fd',
      glow: 'rgba(124, 58, 237, 0.16)',
      text: '#3b0764'
    }
  }

  return {
    accent: '#2563eb',
    fill: '#eff6ff',
    stroke: '#93c5fd',
    glow: 'rgba(37, 99, 235, 0.16)',
    text: '#1e3a8a'
  }
})

const nodeStyle = computed<Record<string, string>>(() => ({
  width: `${width.value}px`,
  height: `${height.value}px`,
  transform: `translate(${props.x}px, ${props.y}px)`,
  '--node-accent': nodeTone.value.accent,
  '--node-fill': nodeTone.value.fill,
  '--node-stroke': nodeTone.value.stroke,
  '--node-glow': nodeTone.value.glow,
  '--node-tone-text': nodeTone.value.text
}))

const relationSummary = computed(() => {
  if (relationCount.value === 0) return ''
  return `${relationCount.value} relation object${relationCount.value > 1 ? 's' : ''}`
})

const nodeAriaLabel = computed(() => {
  const expandHint = hasChildren.value ? 'Double click to expand or collapse.' : ''
  return [props.node.name, relationSummary.value, expandHint].filter(Boolean).join('. ')
})

function onClick(e: MouseEvent) {
  e.stopPropagation()
  if (didDrag.value) {
    didDrag.value = false
    return
  }

  console.log('flow node clicked', props.nodeKey, props.node.name)
}

function onDblClick(e: MouseEvent) {
  e.stopPropagation()
  if (!hasChildren.value) return

  console.log('flow node dblclick', props.nodeKey, props.node.name)
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
  <div
    class="flow-node"
    :class="[
      `flow-node--${variant}`,
      { 'flow-node--expanded': expanded, 'flow-node--has-children': hasChildren }
    ]"
    :style="nodeStyle"
  >
    <button
      ref="buttonRef"
      class="flow-node__hit"
      :class="{ 'flow-node__hit--dragging': isDragging }"
      type="button"
      :aria-label="nodeAriaLabel"
      @click="onClick"
      @dblclick="onDblClick"
      @pointerdown="onPointerDown"
    >
      <span class="flow-node__body">
        <span class="flow-node__topline">
          <span class="flow-node__index">{{ stepLabel }}</span>
          <span class="flow-node__type">{{ variant === 'root' ? 'Main step' : 'Sub flow' }}</span>
          <span v-if="hasChildren" class="flow-node__children">
            {{ expanded ? 'Open' : 'Closed' }} · {{ childCount }}
          </span>
        </span>

        <span class="flow-node__label" :title="node.name">{{ node.name }}</span>

        <span v-if="relationSummary" class="flow-node__meta">
          <span class="flow-node__dot" aria-hidden="true"></span>
          {{ relationSummary }}
        </span>
      </span>
    </button>
  </div>
</template>

<style scoped>
.flow-node {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
  filter: drop-shadow(0 14px 20px var(--node-glow));
}

.flow-node__hit {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: grab;
  outline: none;
  touch-action: none;
  user-select: none;
}

.flow-node__hit--dragging {
  cursor: grabbing;
}

.flow-node__hit:focus-visible .flow-node__body {
  box-shadow:
    0 0 0 3px rgba(37, 99, 235, 0.18),
    0 0 0 1px var(--node-accent),
    inset 0 0 0 1px rgba(255, 255, 255, 0.72);
}

.flow-node__body {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 13px 18px 13px 16px;
  border: 1px solid var(--node-stroke);
  border-left: 5px solid var(--node-accent);
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.58)),
    var(--node-fill);
  box-shadow:
    0 12px 28px rgba(15, 23, 42, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.68);
  overflow: hidden;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
}

.flow-node--root .flow-node__body {
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%);
  padding-right: 28px;
}

.flow-node--child .flow-node__body {
  border-radius: 14px;
  border-left-width: 4px;
}

.flow-node--expanded .flow-node__body {
  border-color: var(--node-accent);
}

.flow-node__hit:hover .flow-node__body {
  transform: translateY(-2px);
  box-shadow:
    0 16px 34px rgba(15, 23, 42, 0.12),
    inset 0 0 0 1px rgba(255, 255, 255, 0.78);
}

.flow-node__hit:active .flow-node__body {
  transform: translateY(0) scale(0.992);
}

.flow-node__topline {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: #64748b;
  font: 700 10px/1 Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.flow-node__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 20px;
  border-radius: 999px;
  background: var(--node-accent);
  color: #ffffff;
  font-variant-numeric: tabular-nums;
}

.flow-node__type {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flow-node__children {
  margin-left: auto;
  padding: 4px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--node-tone-text);
  white-space: nowrap;
}

.flow-node__label {
  display: block;
  overflow: hidden;
  color: #111827;
  font: 750 14px/1.25 Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flow-node--child .flow-node__label {
  font-size: 13px;
}

.flow-node__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  color: #64748b;
  font: 600 11px/1.2 Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flow-node__dot {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--node-accent);
  box-shadow: 0 0 0 3px var(--node-glow);
}

@media (prefers-reduced-motion: reduce) {
  .flow-node__body {
    transition: none;
  }
}
</style>
