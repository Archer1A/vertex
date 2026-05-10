<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = defineProps<{
  option: EChartsOption
  ariaLabel?: string
}>()

const rootEl = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

function ensureChart() {
  if (!rootEl.value) return
  if (chart) return
  chart = echarts.init(rootEl.value, undefined, { renderer: 'canvas' })
}

function applyOption(option: EChartsOption) {
  ensureChart()
  chart?.setOption(option, { notMerge: true, lazyUpdate: true })
}

function resize() {
  chart?.resize({ animation: { duration: 120 } })
}

onMounted(() => {
  ensureChart()
  applyOption(props.option)

  resizeObserver = new ResizeObserver(() => resize())
  if (rootEl.value) {
    resizeObserver.observe(rootEl.value)
  }

  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  resizeObserver?.disconnect()
  resizeObserver = null
  chart?.dispose()
  chart = null
})

watch(
  () => props.option,
  (next) => applyOption(next),
  { deep: true }
)
</script>

<template>
  <div ref="rootEl" class="echart-view" role="img" :aria-label="ariaLabel ?? 'Chart'"></div>
</template>

