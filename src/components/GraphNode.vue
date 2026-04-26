<script setup lang="ts">
import { MapPin, Route } from 'lucide-vue-next'

defineProps<{
  label: string
  nodeType?: 'airport' | 'flight'
  isSelected?: boolean
  isDragging?: boolean
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
    <span class="graph-node__icon">
      <Route v-if="nodeType === 'flight'" :size="28" stroke-width="2.2" />
      <MapPin v-else :size="28" stroke-width="2.2" />
    </span>
    <span class="graph-node__label">{{ label }}</span>
  </button>
</template>
