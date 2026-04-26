<script setup lang="ts">
import {
  ChevronDown,
  CircleHelp,
  Group,
  LayoutGrid,
  MousePointer2,
  Pencil,
  Redo2,
  Search,
  Trash2,
  Undo2
} from 'lucide-vue-next'
import { computed } from 'vue'

interface ToolbarButton {
  label: string
  icon: unknown
  disabled?: boolean
  dropdown?: boolean
}

const props = defineProps<{
  canGroup?: boolean
}>()

const firstGroup = computed<ToolbarButton[]>(() => [
  { label: 'Selection', icon: MousePointer2, dropdown: true },
  { label: 'Search Around', icon: Search, dropdown: true },
  { label: 'Group', icon: Group, dropdown: true, disabled: !props.canGroup },
  { label: 'Layout', icon: LayoutGrid, dropdown: true },
  { label: 'Annotate', icon: Pencil, dropdown: true },
  { label: 'Delete', icon: Trash2 }
])

const historyGroup: ToolbarButton[] = [
  { label: 'Undo', icon: Undo2 },
  { label: 'Redo', icon: Redo2, disabled: true }
]

const emit = defineEmits<{
  (event: 'toolAction', label: string): void
}>()

function handleAction(label: string) {
  emit('toolAction', label)
  console.log(label.toLowerCase())
}
</script>

<template>
  <div class="main-toolbar" aria-label="Graph tools">
    <div class="toolbar-group">
      <button
        v-for="button in firstGroup"
        :key="button.label"
        class="toolbar-button"
        :disabled="button.disabled"
        @click="handleAction(button.label)"
      >
        <component :is="button.icon" :size="15" />
        <span>{{ button.label }}</span>
        <ChevronDown v-if="button.dropdown" :size="14" />
      </button>
    </div>

    <div class="toolbar-group">
      <button
        v-for="button in historyGroup"
        :key="button.label"
        class="toolbar-button"
        :disabled="button.disabled"
        @click="handleAction(button.label)"
      >
        <component :is="button.icon" :size="15" />
        <span>{{ button.label }}</span>
      </button>
    </div>

    <div class="toolbar-group toolbar-group--compact">
      <button class="toolbar-button toolbar-button--icon" aria-label="Help" @click="handleAction('help')">
        <CircleHelp :size="17" />
      </button>
    </div>
  </div>
</template>
