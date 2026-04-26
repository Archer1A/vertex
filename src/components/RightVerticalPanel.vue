<template>
  <aside
    class="right-vertical-panel"
    :class="{ 'right-vertical-panel--search-open': searchAroundOpen }"
    aria-label="Model tools"
  >
    <button type="button" @click="console.log('model config')">Model Config</button>
    <button type="button" @click="console.log('simulation')">Simulation</button>
    <button
      v-if="searchAroundOpen"
      class="right-vertical-panel__button--active"
      type="button"
      @click="console.log('search around dock')"
    >
      Search Around
    </button>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  searchAroundOpen?: boolean
}>()
</script>
