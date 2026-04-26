<script setup lang="ts">
import {
  ChevronDown,
  CirclePlus,
  ExternalLink,
  Info,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Route,
  Settings,
  SquarePen
} from 'lucide-vue-next'
import { ref } from 'vue'
import type { ObjectInstance, ObjectType } from '../mock/mock'
import type { AddObjectPayload, SelectedObject } from '../types/graph'
import AddObjectDrawer from './AddObjectDrawer.vue'
import PropertyList from './PropertyList.vue'

defineProps<{
  selectedObject: SelectedObject | null
  graphStats: {
    objects: number
    nodes: number
    edges: number
  }
  objectTypes: ObjectType[]
  objectInstances: ObjectInstance[]
  nodeGroups: Array<{
    objectTypeId: string
    displayName: string
    apiName: string
    icon?: string
    color?: string
    count: number
  }>
}>()

const emit = defineEmits<{
  (event: 'dockTool', payload: { tab: string; clientX: number; clientY: number }): void
  (event: 'addToCanvas', payload: AddObjectPayload): void
}>()

const filterText = ref('')
const isCollapsed = ref(false)
const activePrimaryTab = ref('Selection')
const primaryTabs = ['Layers', 'Selection', 'Search', 'Histogram', 'Info']
const suppressNextTabClick = ref(false)
const selectedLayerObjectTypeId = ref('object_type_flight')
const isAddObjectDrawerOpen = ref(false)

const tabDragState = {
  tab: '',
  pointerId: 0,
  startX: 0,
  startY: 0,
  dragging: false
}

function handlePrimaryTabClick(tab: string) {
  if (suppressNextTabClick.value) {
    suppressNextTabClick.value = false
    return
  }

  activePrimaryTab.value = tab

  if (isCollapsed.value) {
    isCollapsed.value = false
  }
}

function handleTabPointerDown(event: PointerEvent, tab: string) {
  const target = event.currentTarget as HTMLElement

  event.stopPropagation()
  target.setPointerCapture(event.pointerId)

  tabDragState.tab = tab
  tabDragState.pointerId = event.pointerId
  tabDragState.startX = event.clientX
  tabDragState.startY = event.clientY
  tabDragState.dragging = false
}

function handleTabPointerMove(event: PointerEvent) {
  if (event.pointerId !== tabDragState.pointerId || !tabDragState.tab) {
    return
  }

  const distanceX = Math.abs(event.clientX - tabDragState.startX)
  const distanceY = Math.abs(event.clientY - tabDragState.startY)

  if (distanceX + distanceY > 6) {
    tabDragState.dragging = true
  }
}

function handleTabPointerUp(event: PointerEvent, tab: string) {
  if (event.pointerId !== tabDragState.pointerId || tabDragState.tab !== tab) {
    return
  }

  const target = event.currentTarget as HTMLElement

  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId)
  }

  if (tabDragState.dragging) {
    suppressNextTabClick.value = true
    activePrimaryTab.value = tab
    isCollapsed.value = false
    emit('dockTool', {
      tab,
      clientX: event.clientX,
      clientY: event.clientY
    })
  }

  tabDragState.tab = ''
  tabDragState.dragging = false
}

function getNodeGroupIcon(apiName: string) {
  return apiName === 'flight' ? Route : MapPin
}

function selectLayerObject(objectTypeId: string) {
  selectedLayerObjectTypeId.value = objectTypeId
  console.log('layer object type', objectTypeId)
}

function openAddObjectDrawer() {
  activePrimaryTab.value = 'Layers'
  isAddObjectDrawerOpen.value = true
}

function handleAddToCanvas(payload: AddObjectPayload) {
  selectedLayerObjectTypeId.value = payload.objectTypeId
  isAddObjectDrawerOpen.value = false
  emit('addToCanvas', payload)
  console.log('add object drawer payload', payload)
}
</script>

