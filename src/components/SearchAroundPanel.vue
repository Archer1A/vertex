<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ArrowDown,
  CalendarDays,
  ChevronDown,
  CirclePlus,
  Clock3,
  Hash,
  MapPin,
  Network,
  Plus,
  Search,
  Shuffle,
  ToggleLeft,
  Type,
  X
} from 'lucide-vue-next'
import {
  airportInstances,
  flightInstances,
  getObjectTypeById,
  linkTypes,
  type LinkType,
  type ObjectInstance,
  type PropertyValue,
  type PropertyType
} from '../mock/mock'
import type { SearchAroundAddPayload, SelectedObject } from '../types/graph'

const props = defineProps<{
  selectedObject: SelectedObject
  startingInstance: ObjectInstance
  startingObjectTypeId: string
  initialLinkType?: LinkType | null
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'addToGraph', payload: SearchAroundAddPayload): void
}>()

const propertyFilter = ref('')
const selectedFilter = ref<PropertyType | null>(null)
const isFilterMenuOpen = ref(false)
const selectedLinkType = ref<LinkType | null>(props.initialLinkType ?? null)
const isLinkMenuOpen = ref(false)
const isResultPreviewOpen = ref(false)

const availableLinkTypes = computed(() =>
  linkTypes.filter((linkType) => {
    return linkType.sourceObjectTypeId === props.startingObjectTypeId || linkType.targetObjectTypeId === props.startingObjectTypeId
  })
)

const resultObjectType = computed(() => {
  if (!selectedLinkType.value) {
    return undefined
  }

  const resultObjectTypeId =
    selectedLinkType.value.sourceObjectTypeId === props.startingObjectTypeId
      ? selectedLinkType.value.targetObjectTypeId
      : selectedLinkType.value.sourceObjectTypeId

  return getObjectTypeById(resultObjectTypeId)
})

const filterProperties = computed(() => resultObjectType.value?.properties.filter((property) => property.filterable) ?? [])

const selectedAirportCode = computed(() => {
  return toDisplayString(props.startingInstance.properties.airport)
})

const selectedFlightId = computed(() => {
  return toDisplayString(props.startingInstance.properties.flightId)
})

const resultInstances = computed(() => {
  if (!selectedLinkType.value) {
    return []
  }

  if (props.startingObjectTypeId === 'object_type_flight') {
    const flight = flightInstances.find((instance) => instance.properties.flightId === selectedFlightId.value)
    const airportCode =
      selectedLinkType.value.apiName === 'flightDestinationAirport'
        ? flight?.properties.destinationAirportCode
        : flight?.properties.originAirportCode

    return airportInstances.filter((airport) => airport.properties.airport === airportCode)
  }

  if (selectedLinkType.value.apiName === 'flightDestinationAirport') {
    return flightInstances.filter((flight) => flight.properties.destinationAirportCode === selectedAirportCode.value)
  }

  return flightInstances.filter((flight) => flight.properties.originAirportCode === selectedAirportCode.value)
})

const filteredProperties = computed(() => {
  const filter = propertyFilter.value.trim().toLowerCase()

  if (!filter) {
    return filterProperties.value
  }

  return filterProperties.value.filter((property) => {
    return property.displayName.toLowerCase().includes(filter) || property.apiName.toLowerCase().includes(filter)
  })
})

const resultSummary = computed(() => ({
  label: resultObjectType.value?.displayName ?? 'Select an object type',
  count: resultInstances.value.length
}))

const previewRows = computed(() => {
  const objectType = resultObjectType.value

  if (!objectType) {
    return []
  }

  const titleProperty = objectType.properties.find((property) => property.id === objectType.titlePropertyId)
  const detailProperties = objectType.properties
    .filter((property) => property.id !== objectType.titlePropertyId)
    .slice(0, 3)

  return resultInstances.value.slice(0, 6).map((instance) => ({
    id: instance.id,
    title: titleProperty ? toDisplayString(instance.properties[titleProperty.apiName]) : instance.id,
    details: detailProperties.map((property) => ({
      key: property.displayName,
      value: toDisplayString(instance.properties[property.apiName])
    }))
  }))
})

