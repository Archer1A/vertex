<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  ChevronRight,
  ClipboardList,
  Factory,
  Layers,
  PackageOpen,
  Plus,
  Search,
  Sparkles,
  X
} from 'lucide-vue-next'
import MetricsChartWidget from './MetricsChartWidget.vue'
import type { GraphNodeData } from '../types/graph'
import {
  DEMAND_TO_MATERIAL_LINK_TYPE_ID,
  LINE_ITEM_TO_DEMAND_LINK_TYPE_ID,
  MATERIAL_DEMAND_OBJECT_TYPE_ID,
  PRODUCTION_ORDER_OBJECT_TYPE_ID,
  PRODUCTION_ORDER_TO_DEMAND_LINK_TYPE_ID,
  PRODUCTION_ORDER_TO_MATERIAL_LINK_TYPE_ID,
  PRODUCTION_ORDER_TO_PLANT_LINK_TYPE_ID,
  PROJECT_LINE_ITEM_OBJECT_TYPE_ID,
  getObjectTypeById,
  getInstanceMetrics,
  getMetricsByObjectTypeId,
  linkInstances,
  objectInstances,
  objectTypes,
  type ChartMetric,
  type ObjectInstance,
  type ObjectType,
  type PropertyValue,
  type PropertyType
} from '../mock/mock'

