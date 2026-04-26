<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next'

function handleMore() {
  console.log('top bar more')
}
</script>

<template>
  <header class="top-bar">
    <div class="top-bar__title">New graph*</div>
    <button class="top-bar__button" aria-label="More actions" @click="handleMore">
      <MoreHorizontal :size="16" />
    </button>
  </header>
</template>
