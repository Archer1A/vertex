<script setup lang="ts">
defineProps<{
  items: Array<{
    key: string
    value: string
  }>
}>()
</script>

<template>
  <div class="property-list" aria-label="Object properties">
    <div v-for="item in items" :key="item.key" class="property-list__row">
      <div class="property-list__key" :title="item.key">{{ item.key }}</div>
      <div class="property-list__value" :title="item.value">{{ item.value }}</div>
    </div>
  </div>
</template>
