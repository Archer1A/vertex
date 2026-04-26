<script setup lang="ts">
import { computed, ref } from 'vue'
import TopBar from './components/TopBar.vue'
import SheetBar from './components/SheetBar.vue'
import GraphCanvas from './components/GraphCanvas.vue'

const sheets = ref(['Sheet 1', 'Sheet 2'])
const activeSheet = ref('Sheet 1')

const activeSheetIndex = computed(() => sheets.value.indexOf(activeSheet.value))

function selectSheet(sheet: string) {
  activeSheet.value = sheet
}

function addSheet() {
  const sheetName = `Sheet ${sheets.value.length + 1}`
  sheets.value.push(sheetName)
  activeSheet.value = sheetName
  console.log('add sheet', sheetName)
}
</script>

<template>
  <TopBar />
  <SheetBar
    :sheets="sheets"
    :active-sheet="activeSheet"
    @select-sheet="selectSheet"
    @add-sheet="addSheet"
  />
  <GraphCanvas :active-sheet-index="activeSheetIndex" />
</template>