const props = defineProps<{
  node: GraphNodeData
  objectType: ObjectType
  filteredInstances?: ObjectInstance[]
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

type MetricCardTone = 'default' | 'info' | 'warning' | 'danger' | 'success'

type MetricCard = {
  label: string
  value: string
  helper?: string
  tone?: MetricCardTone
  icon?: any
}

type TableTabId = 'instances' | 'demands' | 'workOrders' | 'plants' | 'materials'

type TableColumn = {
  key: string
  label: string
  align?: 'left' | 'right'
  isMono?: boolean
}

type TableRow = {
  id: string
  cells: Record<string, string>
}

const tableQuery = ref('')
const activeTab = ref<TableTabId>('instances')

const isObjectTypeView = computed(() => props.node.nodeKind === 'objectType')
const isInstanceView = computed(() => props.node.nodeKind === 'objectInstance')

const headerBadge = computed(() => (isObjectTypeView.value ? 'ObjectType' : 'Instance'))

function isGeoPoint(value: PropertyValue): value is { latitude: number; longitude: number } {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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

function getInstancePropertyValue(instance: ObjectInstance, property: Pick<PropertyType, 'apiName' | 'id'>): PropertyValue {
  return instance.properties[property.apiName] ?? instance.properties[property.id] ?? null
}

function getInstancePropertyText(instance: ObjectInstance, property: Pick<PropertyType, 'apiName' | 'id'>): string {
  return toDisplayString(getInstancePropertyValue(instance, property))
}

function getInstanceTitle(instance: ObjectInstance): string {
  const objectType = getObjectTypeById(instance.objectTypeId)
  const titleProperty = objectType?.properties.find((property) => property.id === objectType.titlePropertyId)
  const title = titleProperty ? getInstancePropertyText(instance, titleProperty) : ''
  return title || instance.id
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US').replace(/,/g, '')
}

function getLinkedTargets(sourceObjectInstanceId: string, linkTypeId: string): ObjectInstance[] {
  const targetIds = linkInstances
    .filter((link) => link.linkTypeId === linkTypeId && link.sourceObjectInstanceId === sourceObjectInstanceId)
    .map((link) => link.targetObjectInstanceId)

  const idSet = new Set(targetIds)
  return objectInstances.filter((instance) => idSet.has(instance.id))
}

function getLinkedSources(targetObjectInstanceId: string, linkTypeId: string): ObjectInstance[] {
  const sourceIds = linkInstances
    .filter((link) => link.linkTypeId === linkTypeId && link.targetObjectInstanceId === targetObjectInstanceId)
    .map((link) => link.sourceObjectInstanceId)

  const idSet = new Set(sourceIds)
  return objectInstances.filter((instance) => idSet.has(instance.id))
}

const objectTypeInstances = computed(() => {
  if (!isObjectTypeView.value) {
    return []
  }

  return props.filteredInstances ?? objectInstances.filter((instance) => instance.objectTypeId === props.objectType.id)
})

const instanceRecord = computed(() => {
  if (!isInstanceView.value) {
    return null
  }

  return objectInstances.find((instance) => instance.id === props.node.instance.id) ?? props.node.instance
})

const instanceDemands = computed(() => {
  const record = instanceRecord.value
  if (!record) {
    return []
  }

  if (record.objectTypeId === PROJECT_LINE_ITEM_OBJECT_TYPE_ID) {
    return getLinkedTargets(record.id, LINE_ITEM_TO_DEMAND_LINK_TYPE_ID)
  }

  if (record.objectTypeId === MATERIAL_DEMAND_OBJECT_TYPE_ID) {
    return [record]
  }

  if (record.objectTypeId === PRODUCTION_ORDER_OBJECT_TYPE_ID) {
    return getLinkedTargets(record.id, PRODUCTION_ORDER_TO_DEMAND_LINK_TYPE_ID)
  }

  return []
})

const instanceWorkOrders = computed(() => {
  const record = instanceRecord.value
  if (!record) {
    return []
  }

  if (record.objectTypeId === MATERIAL_DEMAND_OBJECT_TYPE_ID) {
    return getLinkedSources(record.id, PRODUCTION_ORDER_TO_DEMAND_LINK_TYPE_ID)
  }

  return []
})

const instancePlants = computed(() => {
  const record = instanceRecord.value
  if (!record) {
    return []
  }

  if (record.objectTypeId === PRODUCTION_ORDER_OBJECT_TYPE_ID) {
    return getLinkedTargets(record.id, PRODUCTION_ORDER_TO_PLANT_LINK_TYPE_ID)
  }

  return []
})

const instanceMaterials = computed(() => {
  const record = instanceRecord.value
  if (!record) {
    return []
  }

  if (record.objectTypeId === MATERIAL_DEMAND_OBJECT_TYPE_ID) {
    return getLinkedTargets(record.id, DEMAND_TO_MATERIAL_LINK_TYPE_ID)
  }

  if (record.objectTypeId === PRODUCTION_ORDER_OBJECT_TYPE_ID) {
    return getLinkedTargets(record.id, PRODUCTION_ORDER_TO_MATERIAL_LINK_TYPE_ID)
  }

  return []
})

const headerTitle = computed(() => {
  if (isObjectTypeView.value) {
    return props.objectType.displayName
  }

  const record = instanceRecord.value
  return record ? getInstanceTitle(record) : props.node.label
})

const headerSubtitle = computed(() => {
  if (isObjectTypeView.value) {
    return 'Metrics overview'
  }

  return props.objectType.displayName
})

type ChartOnlyMetric = Extract<ChartMetric, { type: 'pie' | 'bar' | 'line' }>
type CardMetric = Extract<ChartMetric, { type: 'card' }>

const objectTypeMetrics = computed(() => getMetricsByObjectTypeId(props.objectType.id))

const chartMetrics = computed<ChartOnlyMetric[]>(() => {
  if (!isObjectTypeView.value) {
    return []
  }

  return objectTypeMetrics.value.filter((metric): metric is ChartOnlyMetric => metric.type !== 'card')
})

type MetricCreateChartType = 'card' | 'pie' | 'bar' | 'line'
type MetricCreateAgg = 'sum' | 'avg' | 'min' | 'max' | 'count'

const isCreateOpen = ref(false)
const createDraft = ref<{
  chartType: MetricCreateChartType
  objectTypeId: string
  propertyKey: string
  dimensionKey: string
  aggregation: MetricCreateAgg
}>({
  chartType: 'bar',
  objectTypeId: props.objectType.id,
  propertyKey: '',
  dimensionKey: 'status',
  aggregation: 'sum'
})

const selectedCreateObjectType = computed(() => {
  return objectTypes.find((ot) => ot.id === createDraft.value.objectTypeId) ?? props.objectType
})

const createPropertyOptions = computed(() => {
  return selectedCreateObjectType.value?.properties ?? []
})

watch(
  () => createDraft.value.objectTypeId,
  () => {
    const next = createPropertyOptions.value[0]
    if (!next) {
      createDraft.value.propertyKey = ''
      return
    }
    const defaultKey = next.apiName || next.id
    createDraft.value.propertyKey = defaultKey
  },
  { immediate: true }
)

const chartTypeOptions: { value: MetricCreateChartType; label: string }[] = [
  { value: 'card', label: 'Card' },
  { value: 'pie', label: 'Pie' },
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' }
]

const dimensionOptions: { value: string; label: string }[] = [
  { value: 'status', label: 'status (placeholder)' },
  { value: 'type', label: 'type (placeholder)' },
  { value: 'date', label: 'date (placeholder)' },
  { value: 'location', label: 'location (placeholder)' }
]

const aggregationOptions: { value: MetricCreateAgg; label: string }[] = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Avg' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
  { value: 'count', label: 'Count' }
]

function openCreatePanel() {
  console.log('metrics:add')
  createDraft.value.objectTypeId = props.objectType.id
  isCreateOpen.value = true
}

function closeCreatePanel() {
  console.log('metrics:create:close')
  isCreateOpen.value = false
}

function submitCreatePanel() {
  console.log('metrics:create:submit', { ...createDraft.value })
}

function resolveToneFromColor(color: string | undefined): MetricCardTone | undefined {
  if (!color) return undefined
  const normalized = color.toLowerCase()
  if (normalized === '#ef4444' || normalized === '#dc2626') return 'danger'
  if (normalized === '#f59e0b' || normalized === '#f97316' || normalized === '#ea580c') return 'warning'
  if (normalized === '#10b981' || normalized === '#059669') return 'success'
  if (normalized === '#3b82f6' || normalized === '#2563eb' || normalized === '#1d4ed8') return 'info'
  return undefined
}

function cardValueText(value: number | string): string {
  return typeof value === 'number' ? formatNumber(value) : String(value)
}

const hasMetricTemplate = computed(() => {
  if (isObjectTypeView.value) {
    return objectTypeMetrics.value.length > 0
  }

  const record = instanceRecord.value
  if (!record) return false
  return getInstanceMetrics(record.id).length > 0
})

const metricCards = computed<MetricCard[]>(() => {
  if (isObjectTypeView.value) {
    const cards = objectTypeMetrics.value.filter((metric): metric is CardMetric => metric.type === 'card')
    if (cards.length === 0) {
      return [
        {
          label: 'Prototype',
          value: 'N/A',
          helper: 'No metric template yet for this object type.',
          tone: 'default',
          icon: Layers
        }
      ]
    }

    return cards.map((card) => ({
      label: card.title,
      value: `${cardValueText(card.value)}${card.unit ?? ''}`,
      helper: 'ObjectType metric',
      tone: resolveToneFromColor(card.color),
      icon: BarChart3
    }))
  }

  const record = instanceRecord.value
  if (!record) {
    return []
  }

  const cards = getInstanceMetrics(record.id)
  if (cards.length === 0) {
    return [
      {
        label: 'Prototype',
        value: 'N/A',
        helper: 'No metric template yet for this instance.',
        tone: 'default',
        icon: Layers
      }
    ]
  }

  return cards.map((card) => ({
    label: card.title,
    value: `${cardValueText(card.value)}${card.unit ?? ''}`,
    helper: 'Instance metric',
    tone: resolveToneFromColor(card.color),
    icon: BarChart3
  }))

})

const tableTabs = computed(() => {
  if (isObjectTypeView.value) {
    return [
      { id: 'instances' as const, label: 'Instances', icon: Layers }
    ]
  }

  const record = instanceRecord.value
  if (!record) {
    return []
  }

  if (record.objectTypeId === PROJECT_LINE_ITEM_OBJECT_TYPE_ID) {
    return [
      { id: 'demands' as const, label: 'Demands', icon: ClipboardList }
    ]
  }

  if (record.objectTypeId === MATERIAL_DEMAND_OBJECT_TYPE_ID) {
    return [
      { id: 'workOrders' as const, label: 'Work Orders', icon: Factory },
      { id: 'materials' as const, label: 'Materials', icon: PackageOpen }
    ]
  }

  if (record.objectTypeId === PRODUCTION_ORDER_OBJECT_TYPE_ID) {
    return [
      { id: 'demands' as const, label: 'Demands', icon: ClipboardList },
      { id: 'plants' as const, label: 'Plant', icon: Factory },
      { id: 'materials' as const, label: 'Materials', icon: PackageOpen }
    ]
  }

  return []
})

watch(
  tableTabs,
  (tabs) => {
    if (tabs.length === 0) {
      return
    }

    const hasActive = tabs.some((tab) => tab.id === activeTab.value)
    if (!hasActive) {
      activeTab.value = tabs[0].id
    }
  },
  { immediate: true }
)

const tableModel = computed((): { columns: TableColumn[]; rows: TableRow[]; emptyText: string } => {
  if (isObjectTypeView.value) {
    const instances = objectTypeInstances.value
    if (props.objectType.id === PROJECT_LINE_ITEM_OBJECT_TYPE_ID) {
      const columns: TableColumn[] = [
        { key: 'sku', label: 'SKU' },
        { key: 'qty', label: 'Qty', align: 'right', isMono: true },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'prod', label: 'Prod Status' },
        { key: 'fulfill', label: 'Fulfill' }
      ]

      const rows = instances.map((instance) => ({
        id: instance.id,
        cells: {
          sku: toDisplayString(instance.properties.sku_code ?? getInstanceTitle(instance)),
          qty: toDisplayString(instance.properties.quantity ?? '-'),
          confirmed: toDisplayString(instance.properties.confirmed_delivery_date ?? '-'),
          prod: toDisplayString(instance.properties.production_status ?? '-'),
          fulfill: toDisplayString(instance.properties.fulfillment_status ?? '-')
        }
      }))

      return { columns, rows, emptyText: 'No line items found.' }
    }

    if (props.objectType.id === MATERIAL_DEMAND_OBJECT_TYPE_ID) {
      const columns: TableColumn[] = [
        { key: 'id', label: 'ID', isMono: true },
        { key: 'type', label: 'Type' },
        { key: 'qty', label: 'Qty', align: 'right', isMono: true },
        { key: 'due', label: 'Demand Date' },
        { key: 'latest', label: 'Latest Order' },
        { key: 'status', label: 'Status' }
      ]

      const rows = instances.map((demand) => ({
        id: demand.id,
        cells: {
          id: toDisplayString(demand.properties.id ?? demand.id),
          type: toDisplayString(demand.properties.demand_type ?? '-'),
          qty: toDisplayString(demand.properties.quantity ?? '-'),
          due: toDisplayString(demand.properties.demand_date ?? '-'),
          latest: toDisplayString(demand.properties.latest_order_date ?? '-'),
          status: toDisplayString(demand.properties.status ?? '-')
        }
      }))

      return { columns, rows, emptyText: 'No demands found.' }
    }

    if (props.objectType.id === PRODUCTION_ORDER_OBJECT_TYPE_ID) {
      const columns: TableColumn[] = [
        { key: 'number', label: 'WO Number' },
        { key: 'qty', label: 'Qty', align: 'right', isMono: true },
        { key: 'plannedStart', label: 'Planned Start' },
        { key: 'plannedEnd', label: 'Planned End' },
        { key: 'plant', label: 'Plant' },
        { key: 'status', label: 'Status' }
      ]

      const rows = instances.map((wo) => {
        const plants = getLinkedTargets(wo.id, PRODUCTION_ORDER_TO_PLANT_LINK_TYPE_ID)
        return {
          id: wo.id,
          cells: {
            number: toDisplayString(wo.properties.production_order_number ?? wo.id),
            qty: toDisplayString(wo.properties.quantity ?? '-'),
            plannedStart: toDisplayString(wo.properties.planned_start_date ?? '-'),
            plannedEnd: toDisplayString(wo.properties.planned_end_date ?? '-'),
            plant: plants[0] ? toDisplayString(plants[0].properties.plant_name ?? plants[0].id) : '-',
            status: toDisplayString(wo.properties.status ?? '-')
          }
        }
      })

      return { columns, rows, emptyText: 'No work orders found.' }
    }

    const columns: TableColumn[] = [
      { key: 'title', label: 'Title' },
      { key: 'id', label: 'ID', isMono: true },
      { key: 'status', label: 'Status' }
    ]

    const rows = instances.map((instance) => ({
      id: instance.id,
      cells: {
        title: getInstanceTitle(instance),
        id: instance.id,
        status: toDisplayString(
          instance.properties.status ?? instance.properties.production_status ?? instance.properties.fulfillment_status ?? '-'
        )
      }
    }))

    return { columns, rows, emptyText: 'No instances found.' }
  }

  const record = instanceRecord.value
  if (!record) {
    return { columns: [], rows: [], emptyText: 'No record.' }
  }

  if (activeTab.value === 'demands') {
    const demands = instanceDemands.value
    const columns: TableColumn[] = [
      { key: 'id', label: 'ID', isMono: true },
      { key: 'type', label: 'Type' },
      { key: 'qty', label: 'Qty', align: 'right', isMono: true },
      { key: 'due', label: 'Demand Date' },
      { key: 'latest', label: 'Latest Order' },
      { key: 'status', label: 'Status' }
    ]

    const rows = demands.map((demand) => ({
      id: demand.id,
      cells: {
        id: demand.id,
        type: toDisplayString(demand.properties.demand_type ?? '-'),
        qty: toDisplayString(demand.properties.quantity ?? '-'),
        due: toDisplayString(demand.properties.demand_date ?? '-'),
        latest: toDisplayString(demand.properties.latest_order_date ?? '-'),
        status: toDisplayString(demand.properties.status ?? '-')
      }
    }))

    return { columns, rows, emptyText: 'No linked demands.' }
  }

  if (activeTab.value === 'workOrders') {
    const workOrders = instanceWorkOrders.value
    const columns: TableColumn[] = [
      { key: 'number', label: 'WO Number' },
      { key: 'qty', label: 'Qty', align: 'right', isMono: true },
      { key: 'plannedStart', label: 'Planned Start' },
      { key: 'plannedEnd', label: 'Planned End' },
      { key: 'status', label: 'Status' }
    ]

    const rows = workOrders.map((wo) => ({
      id: wo.id,
      cells: {
        number: toDisplayString(wo.properties.production_order_number ?? wo.id),
        qty: toDisplayString(wo.properties.quantity ?? '-'),
        plannedStart: toDisplayString(wo.properties.planned_start_date ?? '-'),
        plannedEnd: toDisplayString(wo.properties.planned_end_date ?? '-'),
        status: toDisplayString(wo.properties.status ?? '-')
      }
    }))

    return { columns, rows, emptyText: 'No linked work orders.' }
  }

  if (activeTab.value === 'plants') {
    const plants = instancePlants.value
    const columns: TableColumn[] = [
      { key: 'name', label: 'Plant' },
      { key: 'code', label: 'Code', isMono: true },
      { key: 'location', label: 'Location' }
    ]

    const rows = plants.map((plant) => ({
      id: plant.id,
      cells: {
        name: toDisplayString(plant.properties.plant_name ?? plant.id),
        code: toDisplayString(plant.properties.plant_code ?? '-'),
        location: toDisplayString(plant.properties.location ?? '-')
      }
    }))

    return { columns, rows, emptyText: 'No linked plant.' }
  }

  if (activeTab.value === 'materials') {
    const materials = instanceMaterials.value
    const columns: TableColumn[] = [
      { key: 'name', label: 'Material' },
      { key: 'code', label: 'Code', isMono: true },
      { key: 'type', label: 'Type' },
      { key: 'supply', label: 'Supply' }
    ]

    const rows = materials.map((material) => ({
      id: material.id,
      cells: {
        name: toDisplayString(material.properties.material_name ?? material.id),
        code: toDisplayString(material.properties.material_code ?? '-'),
        type: toDisplayString(material.properties.material_type ?? '-'),
        supply: toDisplayString(material.properties.default_supply_type ?? '-')
      }
    }))

    return { columns, rows, emptyText: 'No linked materials.' }
  }

  return { columns: [], rows: [], emptyText: 'No data.' }
})

