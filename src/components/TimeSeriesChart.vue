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
