<script setup lang="ts">
import { ChevronDown, Plus } from 'lucide-vue-next'

defineProps<{
  sheets: string[]
  activeSheet: string
}>()

const emit = defineEmits<{
  (event: 'selectSheet', sheet: string): void
  (event: 'addSheet'): void
}>()
</script>

<template>
  <nav class="sheet-bar" aria-label="Sheets">
    <div class="sheet-bar__tabs">
      <button
        v-for="sheet in sheets"
        :key="sheet"
        class="sheet-tab"
        :class="{ 'sheet-tab--active': sheet === activeSheet }"
        @click="emit('selectSheet', sheet)"
      >
        {{ sheet }}
      </button>
      <button class="sheet-bar__add" aria-label="Add sheet" @click="emit('addSheet')">
        <Plus :size="15" />
      </button>
    </div>

    <button class="sheet-bar__view" @click="console.log('graph view menu')">
      <span>Canvas: Graph View</span>
      <ChevronDown :size="15" />
    </button>
  </nav>
</template>
