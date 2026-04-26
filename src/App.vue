<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import TopBar from './components/TopBar.vue'
import SheetBar from './components/SheetBar.vue'
import GraphCanvas from './components/GraphCanvas.vue'

export interface SelectedObject {
  title: string
  subtitle: string
  nodeLabel: string
  properties: Array<{
    key: string
    value: string
  }>
}

const sheets = ref(['Sheet 1', 'Sheet 2'])
const activeSheet = ref('Sheet 1')

const selectedObject = reactive<SelectedObject>({
  title: '[SFO] San Francisco Internatio...',
  subtitle: '[Example Data] Airport',
  nodeLabel: '[SFO] San Francisco I...',
  properties: [
    { key: 'Airport', value: 'SFO' },
    { key: 'Airport Country ISO Code', value: 'US' },
    { key: 'Airport Country Name', value: 'United States' },
    { key: 'Airport Location', value: '37.61888889,-122.37555556' },
    { key: 'Airport Start Date', value: 'Fri, Dec 1, 2017, 24:00:00 GMT' },
    { key: 'Airport State Code', value: 'CA' },
    { key: 'Airport State Name', value: 'California' },
    { key: 'Display Airport City Name Full', value: 'San Francisco, CA' },
    { key: 'Display Airport Name', value: 'San Francisco International' },
    { key: 'Display City Market Name Full', value: 'San Francisco, CA (Metropolita' },
    { key: 'Display Name', value: '[SFO] San Francisco Internatio' },
    { key: 'Latitude', value: '37.61888889' },
    { key: 'Longitude', value: '-122.37555556' },
    { key: 'Mapbox Feature Id v3', value: '332521' }
  ]
})

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
  <GraphCanvas
    :selected-object="selectedObject"
    :active-sheet-index="activeSheetIndex"
  />
</template>
