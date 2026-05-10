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
}>()

const hasEventBadge = computed(() => {
  return props.nodeKind !== 'objectType' && (props.eventCount ?? 0) > 0
})
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
    :aria-label="displayData.title"
    :style="{ '--node-accent': displayData.accentColor }"
  >
    <span class="graph-node__selection-bg" aria-hidden="true"></span>

    <span class="graph-node__surface">
      <span class="graph-node__header">
        <span class="graph-node__icon">
          <Box v-if="nodeKind === 'objectType'" :size="25" stroke-width="2.2" />
          <Route v-else-if="displayData.icon === 'flight' || nodeType === 'flight'" :size="25" stroke-width="2.2" />
          <AlertTriangle v-else-if="displayData.icon === 'event' || nodeType === 'event'" :size="25" stroke-width="2.2" />
          <MapPin v-else :size="25" stroke-width="2.2" />
          <span v-if="hasEventBadge" class="graph-node__event-badge" :title="`Events: ${eventCount}`">
            {{ eventCount }}
          </span>
        </span>
        <span class="graph-node__copy">
          <span class="graph-node__title" :title="displayData.title">{{ displayData.title }}</span>
          <span class="graph-node__subtitle" :title="displayData.subtitle">{{ displayData.subtitle }}</span>
        </span>
      </span>

      <span class="graph-node__metrics">
        <span
          v-for="metric in displayData.metrics"
          :key="metric.label"
          class="graph-node__metric"
          :title="metric.title ?? `${metric.label}: ${metric.value}`"
        >
          <span class="graph-node__metric-value">{{ metric.value }}</span>
          <span class="graph-node__metric-label">{{ metric.label }}</span>
        </span>
      </span>

      <span class="graph-node__badges">
        <span
          v-for="badge in displayData.badges"
          :key="`${badge.label}-${badge.tone}`"
          class="graph-node__badge"
          :class="`graph-node__badge--${badge.tone}`"
          :title="badge.title ?? badge.label"
        >
          {{ badge.label }}
        </span>
      </span>
    </span>
  </button>
</template>
