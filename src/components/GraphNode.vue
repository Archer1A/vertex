<script setup lang="ts">
import { AlertTriangle, MapPin, Route } from 'lucide-vue-next'

defineProps<{
  label: string
  nodeType?: 'airport' | 'flight' | 'event'
  isSelected?: boolean
  isDragging?: boolean
  eventCount?: number
}>()
</script>

<template>
  <button
    class="graph-node"
    :class="[
      `graph-node--${nodeType ?? 'airport'}`,
      {
        'graph-node--selected': isSelected,
        'graph-node--dragging': isDragging
      }
    ]"
    type="button"
    aria-label="Selected SFO airport node"
  >
    <span v-if="eventCount" class="graph-node__event-badge" :aria-label="`${eventCount} event`">
      <AlertTriangle :size="12" stroke-width="2.4" />
    </span>
    <span class="graph-node__icon">
      <Route v-if="nodeType === 'flight'" :size="28" stroke-width="2.2" />
      <AlertTriangle v-else-if="nodeType === 'event'" :size="28" stroke-width="2.2" />
      <MapPin v-else :size="28" stroke-width="2.2" />
    </span>
    <span class="graph-node__label">{{ label }}</span>
  </button>
</template>
