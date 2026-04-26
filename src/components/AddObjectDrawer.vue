<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Filter, MapPin, Route, X } from 'lucide-vue-next'
import type { ObjectInstance, ObjectType, PropertyType, PropertyValue } from '../mock/mock'
import type { AddObjectPayload, EqualsFilterPayload } from '../types/graph'

const props = defineProps<{
  objectTypes: ObjectType[]
  objectInstances: ObjectInstance[]
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'addToCanvas', payload: AddObjectPayload): void
}>()

const selectedObjectTypeId = ref(props.objectTypes[0]?.id ?? '')
const filterOpen = ref(false)
const filterPropertyApiName = ref('')
const filterOperator = ref<'equals'>('equals')
const filterValue = ref('')
const appliedFilter = ref<EqualsFilterPayload | null>(null)

const selectedObjectType = computed(() =>
  props.objectTypes.find((objectType) => objectType.id === selectedObjectTypeId.value)
)

const filterableProperties = computed(() =>
  selectedObjectType.value?.properties.filter((property) => property.filterable) ?? []
)

const selectedFilterProperty = computed(() =>
  filterableProperties.value.find((property) => property.apiName === filterPropertyApiName.value)
)

const objectTypeInstances = computed(() =>
  props.objectInstances.filter((instance) => instance.objectTypeId === selectedObjectTypeId.value)
)

const filteredInstances = computed(() => {
  if (!appliedFilter.value) {
    return objectTypeInstances.value
  }

  const property = selectedObjectType.value?.properties.find(
    (item) => item.apiName === appliedFilter.value?.propertyApiName
  )

  if (!property || isUnsupportedFilterType(property)) {
    return objectTypeInstances.value
  }

  return objectTypeInstances.value.filter((instance) =>
    matchesFilter(instance.properties[property.apiName], property, appliedFilter.value)
  )
})

const previewInstances = computed(() => filteredInstances.value.slice(0, 5))

const previewCountText = computed(() => {
  if (!appliedFilter.value) {
    return `${objectTypeInstances.value.length} objects total`
  }

  return `${filteredInstances.value.length} of ${objectTypeInstances.value.length} objects`
})

const operators = computed(() => (selectedFilterProperty.value ? ['equals'] : []))

watch(
  selectedObjectTypeId,
  () => {
    appliedFilter.value = null
    filterValue.value = ''
    const firstFilterableProperty = filterableProperties.value[0]
    filterPropertyApiName.value = firstFilterableProperty?.apiName ?? ''
    filterOperator.value = 'equals'
  },
  { immediate: true }
)

watch(filterPropertyApiName, () => {
  filterOperator.value = 'equals'
  filterValue.value = ''
  appliedFilter.value = null
})

function isUnsupportedFilterType(property: PropertyType) {
  return property.baseType === 'geopoint' || property.baseType === 'array' || property.baseType === 'struct'
}

function toDisplayString(value: PropertyValue): string {
  if (value === null) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  return `${value.latitude}, ${value.longitude}`
}

function getInstanceTitle(instance: ObjectInstance) {
  const objectType = props.objectTypes.find((item) => item.id === instance.objectTypeId)
  const titleProperty = objectType?.properties.find((property) => property.id === objectType.titlePropertyId)
  const primaryProperty = objectType?.properties.find((property) => property.id === objectType.primaryKeyPropertyId)
  const title = titleProperty ? toDisplayString(instance.properties[titleProperty.apiName]) : ''
  const primary = primaryProperty ? toDisplayString(instance.properties[primaryProperty.apiName]) : ''

  return {
    primary: primary || instance.id,
    title: title || instance.id
  }
}

function matchesFilter(value: PropertyValue, property: PropertyType, filter: EqualsFilterPayload | null) {
  if (!filter) {
    return true
  }

  const rawValue = toDisplayString(value).trim()
  const rawFilter = filter.value.trim()

  if (property.baseType === 'number') {
    if (rawValue === '' || rawFilter === '') {
      return false
    }

    const numericValue = Number(rawValue)
    const numericFilter = Number(rawFilter)
    return !Number.isNaN(numericValue) && !Number.isNaN(numericFilter) && numericValue === numericFilter
  }

  if (property.baseType === 'boolean') {
    return rawValue.toLowerCase() === rawFilter.toLowerCase()
  }

  if (property.baseType === 'date' || property.baseType === 'datetime') {
    const valueTime = new Date(rawValue).getTime()
    const filterTime = new Date(rawFilter).getTime()

    if (!Number.isNaN(valueTime) && !Number.isNaN(filterTime)) {
      return valueTime === filterTime
    }

    return false
  }

  return rawValue.toLowerCase() === rawFilter.toLowerCase()
}

