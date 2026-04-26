<script setup lang="ts">
import { Maximize2, Minus, Plus } from 'lucide-vue-next'

function handleAction(action: string) {
  console.log(action)
}
</script>

<template>
  <div class="floating-controls" aria-label="Canvas controls">
    <div class="floating-controls__group">
      <button aria-label="Fit view" @click="handleAction('fit')">
        <Maximize2 :size="17" />
      </button>
    </div>
    <div class="floating-controls__group">
      <button aria-label="Zoom in" @click="handleAction('zoom in')">
        <Plus :size="18" />
      </button>
      <button aria-label="Zoom out" @click="handleAction('zoom out')">
        <Minus :size="18" />
      </button>
    </div>
  </div>
</template>