const filteredTableRows = computed(() => {
  const query = tableQuery.value.trim().toLowerCase()
  const rows = tableModel.value.rows

  if (!query) {
    return rows
  }

  return rows.filter((row) => {
    return Object.values(row.cells).some((value) => value.toLowerCase().includes(query))
  })
})

const resolvedActiveTab = computed(() => {
  const tabs = tableTabs.value
  if (tabs.length === 0) {
    return 'instances' as TableTabId
  }

  const exists = tabs.some((tab) => tab.id === activeTab.value)
  return exists ? activeTab.value : tabs[0].id
})

function getCardToneClass(tone: MetricCardTone | undefined) {
  if (!tone || tone === 'default') {
    return ''
  }

  return `metrics-card--${tone}`
}

function setActiveTab(tabId: TableTabId) {
  activeTab.value = tabId
  tableQuery.value = ''
  console.log('metrics table tab', tabId)
}

function handleRowClick(rowId: string) {
  console.log('metrics table row', rowId)
}

function handleClose() {
  emit('close')
}

const headerIcon = computed(() => {
  if (props.objectType.id === PROJECT_LINE_ITEM_OBJECT_TYPE_ID) {
    return ClipboardList
  }

  if (props.objectType.id === MATERIAL_DEMAND_OBJECT_TYPE_ID) {
    return PackageOpen
  }

  if (props.objectType.id === PRODUCTION_ORDER_OBJECT_TYPE_ID) {
    return Factory
  }

  return BarChart3
})

