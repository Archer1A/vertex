<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import type { ChartMetric } from '../mock/mock'

type ChartOnlyMetric = Extract<ChartMetric, { type: 'pie' | 'bar' | 'line' }>

const props = defineProps<{
  metric: ChartOnlyMetric
}>()

const chartEl = ref<HTMLDivElement | null>(null)
let chart: ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const metricTag = computed(() => {
  if (props.metric.type === 'pie') return 'Pie'
  if (props.metric.type === 'bar') return 'Bar'
  return 'Line'
})

function baseOption(): EChartsOption {
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    animationDuration: 280,
    textStyle: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
  }
}

function buildOption(metric: ChartOnlyMetric): EChartsOption {
  if (metric.type === 'pie') {
    return {
      ...baseOption(),
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['38%', '72%'],
          center: ['50%', '52%'],
          padAngle: 1,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { color: '#475569', fontSize: 12, overflow: 'truncate' },
          labelLine: { length: 10, length2: 8 },
          data: metric.data.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: item.color ? { color: item.color } : undefined,
          })),
        },
      ],
    }
  }

  if (metric.type === 'bar') {
    return {
      ...baseOption(),
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 10, right: 10, top: 16, bottom: 20, containLabel: true },
      xAxis: {
        type: 'category',
        data: metric.categories,
        axisLabel: { color: '#64748b', fontSize: 11, interval: 0 },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#64748b', fontSize: 11 },
        splitLine: { lineStyle: { color: '#eef2f7' } },
      },
      series: metric.series.map((serie) => ({
        name: serie.name,
        type: 'bar',
        barMaxWidth: 26,
        data: serie.data,
        itemStyle: serie.color ? { color: serie.color } : undefined,
      })),
    }
  }

  return {
    ...baseOption(),
    tooltip: { trigger: 'axis' },
    grid: { left: 10, right: 10, top: 16, bottom: 20, containLabel: true },
    xAxis: {
      type: 'category',
      data: metric.categories,
      boundaryGap: false,
      axisLabel: { color: '#64748b', fontSize: 11, interval: 0 },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#64748b', fontSize: 11 },
      splitLine: { lineStyle: { color: '#eef2f7' } },
    },
    series: metric.series.map((serie) => ({
      name: serie.name,
      type: 'line',
      smooth: true,
      showSymbol: false,
      symbolSize: 6,
      lineStyle: { width: 2, color: serie.color },
      itemStyle: { color: serie.color },
      data: serie.data,
      areaStyle: serie.color ? { opacity: 0.08, color: serie.color } : undefined,
    })),
  }
}

async function ensureChart() {
  await nextTick()
  if (!chartEl.value) return
  if (!chart) {
    chart = echarts.init(chartEl.value, undefined, { renderer: 'canvas' })
  }
  chart.setOption(buildOption(props.metric), { notMerge: true, lazyUpdate: true })
}

function teardownChart() {
  resizeObserver?.disconnect()
  resizeObserver = null
  chart?.dispose()
  chart = null
}

onMounted(() => {
  ensureChart()

  if (chartEl.value) {
    resizeObserver = new ResizeObserver(() => {
      chart?.resize()
    })
    resizeObserver.observe(chartEl.value)
  }
})

onBeforeUnmount(() => {
  teardownChart()
})

watch(
  () => props.metric,
  () => {
    ensureChart()
  },
  { deep: true }
)
</script>

<template>
  <section class="metrics-widget metrics-widget--chart" :aria-label="metric.title">
    <header class="metrics-widget__header">
      <div class="metrics-widget__title" :title="metric.title">{{ metric.title }}</div>
      <div class="metrics-widget__tag">{{ metricTag }}</div>
    </header>
    <div class="metrics-widget__canvas">
      <div ref="chartEl" style="width: 100%; height: 100%"></div>
    </div>
  </section>
</template>