function isGeoPoint(value: PropertyValue): value is { latitude: number; longitude: number } {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && 'latitude' in value
}

function toDisplayString(value: PropertyValue): string {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  if (isGeoPoint(value)) {
    return `${value.latitude},${value.longitude}`
  }

  return ''
}

function propertyIcon(property: PropertyType) {
  if (property.baseType === 'number') {
    return Hash
  }

  if (property.baseType === 'datetime') {
    return Clock3
  }

  if (property.baseType === 'boolean') {
    return ToggleLeft
  }

  if (property.baseType === 'date') {
    return CalendarDays
  }

  return Type
}

function selectProperty(property: PropertyType) {
  selectedFilter.value = property
  isFilterMenuOpen.value = false
  propertyFilter.value = ''
  console.log('search around filter selected', property.apiName)
}

function removeFilter() {
  console.log('remove search around filter', selectedFilter.value?.apiName)
  selectedFilter.value = null
}

function selectLinkType(linkType: LinkType) {
  selectedLinkType.value = linkType
  selectedFilter.value = null
  isLinkMenuOpen.value = false
  isFilterMenuOpen.value = false
  isResultPreviewOpen.value = false
  propertyFilter.value = ''
  console.log('search around link selected', linkType.apiName)
}

function addSearchAroundStep() {
  console.log('add search around step')
}

function addFilter() {
  isFilterMenuOpen.value = true
  console.log('add filter')
}

function addLink() {
  isLinkMenuOpen.value = true
  console.log('add link')
}

function addToGraph() {
  if (!selectedLinkType.value) {
    console.log('add to graph skipped: no link selected')
    return
  }

  const payload: SearchAroundAddPayload = {
    linkType: selectedLinkType.value,
    objectIds: resultInstances.value.map((instance) => instance.id)
  }

  emit('addToGraph', payload)
  console.log('add to graph', payload)
}

function toggleResultPreview() {
  isResultPreviewOpen.value = !isResultPreviewOpen.value
  console.log('preview resulting objects', resultInstances.value.length)
}

watch(
  () => props.initialLinkType,
  (linkType) => {
    selectedLinkType.value = linkType ?? null
    isLinkMenuOpen.value = false
    isFilterMenuOpen.value = false
    isResultPreviewOpen.value = false
    selectedFilter.value = null
    propertyFilter.value = ''
  }
)
</script>

