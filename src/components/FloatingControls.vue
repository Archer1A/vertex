<script setup lang="ts">
import { Maximize2, Minus, Plus } from 'lucide-vue-next'

const emit = defineEmits<{
  canvasControl: [action: 'fit' | 'zoom-in' | 'zoom-out']
}>()

function handleAction(action: string) {
  console.log(action)
}

function triggerControl(action: 'fit' | 'zoom-in' | 'zoom-out') {
  handleAction(action)
  emit('canvasControl', action)
}
</script>

<template>
  <div class="floating-controls" aria-label="Canvas controls">
    <div class="floating-controls__group">
      <button aria-label="Fit view" @click="triggerControl('fit')">
        <Maximize2 :size="17" />
      </button>
    </div>
    <div class="floating-controls__group">
      <button aria-label="Zoom in" @click="triggerControl('zoom-in')">
        <Plus :size="18" />
      </button>
      <button aria-label="Zoom out" @click="triggerControl('zoom-out')">
        <Minus :size="18" />
      </button>
    </div>
  </div>
</template>
