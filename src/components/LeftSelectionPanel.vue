<script setup lang="ts">
import {
  AlertTriangle,
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
  Sparkles,
  SquarePen
} from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import type { ObjectInstance, ObjectType } from '../mock/mock'
import type { AddObjectPayload, SelectedObject } from '../types/graph'
import AddObjectDrawer from './AddObjectDrawer.vue'
import PropertyList from './PropertyList.vue'

const props = defineProps<{
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
const activeSecondaryTab = ref('Properties')
const activeAiEventId = ref('')
const eventCount = computed(() => props.selectedObject?.events?.length ?? 0)

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
  if (apiName === 'event') {
    return AlertTriangle
  }

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

function getEventProperty(event: NonNullable<SelectedObject['events']>[number], key: string) {
  return event.properties.find((property) => property.key === key)?.value ?? ''
}

function getEventAiInsight(event: NonNullable<SelectedObject['events']>[number]) {
  const summary = getEventProperty(event, 'Summary')
  const severity = getEventProperty(event, 'Severity')
  const startedAt = getEventProperty(event, 'Started At')
  const eventType = getEventProperty(event, 'Event Type')
  const eventTitle = getEventProperty(event, 'Event Title') || event.title

  if (`${eventType} ${summary}`.toLowerCase().includes('pass rate')) {
    const workstationCode = getEventProperty(event, 'Workstation Code')
    const passRate = getEventProperty(event, 'Pass Rate Percent')
    const threshold = getEventProperty(event, 'Threshold Percent')

    return {
      headline: 'Likely station-level yield degradation',
      confidence: '79%',
      basis: `${workstationCode || 'The workstation'} is reporting a ${passRate || 'below-target'}% pass rate against the ${threshold || 'configured'}% threshold, which points to a shared station condition rather than one isolated server failure.`,
      nextStep: 'Compare all servers assigned to this workstation, then inspect fixture seating, PDU stability, chamber temperature drift, and burn-in profile changes during the affected window.'
    }
  }

  if (summary.toLowerCase().includes('ecc')) {
    return {
      headline: 'Likely memory stability issue',
      confidence: '87%',
      basis: `The failure signature mentions ECC threshold pressure during burn-in. Severity is ${severity || 'elevated'} and the event started at ${startedAt || 'the recorded failure window'}.`,
      nextStep: 'Rerun memory stress with DIMM slot telemetry enabled, then compare corrected-error counts against adjacent servers in the same workstation.'
    }
  }

  if (summary.toLowerCase().includes('pcie')) {
    return {
      headline: 'Likely PCIe link instability',
      confidence: '82%',
      basis: `The event title "${eventTitle}" and summary both point to GPU PCIe stress instability rather than a generic thermal stop.`,
      nextStep: 'Check GPU riser seating, PCIe replay counters, and slot power history before rerunning the GPU profile.'
    }
  }

  if (summary.toLowerCase().includes('thermal')) {
    return {
      headline: 'Likely thermal margin breach',
      confidence: '84%',
      basis: `The event reports thermal margin below threshold, which usually indicates airflow, heatsink contact, or workload power excursion during burn-in.`,
      nextStep: 'Inspect fan curve telemetry, inlet temperature, heatsink pressure, and CPU package power around the failure interval.'
    }
  }

  return {
    headline: 'Likely burn-in profile failure',
    confidence: '74%',
    basis: summary || 'The event is marked as failed and linked to this server during the burn-in window.',
    nextStep: 'Review the failing workload step, recent sensor excursions, and matching events on nearby servers.'
  }
}

function askAiAboutEvent(event: NonNullable<SelectedObject['events']>[number]) {
  activeAiEventId.value = activeAiEventId.value === event.id ? '' : event.id
  console.log('ask ai about event', event.id)
}

watch(
  () => props.selectedObject?.nodeLabel,
  () => {
    activeSecondaryTab.value = 'Properties'
    activeAiEventId.value = ''
  }
)
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
            <button
              class="subtab"
              :class="{ 'subtab--active': activeSecondaryTab === 'Properties' }"
              @click="activeSecondaryTab = 'Properties'"
            >
              Properties
            </button>
            <button
              class="subtab"
              :class="{ 'subtab--active': activeSecondaryTab === 'Series' }"
              @click="activeSecondaryTab = 'Series'"
            >
              Series
            </button>
            <button
              class="subtab"
              :class="{ 'subtab--active': activeSecondaryTab === 'Events' }"
              @click="activeSecondaryTab = 'Events'"
            >
              Events
              <span class="subtab__badge">{{ eventCount }}</span>
            </button>
          </div>

          <template v-if="activeSecondaryTab === 'Properties'">
            <div class="selection-panel__filter">
              <input v-model="filterText" type="text" placeholder="Filter..." />
            </div>

            <PropertyList :items="selectedObject.properties" />
          </template>

          <template v-else-if="activeSecondaryTab === 'Events'">
            <div v-if="selectedObject.events?.length" class="event-list" aria-label="Object events">
              <article v-for="event in selectedObject.events" :key="event.id" class="event-card">
                <div class="event-card__header">
                  <div class="event-card__icon">
                    <AlertTriangle :size="16" />
                  </div>
                  <div class="event-card__copy">
                    <div class="event-card__title">{{ event.title }}</div>
                    <div class="event-card__subtitle">{{ event.subtitle }}</div>
                  </div>
                </div>
                <PropertyList :items="event.properties" />
                <div class="event-card__ai-actions">
                  <button
                    class="ask-ai-button"
                    type="button"
                    :aria-expanded="activeAiEventId === event.id"
                    @click="askAiAboutEvent(event)"
                  >
                    <Sparkles :size="15" />
                    <span>Ask AI</span>
                    <ChevronDown :size="14" />
                  </button>
                </div>
                <div v-if="activeAiEventId === event.id" class="ai-insight">
                  <div class="ai-insight__header">
                    <Sparkles :size="16" />
                    <span>AI root-cause read</span>
                    <strong>{{ getEventAiInsight(event).confidence }}</strong>
                  </div>
                  <div class="ai-insight__headline">{{ getEventAiInsight(event).headline }}</div>
                  <p>{{ getEventAiInsight(event).basis }}</p>
                  <div class="ai-insight__next">
                    <span>Next check</span>
                    {{ getEventAiInsight(event).nextStep }}
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="selection-panel__empty">
              <div class="selection-panel__empty-title">No events</div>
              <div class="selection-panel__empty-copy">This object has no related burn-in failure events.</div>
            </div>
          </template>

          <div v-else class="selection-panel__empty">
            <div class="selection-panel__empty-title">Series</div>
            <div class="selection-panel__empty-copy">No series configured for this object.</div>
          </div>

          <button
            v-if="activeSecondaryTab === 'Properties'"
            class="selection-panel__add"
            aria-label="Add property"
            @click="console.log('add property')"
          >
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