<template>
  <aside class="search-around-panel" aria-label="Search Around" @click.stop>
    <header class="search-around-panel__header">
      <div class="search-around-panel__title">
        <Network :size="20" />
        <h2>Search Around</h2>
      </div>
      <button class="search-around-panel__close" type="button" aria-label="Close Search Around" @click="emit('close')">
        <X :size="16" />
      </button>
    </header>

    <div class="search-around-panel__tabs">
      <button class="search-around-panel__tab" type="button" @click="console.log('search around tab')">
        <span>Search Around 1</span>
        <ChevronDown :size="18" />
      </button>
      <button class="search-around-panel__add-tab" type="button" aria-label="Add Search Around" @click="addSearchAroundStep">
        <Plus :size="24" />
      </button>
    </div>

    <div class="search-around-panel__stage">
      <button class="search-around-panel__parameters" type="button" @click="console.log('view parameters')">
        View parameters
      </button>

      <div class="search-around-card search-around-card--starting">
        <span class="search-around-card__label">Starting objects</span>
        <span class="search-around-card__type">
          <span class="search-around-card__icon">
            <MapPin :size="16" />
          </span>
          <span>{{ selectedObject.subtitle }}</span>
        </span>
        <span class="search-around-card__count">1</span>
      </div>

      <ArrowDown v-if="selectedLinkType || isLinkMenuOpen" class="search-around-panel__arrow" :size="22" />

      <section v-if="selectedLinkType || isLinkMenuOpen" class="search-around-config" aria-label="Search around relation and filters">
        <label class="search-around-config__label">Relation</label>
        <button class="search-around-relation" type="button" @click="isLinkMenuOpen = !isLinkMenuOpen">
          <span class="search-around-relation__origin">
            <MapPin :size="16" />
          </span>
          <span class="search-around-relation__link">
            <Shuffle :size="15" />
          </span>
          <span class="search-around-relation__text">
            {{ selectedLinkType?.displayName ?? 'Select link object...' }}
          </span>
          <ChevronDown :size="16" />
        </button>

        <div v-if="isLinkMenuOpen" class="search-around-link-type-menu">
          <button
            v-for="linkType in availableLinkTypes"
            :key="linkType.id"
            class="search-around-link-type-option"
            :class="{ 'search-around-link-type-option--active': selectedLinkType?.id === linkType.id }"
            type="button"
            @click="selectLinkType(linkType)"
          >
            <span class="search-around-link-type-option__icon">
              <Shuffle :size="15" />
            </span>
            <span>{{ linkType.displayName }}</span>
          </button>
        </div>

        <div v-if="selectedLinkType" class="search-around-config__label search-around-config__label--filters">Filters</div>
        <button v-if="selectedLinkType" class="search-around-add-filter" type="button" @click="addFilter">
          <CirclePlus :size="18" />
          <span>Add filter</span>
        </button>

        <div v-if="selectedFilter" class="search-around-selected-filter">
          <component :is="propertyIcon(selectedFilter)" :size="14" />
          <span>{{ selectedFilter.displayName }}</span>
          <button type="button" aria-label="Remove filter" @click="removeFilter">
            <X :size="13" />
          </button>
        </div>

        <div v-if="selectedLinkType" class="search-around-config__label search-around-config__label--results">Resulting Objects</div>
        <div v-if="selectedLinkType" class="search-around-result">
          <span class="search-around-result__icon">
            <Shuffle :size="15" />
          </span>
          <span class="search-around-result__label">{{ resultSummary.label }}</span>
          <button class="search-around-result__count" type="button" @click="toggleResultPreview">
            {{ resultSummary.count.toLocaleString('en-US').replace(',', '') }}
          </button>
        </div>

        <div v-if="isResultPreviewOpen" class="search-around-result-preview">
          <div class="search-around-result-preview__header">
            <span>{{ resultSummary.label }}</span>
            <button type="button" aria-label="Close result preview" @click="isResultPreviewOpen = false">
              <X :size="13" />
            </button>
          </div>
          <div v-if="previewRows.length" class="search-around-result-preview__list">
            <div v-for="row in previewRows" :key="row.id" class="search-around-result-preview-row">
              <div class="search-around-result-preview-row__title">{{ row.title }}</div>
              <div
                v-for="detail in row.details"
                :key="`${row.id}-${detail.key}`"
                class="search-around-result-preview-row__detail"
              >
                <span>{{ detail.key }}</span>
                <strong>{{ detail.value || '-' }}</strong>
              </div>
            </div>
          </div>
          <div v-else class="search-around-result-preview__empty">No matching objects</div>
        </div>

        <div v-if="isFilterMenuOpen" class="search-around-filter-menu">
          <label class="search-around-filter-menu__filter">
            <Search :size="22" />
            <input v-model="propertyFilter" type="text" placeholder="Filter..." />
          </label>

          <button
            v-for="property in filteredProperties"
            :key="property.id"
            class="search-around-filter-option"
            :class="{ 'search-around-filter-option--active': selectedFilter?.id === property.id }"
            type="button"
            @click="selectProperty(property)"
          >
            <span class="search-around-filter-option__icon">
              <component :is="propertyIcon(property)" :size="15" />
            </span>
            <span>{{ property.displayName }}</span>
          </button>
        </div>
      </section>

      <div class="search-around-actions">
        <button type="button" @click="addLink">
          <CirclePlus :size="18" />
          <span>Add link</span>
        </button>
        <button type="button" :disabled="!selectedLinkType" @click="addToGraph">
          <Network :size="18" />
          <span>Add to graph</span>
        </button>
      </div>
    </div>
  </aside>
</template>