function applyFilter() {
  if (!selectedFilterProperty.value || isUnsupportedFilterType(selectedFilterProperty.value)) {
    return
  }

  appliedFilter.value = {
    objectTypeId: selectedObjectTypeId.value,
    propertyApiName: selectedFilterProperty.value.apiName,
    operator: 'equals',
    value: filterValue.value
  }

  console.log('apply add object filter', appliedFilter.value)
}

function clearFilter() {
  appliedFilter.value = null
  filterValue.value = ''
  console.log('clear add object filter')
}

function handleAddToCanvas() {
  const payload = {
    objectTypeId: selectedObjectTypeId.value,
    objectIds: filteredInstances.value.map((instance) => instance.id),
    filter: appliedFilter.value
  }

  emit('addToCanvas', payload)
  console.log('add objects to canvas', payload)
}
</script>

<template>
  <section class="add-object-drawer" aria-label="Add object drawer" @click.stop>
    <header class="add-object-drawer__header">
      <div>
        <div class="add-object-drawer__title">Add object</div>
        <div class="add-object-drawer__subtitle">Choose an object type to preview.</div>
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

      <section class="add-object-preview">
        <div class="add-object-preview__header">
          <div>
            <div class="add-object-preview__title">Preview</div>
            <div class="add-object-preview__count">{{ previewCountText }}</div>
          </div>
          <button
            class="add-object-filter-button"
            :class="{ 'add-object-filter-button--active': filterOpen }"
            type="button"
            @click="filterOpen = !filterOpen"
          >
            <Filter :size="15" />
            <span>Filter</span>
          </button>
        </div>

        <div class="add-object-preview__list">
          <div v-for="instance in previewInstances" :key="instance.id" class="add-object-preview-row">
            <div class="add-object-preview-row__icon" :style="{ color: selectedObjectType?.color ?? '#64748b' }">
              <Route v-if="selectedObjectType?.apiName === 'flight'" :size="16" />
              <MapPin v-else :size="16" />
            </div>
            <div class="add-object-preview-row__copy">
              <div class="add-object-preview-row__key">{{ getInstanceTitle(instance).primary }}</div>
              <div class="add-object-preview-row__name">{{ getInstanceTitle(instance).title }}</div>
            </div>
          </div>
          <div v-if="previewInstances.length === 0" class="add-object-preview__empty">
            No matching objects
          </div>
        </div>
      </section>

      <section v-if="filterOpen" class="add-object-filter">
        <div class="add-object-filter__title">Filter objects</div>
        <div class="add-object-filter__hint">Using 1 filter condition</div>

        <label class="add-object-field">
          <span>Property</span>
          <select v-model="filterPropertyApiName">
            <option v-for="property in filterableProperties" :key="property.id" :value="property.apiName">
              {{ property.displayName }}
            </option>
          </select>
        </label>

        <div v-if="selectedFilterProperty && isUnsupportedFilterType(selectedFilterProperty)" class="add-object-filter__disabled">
          {{ selectedFilterProperty.displayName }} filtering unavailable in prototype.
        </div>

        <template v-else>
          <label class="add-object-field">
            <span>Operator</span>
            <select v-model="filterOperator">
              <option v-for="operator in operators" :key="operator" :value="operator">
                {{ operator }}
              </option>
            </select>
          </label>

          <label class="add-object-field">
            <span>Value</span>
            <select v-if="selectedFilterProperty?.baseType === 'boolean'" v-model="filterValue">
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
            <input
              v-else
              v-model="filterValue"
              :type="selectedFilterProperty?.baseType === 'number' ? 'number' : 'text'"
              placeholder="Enter value"
            />
          </label>

          <div class="add-object-filter__actions">
            <button type="button" @click="clearFilter">Clear</button>
            <button class="add-object-filter__apply" type="button" @click="applyFilter">Apply</button>
          </div>
        </template>
      </section>
    </div>

    <footer class="add-object-drawer__footer">
      <button type="button" @click="handleAddToCanvas">Add to canvas</button>
    </footer>
  </section>
</template>
