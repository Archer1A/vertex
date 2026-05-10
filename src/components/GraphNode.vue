<script setup lang="ts">
import { AlertTriangle, Box, MapPin, Route } from 'lucide-vue-next'
import type { GraphNodeDisplayData } from '../types/graph'
import { computed } from 'vue'

const props = defineProps<{
  label: string
  nodeKind?: 'objectType' | 'objectInstance'
  nodeType?: 'airport' | 'flight' | 'event'
  displayData: GraphNodeDisplayData
  isSelected?: boolean
  isDragging?: boolean
  eventCount?: number
  eventBadgeColor?: string
}>()

const hasEventBadge = computed(() => {
  return (props.eventCount ?? 0) > 0
})

const hasMetrics = computed(() => props.displayData.metrics.length > 0)
const hasBadges = computed(() => props.displayData.badges.length > 0)
const hasSingleMetric = computed(() => props.displayData.metrics.length === 1)
const hasDoubleMetrics = computed(() => props.displayData.metrics.length === 2)

const nodeAriaLabel = computed(() => {
  const eventText = hasEventBadge.value ? `${props.eventCount} event alerts` : ''
  return [props.displayData.title, props.displayData.subtitle, eventText].filter(Boolean).join('. ')
})

const nodeStyle = computed(() => ({
  '--node-accent': props.displayData.accentColor
}))
</script>

<template>
  <button
    class="graph-node"
    :class="[
      `graph-node--${nodeType ?? 'airport'}`,
      {
        'graph-node--object-type': nodeKind === 'objectType',
        'graph-node--object-instance': nodeKind !== 'objectType',
        'graph-node--selected': isSelected,
        'graph-node--dragging': isDragging
      }
    ]"
    type="button"
    :aria-label="nodeAriaLabel"
    :style="nodeStyle"
  >
    <span class="graph-node__selection-bg" aria-hidden="true"></span>

    <span class="graph-node__surface">
      <span class="graph-node__header">
        <span class="graph-node__icon">
          <Box v-if="nodeKind === 'objectType'" :size="23" stroke-width="2.2" />
          <Route v-else-if="displayData.icon === 'flight' || nodeType === 'flight'" :size="23" stroke-width="2.2" />
          <AlertTriangle v-else-if="displayData.icon === 'event' || nodeType === 'event'" :size="23" stroke-width="2.2" />
          <MapPin v-else :size="23" stroke-width="2.2" />
          <span
            v-if="hasEventBadge"
            class="graph-node__event-badge"
            :title="`Events: ${eventCount}`"
            :style="eventBadgeColor ? { '--event-badge-color': eventBadgeColor } : undefined"
          >
            {{ eventCount }}
          </span>
        </span>
        <span class="graph-node__copy">
          <span class="graph-node__title" :title="displayData.title">{{ displayData.title }}</span>
          <span class="graph-node__subtitle" :title="displayData.subtitle">{{ displayData.subtitle }}</span>
          <span v-if="displayData.chips?.length" class="graph-node__chips" aria-label="Highlighted properties">
            <span
              v-for="chip in displayData.chips"
              :key="chip.key"
              class="graph-node__chip"
              :title="`${chip.key}: ${chip.value}`"
            >
              {{ chip.value }}
            </span>
          </span>
        </span>
      </span>

      <span
        v-if="hasMetrics"
        class="graph-node__metrics"
        :class="{
          'graph-node__metrics--single': hasSingleMetric,
          'graph-node__metrics--double': hasDoubleMetrics
        }"
        aria-label="Node metrics"
      >
        <span
          v-for="metric in displayData.metrics"
          :key="metric.label"
          class="graph-node__metric"
          :title="metric.title"
        >
          <span class="graph-node__metric-value">{{ metric.value }}</span>
          <span class="graph-node__metric-label">{{ metric.label }}</span>
        </span>
      </span>

      <span v-if="hasBadges" class="graph-node__badges" aria-label="Node badges">
        <span
          v-for="badge in displayData.badges"
          :key="`${badge.tone}-${badge.label}`"
          class="graph-node__badge"
          :class="`graph-node__badge--${badge.tone}`"
          :title="badge.title"
        >
          {{ badge.label }}
        </span>
      </span>
    </span>
  </button>
</template>