const headerTrail = computed(() => {
  if (isObjectTypeView.value) {
    return [
      { label: 'Metrics', icon: BarChart3 }
    ]
  }

  return [
    { label: props.objectType.displayName, icon: Layers },
    { label: 'Metrics', icon: BarChart3 }
  ]
})

type ChatRole = 'assistant' | 'user'
type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  timestamp: number
}

const chatThreadRef = ref<HTMLElement | null>(null)
const chatInputRef = ref<HTMLTextAreaElement | null>(null)
const chatDraft = ref('')
const chatIsBusy = ref(false)
const promptChips = ['Summarize these metrics', 'Highlight anomalies', 'Explain a selected row', 'Suggest next actions']

const chatMessages = ref<ChatMessage[]>([
  {
    id: 'ai-hello',
    role: 'assistant',
    content: 'AI chat prototype (no backend). Ask questions about the selected object, KPI cards, or table rows.',
    timestamp: Date.now()
  }
])

function makeChatId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`
}

function scrollChatToBottom() {
  const el = chatThreadRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

watch(
  () => chatMessages.value.length,
  async () => {
    await nextTick()
    scrollChatToBottom()
  }
)

function buildMockReply(prompt: string) {
  const focus = headerTitle.value
  const kpis = metricCards.value
    .slice(0, 3)
    .map((card) => `${card.label}: ${card.value}`)
    .join(' · ')

  const lower = prompt.toLowerCase()
  if (lower.includes('anomal') || lower.includes('risk')) {
    return `Prototype insight for “${focus}”: scan the Data table for outliers and confirm upstream refresh cadence. Current KPIs: ${kpis || 'N/A'}.`
  }
  if (lower.includes('summar') || lower.includes('overview')) {
    return `Summary for “${focus}”: KPIs and charts are on the left, with drill-down rows in Data. Current KPIs: ${kpis || 'N/A'}.`
  }
  if (lower.includes('next') || lower.includes('action')) {
    return `Next actions (prototype): validate top KPI drivers, filter Data by status/date, then compare linked objects (demands/materials/plants) for dependency risk.`
  }

  return `Got it (prototype). Try: “Summarize these metrics”, “Highlight anomalies”, or “Suggest next actions”.`
}

async function sendChatMessage(nextText?: string) {
  const text = (nextText ?? chatDraft.value).trim()
  if (!text || chatIsBusy.value) return

  chatDraft.value = ''
  chatIsBusy.value = true

  chatMessages.value.push({
    id: makeChatId('user'),
    role: 'user',
    content: text,
    timestamp: Date.now()
  })

  const assistantId = makeChatId('ai')
  chatMessages.value.push({
    id: assistantId,
    role: 'assistant',
    content: 'Thinking…',
    timestamp: Date.now()
  })

  window.setTimeout(() => {
    const index = chatMessages.value.findIndex((msg) => msg.id === assistantId)
    if (index >= 0) {
      chatMessages.value[index] = { ...chatMessages.value[index], content: buildMockReply(text) }
    }
    chatIsBusy.value = false
  }, 520)

  await nextTick()
  chatInputRef.value?.focus()
}

function handleChatKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter') return
  if (event.shiftKey) return
  event.preventDefault()
  void sendChatMessage()
}

function handleChipClick(chip: string) {
  chatDraft.value = chip
  void nextTick(() => chatInputRef.value?.focus())
}

function clearChat() {
  console.log('metric-ai:chat:clear')
  chatMessages.value = [
    {
      id: 'ai-hello',
      role: 'assistant',
      content: 'AI chat prototype (no backend). Ask questions about the selected object, KPI cards, or table rows.',
      timestamp: Date.now()
    }
  ]
}

const globalKeyHandler = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isCreateOpen.value) {
    closeCreatePanel()
  }
}

onMounted(() => {
  window.addEventListener('keydown', globalKeyHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', globalKeyHandler)
})
</script>

<template>
  <aside class="metrics-panel metric-ai-panel" aria-label="Metrics" @click.stop>
    <header class="metrics-panel__header">
      <div class="metrics-panel__title">
        <span class="metrics-panel__title-icon">
          <component :is="headerIcon" :size="18" />
        </span>
        <div class="metrics-panel__title-copy">
          <div class="metrics-panel__breadcrumbs">
            <span v-for="(crumb, index) in headerTrail" :key="crumb.label" class="metrics-panel__crumb">
              <component :is="crumb.icon" :size="14" />
              <span>{{ crumb.label }}</span>
              <ChevronRight v-if="index < headerTrail.length - 1" :size="14" />
            </span>
          </div>
          <h2 class="metrics-panel__heading" :title="headerTitle">
            {{ headerTitle }}
          </h2>
          <p class="metrics-panel__subheading" :title="headerSubtitle">
            <span class="metrics-panel__badge">{{ headerBadge }}</span>
            <span>{{ headerSubtitle }}</span>
          </p>
        </div>
      </div>

      <button class="metrics-panel__close" type="button" aria-label="Close metrics" @click="handleClose">
        <X :size="16" />
      </button>
    </header>

    <div class="metric-ai-panel__body">
      <div class="metrics-panel__main">
        <section class="metrics-panel__cards" aria-label="Metric cards">
        <div class="metrics-panel__cards-head">
          <div class="metrics-panel__cards-title">
            <BarChart3 :size="16" />
            <span>Key metrics</span>
          </div>
          <div v-if="hasMetricTemplate" class="metrics-panel__cards-hint">
            Powered by src/mock/metrics.ts
          </div>
          <div v-else class="metrics-panel__cards-hint">
            Template pending for this selection
          </div>
        </div>

        <div class="metrics-card-grid">
          <div
            v-for="card in metricCards"
            :key="card.label"
            class="metrics-card"
            :class="getCardToneClass(card.tone)"
            role="group"
            :aria-label="card.label"
          >
            <div class="metrics-card__top">
              <div class="metrics-card__icon">
                <component :is="card.icon ?? ArrowRight" :size="18" />
              </div>
              <div class="metrics-card__value" :title="card.value">
                {{ card.value }}
              </div>
            </div>
            <div class="metrics-card__label" :title="card.label">{{ card.label }}</div>
            <div v-if="card.helper" class="metrics-card__helper" :title="card.helper">{{ card.helper }}</div>
          </div>
        </div>

        <div class="metrics-widget-grid" aria-label="Charts">
          <MetricsChartWidget
            v-for="metric in chartMetrics"
            :key="`${metric.type}-${metric.title}`"
            :metric="metric"
          />
          <section
            class="metrics-widget metrics-widget--add"
            role="button"
            tabindex="0"
            aria-label="Add metric"
            @click="openCreatePanel"
            @keydown.enter.prevent="openCreatePanel"
          >
            <div class="metrics-widget-add__icon">
              <Plus :size="18" />
            </div>
            <div class="metrics-widget-add__title">Add metric</div>
            <div class="metrics-widget-add__hint">Create a new chart</div>
          </section>
        </div>
      </section>

        <section class="metrics-panel__table" aria-label="Metric table">
        <div class="metrics-panel__table-head">
          <div class="metrics-panel__table-title">
            <Layers :size="16" />
            <span>Data</span>
          </div>

          <div class="metrics-panel__table-tabs">
            <button
              v-for="tab in tableTabs"
              :key="tab.id"
              class="metrics-panel__table-tab"
              :class="{ 'metrics-panel__table-tab--active': resolvedActiveTab === tab.id }"
              type="button"
              @click="setActiveTab(tab.id)"
            >
              <component :is="tab.icon" :size="14" />
              <span>{{ tab.label }}</span>
            </button>
          </div>

          <label class="metrics-panel__table-search" aria-label="Search table rows">
            <Search :size="16" />
            <input v-model="tableQuery" type="text" placeholder="Search..." />
          </label>
        </div>

        <div class="metrics-table">
          <table v-if="tableModel.columns.length && filteredTableRows.length">
            <thead>
              <tr>
                <th
                  v-for="column in tableModel.columns"
                  :key="column.key"
                  :class="[
                    column.align === 'right' ? 'metrics-table__cell--right' : '',
                    column.isMono ? 'metrics-table__cell--mono' : ''
                  ]"
                >
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredTableRows" :key="row.id" @click="handleRowClick(row.id)">
                <td
                  v-for="column in tableModel.columns"
                  :key="`${row.id}-${column.key}`"
                  :class="[
                    column.align === 'right' ? 'metrics-table__cell--right' : '',
                    column.isMono ? 'metrics-table__cell--mono' : ''
                  ]"
                  :title="row.cells[column.key]"
                >
                  {{ row.cells[column.key] }}
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else class="metrics-table__empty">
            <AlertTriangle :size="18" />
            <span>{{ tableModel.columns.length ? tableModel.emptyText : 'No table template for this object.' }}</span>
          </div>
        </div>
        </section>
      </div>

      <aside class="metric-ai-chat" aria-label="AI chat" @click.stop>
        <header class="metric-ai-chat__header">
          <div class="metric-ai-chat__title">
            <span class="metric-ai-chat__icon" aria-hidden="true">
              <Sparkles :size="16" />
            </span>
            <div class="metric-ai-chat__title-copy">
              <div class="metric-ai-chat__title-row">
                <span>AI Assistant</span>
                <span class="metric-ai-chat__pill">Prototype</span>
              </div>
              <div class="metric-ai-chat__subtitle">Mock responses · No backend connected</div>
            </div>
          </div>

          <button class="metric-ai-chat__clear" type="button" aria-label="Clear chat" @click="clearChat">
            <X :size="16" />
          </button>
        </header>

        <div class="metric-ai-chat__chips" aria-label="Suggested prompts">
          <button
            v-for="chip in promptChips"
            :key="chip"
            class="metric-ai-chat__chip"
            type="button"
            @click="handleChipClick(chip)"
          >
            {{ chip }}
          </button>
        </div>

        <div ref="chatThreadRef" class="metric-ai-chat__thread" aria-label="Chat messages">
          <div
            v-for="msg in chatMessages"
            :key="msg.id"
            class="metric-ai-chat__msg"
            :class="msg.role === 'user' ? 'metric-ai-chat__msg--user' : 'metric-ai-chat__msg--ai'"
          >
            <div class="metric-ai-chat__avatar" aria-hidden="true">
              <span v-if="msg.role === 'user'">You</span>
              <span v-else>AI</span>
            </div>
            <div class="metric-ai-chat__bubble">
              <div class="metric-ai-chat__content">{{ msg.content }}</div>
            </div>
          </div>
        </div>

        <form class="metric-ai-chat__composer" @submit.prevent="sendChatMessage()">
          <label class="metric-ai-chat__input" aria-label="Chat input">
            <textarea
              ref="chatInputRef"
              v-model="chatDraft"
              rows="2"
              placeholder="Ask about the selected object, KPIs, or table rows…"
              @keydown="handleChatKeydown"
            ></textarea>
          </label>
          <button class="metric-ai-chat__send" type="submit" :disabled="!chatDraft.trim() || chatIsBusy">
            <ArrowRight :size="16" />
            <span>{{ chatIsBusy ? 'Busy' : 'Send' }}</span>
          </button>
        </form>
      </aside>

      <Transition name="metrics-create-slide">
        <aside
          v-if="isCreateOpen"
          class="metrics-panel__create metric-ai-panel__create"
          aria-label="Create metric"
          @click.stop
        >
          <header class="metrics-create__header">
            <div>
              <div class="metrics-create__title">
                <Plus :size="14" />
                <span>Create metric</span>
              </div>
              <div class="metrics-create__hint">Visual-only prototype</div>
            </div>

            <div class="metrics-create__header-actions">
              <button class="metrics-create__close" type="button" aria-label="Close create panel" @click="closeCreatePanel">
                <X :size="16" />
              </button>
            </div>
          </header>

          <div class="metrics-create__body">
            <div class="metrics-create__notice">
              <div class="metrics-create__notice-title">Not persisted</div>
              <div class="metrics-create__notice-copy">
                This form is for layout demonstration only. Submit will log configuration to the console.
              </div>
            </div>

            <div class="metrics-create__body-spacer" style="height: 12px"></div>

            <form class="metrics-create__form" @submit.prevent="submitCreatePanel">
              <label class="metrics-create__field">
                <span>Chart type</span>
                <select v-model="createDraft.chartType">
                  <option v-for="option in chartTypeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </label>

              <label class="metrics-create__field">
                <span>Object type</span>
                <select v-model="createDraft.objectTypeId">
                  <option v-for="ot in objectTypes" :key="ot.id" :value="ot.id">
                    {{ ot.displayName }}
                  </option>
                </select>
                <div class="metrics-create__helper">Choose the ObjectType the metric is associated with.</div>
              </label>

              <label class="metrics-create__field">
                <span>Property</span>
                <select v-model="createDraft.propertyKey" :disabled="createPropertyOptions.length === 0">
                  <option v-for="prop in createPropertyOptions" :key="prop.id" :value="prop.apiName || prop.id">
                    {{ prop.displayName || prop.apiName || prop.id }}
                  </option>
                </select>
                <div class="metrics-create__helper">Select the property used as the measure.</div>
              </label>

              <label class="metrics-create__field">
                <span>Dimension</span>
                <select v-model="createDraft.dimensionKey">
                  <option v-for="option in dimensionOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </label>

              <label class="metrics-create__field">
                <span>Aggregation</span>
                <select v-model="createDraft.aggregation">
                  <option v-for="option in aggregationOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </label>
            </form>
          </div>

          <footer class="metrics-create__footer">
            <button class="metrics-create__btn" type="button" @click="closeCreatePanel">Cancel</button>
            <button class="metrics-create__btn metrics-create__btn--primary" type="button" @click="submitCreatePanel">
              Add
            </button>
          </footer>
        </aside>
      </Transition>
    </div>
  </aside>
</template>