<template>
  <aside
    class="selection-panel"
    :class="{ 'selection-panel--collapsed': isCollapsed }"
    aria-label="Selection panel"
  >
    <div class="selection-panel__tabs">
      <button
        v-for="tab in primaryTabs"
        :key="tab"
        class="selection-panel__tab"
        :class="{ 'selection-panel__tab--active': tab === activePrimaryTab }"
        @pointerdown="handleTabPointerDown($event, tab)"
        @pointermove="handleTabPointerMove"
        @pointerup="handleTabPointerUp($event, tab)"
        @pointercancel="handleTabPointerUp($event, tab)"
        @click="handlePrimaryTabClick(tab)"
      >
        {{ tab }}
      </button>
      <button
        class="selection-panel__collapse"
        :aria-label="isCollapsed ? 'Expand panel' : 'Collapse panel'"
        @click="isCollapsed = !isCollapsed"
      >
        {{ isCollapsed ? '>>' : '<<' }}
      </button>
    </div>

    <template v-if="!isCollapsed">
      <template v-if="activePrimaryTab === 'Layers'">
        <div class="layers-panel">
          <div class="layers-panel__add">
            <button type="button" @click="openAddObjectDrawer">
              <CirclePlus :size="18" />
              <span>Add object</span>
            </button>
          </div>

          <div class="layers-panel__styles">
            <div class="saved-styles__label">
              <span>Saved styles</span>
              <Info :size="15" />
            </div>
            <button class="saved-styles__select" type="button" @click="console.log('saved styles')">
              <span>Default styling</span>
              <ChevronDown :size="17" />
            </button>
            <button class="layers-icon-button" aria-label="Edit style" @click="console.log('edit style')">
              <Pencil :size="18" />
            </button>
            <button class="layers-icon-button" aria-label="Add style" @click="console.log('add style')">
              <CirclePlus :size="19" />
            </button>
          </div>

          <div class="layer-group">
            <div class="layer-group__title">NODES</div>
            <div
              v-for="group in nodeGroups"
              :key="group.objectTypeId"
              class="layer-object"
              :class="{ 'layer-object--selected': selectedLayerObjectTypeId === group.objectTypeId }"
              @click="selectLayerObject(group.objectTypeId)"
            >
              <div class="layer-object__main">
                <div class="layer-object__icon" :style="{ color: group.color ?? '#475569' }">
                  <component :is="getNodeGroupIcon(group.apiName)" :size="19" />
                </div>
                <div class="layer-object__copy">
                  <div class="layer-object__name">{{ group.displayName }}</div>
                  <div class="layer-object__meta">
                    <span class="layer-object__swatch" :style="{ background: group.color ?? '#3b82f6' }"></span>
                    {{ group.count }} nodes, colored by object type
                  </div>
                </div>
                <button class="layer-object__action" :aria-label="`Edit ${group.displayName} styling`" @click.stop>
                  <SquarePen :size="18" />
                </button>
                <button class="layer-object__action" :aria-label="`More ${group.displayName} actions`" @click.stop>
                  <MoreHorizontal :size="19" />
                </button>
              </div>
            </div>
          </div>

          <div class="layer-group">
            <div class="layer-group__title">EDGES</div>
            <div class="layer-edge">
              <div class="layer-edge__icons">
                <span><Route :size="15" /></span>
                <i></i>
                <span><MapPin :size="15" /></span>
              </div>
              <div class="layer-edge__copy">
                <div class="layer-edge__name">[Example Data] Flight ↔ [Example Data] Air...</div>
                <div class="layer-edge__meta">{{ graphStats.edges }} edges</div>
              </div>
            </div>
          </div>

          <AddObjectDrawer
            v-if="isAddObjectDrawerOpen"
            :object-types="objectTypes"
            :object-instances="objectInstances"
            @close="isAddObjectDrawerOpen = false"
            @add-to-canvas="handleAddToCanvas"
          />
        </div>
      </template>

      <template v-else-if="activePrimaryTab === 'Selection'">
        <template v-if="selectedObject">
          <div class="selection-panel__object">
            <div class="object-icon">
              <MapPin :size="24" />
            </div>
            <div class="object-copy">
              <div class="object-copy__title">{{ selectedObject.title }}</div>
              <div class="object-copy__subtitle">{{ selectedObject.subtitle }}</div>
            </div>
            <div class="object-actions">
              <button aria-label="Settings" @click="console.log('settings')">
                <Settings :size="15" />
              </button>
              <button aria-label="Open object" @click="console.log('open object')">
                <ExternalLink :size="15" />
              </button>
            </div>
          </div>

          <div class="selection-panel__subtabs">
            <button class="subtab subtab--active">Properties</button>
            <button class="subtab">Series</button>
            <button class="subtab">
              Events
              <span class="subtab__badge">0</span>
            </button>
          </div>

          <div class="selection-panel__filter">
            <input v-model="filterText" type="text" placeholder="Filter..." />
          </div>

          <PropertyList :items="selectedObject.properties" />

          <button class="selection-panel__add" aria-label="Add property" @click="console.log('add property')">
            <Plus :size="16" />
          </button>
        </template>

        <div v-else class="selection-panel__empty">
          <div class="selection-panel__empty-title">No object selected</div>
          <div class="selection-panel__empty-copy">Select a node on the canvas to inspect its properties.</div>
        </div>
      </template>

      <div v-else class="selection-panel__empty">
        <div class="selection-panel__empty-title">{{ activePrimaryTab }}</div>
        <div class="selection-panel__empty-copy">No content configured for this tab.</div>
      </div>
    </template>
  </aside>
</template>
