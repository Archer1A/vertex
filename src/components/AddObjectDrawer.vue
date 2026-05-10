<script setup lang="ts">
import { computed, ref } from 'vue'
import { Box, X } from 'lucide-vue-next'
import type { ObjectType } from '../mock/mock'
import type { AddObjectPayload } from '../types/graph'

const props = defineProps<{
  objectTypes: ObjectType[]
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'addToCanvas', payload: AddObjectPayload): void
}>()

const selectedObjectTypeId = ref(props.objectTypes[0]?.id ?? '')

const selectedObjectType = computed(() =>
  props.objectTypes.find((objectType) => objectType.id === selectedObjectTypeId.value)
)

function handleAddToCanvas() {
  const payload = {
    nodeKind: 'objectType',
    objectTypeId: selectedObjectTypeId.value,
  } satisfies AddObjectPayload

  emit('addToCanvas', payload)
  console.log('add objectType to canvas', payload)
}
</script>

<template>
  <section class="add-object-drawer" aria-label="Add object drawer" @click.stop>
    <header class="add-object-drawer__header">
      <div>
        <div class="add-object-drawer__title">Add objectType</div>
        <div class="add-object-drawer__subtitle">Choose an object type to add as a graph node.</div>
      </div>
      <button class="add-object-drawer__close" aria-label="Close add object drawer" @click="emit('close')">
        <X :size="16" />
      </button>
    </header>

    <div class="add-object-drawer__body">
      <label class="add-object-field">
        <span>Object type</span>
        <select v-model="selectedObjectTypeId">
          <option v-for="objectType in objectTypes" :key="objectType.id" :value="objectType.id">
            {{ objectType.displayName }}
          </option>
        </select>
      </label>

      <section class="add-object-type-summary">
        <div class="add-object-type-summary__icon" :style="{ color: selectedObjectType?.color ?? '#64748b' }">
          <Box :size="18" />
        </div>
        <div class="add-object-type-summary__copy">
          <div class="add-object-type-summary__name">{{ selectedObjectType?.displayName }}</div>
          <div class="add-object-type-summary__meta">
            {{ selectedObjectType?.properties.length ?? 0 }} properties, {{ selectedObjectType?.status }} status
          </div>
        </div>
      </section>
    </div>

    <footer class="add-object-drawer__footer">
      <button type="button" @click="handleAddToCanvas">Add objectType</button>
    </footer>
  </section>
</template>
