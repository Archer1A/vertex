<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  ChevronRight,
  ClipboardList,
  Factory,
  Layers,
  PackageOpen,
  Search,
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

  /*

  if (isObjectTypeView.value) {
    if (props.objectType.id === PROJECT_LINE_ITEM_OBJECT_TYPE_ID) {
      const instances = objectTypeInstances.value
      const count = instances.length
      const orderedQty = sumNumber(instances, ['quantity'])
      const hasDemand = instances.filter((instance) => getLinkedTargets(instance.id, LINE_ITEM_TO_DEMAND_LINK_TYPE_ID).length > 0).length
      const demandCoverageRate = count > 0 ? Math.round((hasDemand / count) * 100) : 0

      const commitDeltas = instances
        .map((instance) => {
          const confirmed = parseDate(instance.properties.confirmed_delivery_date ?? instance.properties.confirmedDeliveryDate ?? null)
          const requested = parseDate(instance.properties.requested_delivery_date ?? instance.properties.requestedDeliveryDate ?? null)
          return confirmed && requested ? diffDays(confirmed, requested) : null
        })
        .filter((value): value is number => value !== null)
      const avgCommitDelta = commitDeltas.length ? Math.round(commitDeltas.reduce((a, b) => a + b, 0) / commitDeltas.length) : 0

      const nearDueNotScheduled = instances.filter((instance) => {
        const confirmed = parseDate(instance.properties.confirmed_delivery_date ?? null)
        const status = toDisplayString(instance.properties.production_status ?? '')
        if (!confirmed) return false
        const daysLeft = diffDays(confirmed, today.value)
        return status === '待排产' && daysLeft >= 0 && daysLeft <= NEAR_DUE_DAYS
      }).length

      const estimatedLate = instances.filter((instance) => {
        const estimatedEnd = parseDate(instance.properties.estimated_production_end_date ?? null)
        const confirmed = parseDate(instance.properties.confirmed_delivery_date ?? null)
        return Boolean(estimatedEnd && confirmed && estimatedEnd.getTime() > confirmed.getTime())
      }).length

      return [
        { label: 'Line Items', value: formatNumber(count), helper: 'Count', icon: ClipboardList },
        { label: 'Ordered Qty', value: formatNumber(orderedQty), helper: 'Σ quantity', icon: BarChart3 },
        { label: 'Demand Coverage', value: `${demandCoverageRate}%`, helper: 'Has demands / total', icon: BadgeCheck, tone: demandCoverageRate < 80 ? 'warning' : 'success' },
        { label: 'Near-due Unsched', value: formatNumber(nearDueNotScheduled), helper: `<= ${NEAR_DUE_DAYS}d`, icon: AlertTriangle, tone: nearDueNotScheduled > 0 ? 'warning' : 'default' },
        { label: 'Est. Late', value: formatNumber(estimatedLate), helper: 'Est end > confirmed', icon: AlertTriangle, tone: estimatedLate > 0 ? 'danger' : 'default' },
        { label: 'Avg Commit Δ', value: `${avgCommitDelta}d`, helper: 'Confirmed - requested', icon: CalendarDays }
      ]
    }

    if (props.objectType.id === MATERIAL_DEMAND_OBJECT_TYPE_ID) {
      const instances = objectTypeInstances.value
      const count = instances.length
      const qty = sumNumber(instances, ['quantity'])

      const statusCounts = instances.reduce<Record<string, number>>((acc, instance) => {
        const status = toDisplayString(instance.properties.status ?? '') || 'Unknown'
        acc[status] = (acc[status] ?? 0) + 1
        return acc
      }, {})

      const unmet = statusCounts['未满足'] ?? 0

      const overdueLatestOrder = instances.filter((instance) => {
        const latest = parseDate(instance.properties.latest_order_date ?? null)
        const status = toDisplayString(instance.properties.status ?? '')
        return Boolean(latest && latest.getTime() < today.value.getTime() && status !== '已满足')
      }).length

      const overdueDemandDate = instances.filter((instance) => {
        const due = parseDate(instance.properties.demand_date ?? null)
        const status = toDisplayString(instance.properties.status ?? '')
        return Boolean(due && due.getTime() < today.value.getTime() && status !== '已满足')
      }).length

      const topStatus = Object.entries(statusCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([status, value]) => `${status} ${value}`)
        .join(' · ')

      return [
        { label: 'Demands', value: formatNumber(count), helper: 'Count', icon: ClipboardList },
        { label: 'Demand Qty', value: formatNumber(qty), helper: 'Σ quantity', icon: BarChart3 },
        { label: 'Unmet', value: formatNumber(unmet), helper: 'status=未满足', icon: AlertTriangle, tone: unmet > 0 ? 'warning' : 'default' },
        { label: 'Overdue (Latest)', value: formatNumber(overdueLatestOrder), helper: 'latest < today', icon: AlertTriangle, tone: overdueLatestOrder > 0 ? 'danger' : 'default' },
        { label: 'Overdue (Due)', value: formatNumber(overdueDemandDate), helper: 'demand < today', icon: AlertTriangle, tone: overdueDemandDate > 0 ? 'danger' : 'default' },
        { label: 'Status Mix', value: topStatus || '-', helper: 'Top 2 statuses', icon: Layers }
      ]
    }

    if (props.objectType.id === PRODUCTION_ORDER_OBJECT_TYPE_ID) {
      const instances = objectTypeInstances.value
      const count = instances.length
      const qty = sumNumber(instances, ['quantity'])

      const wipQty = instances
        .filter((instance) => ['已排产', '生产中'].includes(toDisplayString(instance.properties.status ?? '')))
        .reduce((acc, instance) => acc + Number(instance.properties.quantity ?? 0), 0)

      const hasDemand = instances.filter((instance) => getLinkedTargets(instance.id, PRODUCTION_ORDER_TO_DEMAND_LINK_TYPE_ID).length > 0).length
      const hasPlant = instances.filter((instance) => getLinkedTargets(instance.id, PRODUCTION_ORDER_TO_PLANT_LINK_TYPE_ID).length > 0).length

      const demandCoverageRate = count > 0 ? Math.round((hasDemand / count) * 100) : 0
      const plantCoverageRate = count > 0 ? Math.round((hasPlant / count) * 100) : 0

      return [
        { label: 'Work Orders', value: formatNumber(count), helper: 'Count', icon: ClipboardList },
        { label: 'Planned Qty', value: formatNumber(qty), helper: 'Σ quantity', icon: BarChart3 },
        { label: 'WIP Qty', value: formatNumber(wipQty), helper: 'status=已排产/生产中', icon: PackageOpen, tone: wipQty > 0 ? 'info' : 'default' },
        { label: 'Demand Coverage', value: `${demandCoverageRate}%`, helper: 'Has demands / total', icon: BadgeCheck, tone: demandCoverageRate < 80 ? 'warning' : 'success' },
        { label: 'Plant Coverage', value: `${plantCoverageRate}%`, helper: 'Has plant / total', icon: Factory, tone: plantCoverageRate < 80 ? 'warning' : 'success' },
        { label: 'Near-due Risk', value: '-', helper: 'Requires actual events', icon: AlertTriangle }
      ]
    }

    return []
  }

  const record = instanceRecord.value
  if (!record) {
    return []
  }

  if (record.objectTypeId === PROJECT_LINE_ITEM_OBJECT_TYPE_ID) {
    const demands = getLinkedTargets(record.id, LINE_ITEM_TO_DEMAND_LINK_TYPE_ID)
    const demandQty = sumNumber(demands, ['quantity'])
    const overdueLatest = demands.filter((demand) => {
      const latest = parseDate(demand.properties.latest_order_date ?? null)
      const status = toDisplayString(demand.properties.status ?? '')
      return Boolean(latest && latest.getTime() < today.value.getTime() && status !== '已满足')
    }).length

    return [
      { label: 'Quantity', value: formatNumber(Number(record.properties.quantity ?? 0)), helper: 'Ordered', icon: BarChart3 },
      { label: 'Production Status', value: toDisplayString(record.properties.production_status ?? '-'), helper: 'Line item', icon: Layers },
      { label: 'Demands', value: formatNumber(demands.length), helper: 'Linked demands', icon: ClipboardList },
      { label: 'Demand Qty', value: formatNumber(demandQty), helper: 'Σ demand.quantity', icon: BarChart3 },
      { label: 'Overdue Demands', value: formatNumber(overdueLatest), helper: 'latest < today', icon: AlertTriangle, tone: overdueLatest > 0 ? 'danger' : 'default' }
    ]
  }

  if (record.objectTypeId === MATERIAL_DEMAND_OBJECT_TYPE_ID) {
    const latest = parseDate(record.properties.latest_order_date ?? null)
    const due = parseDate(record.properties.demand_date ?? null)
    const latestLeft = latest ? diffDays(latest, today.value) : null
    const dueLeft = due ? diffDays(due, today.value) : null
    const workOrders = getLinkedSources(record.id, PRODUCTION_ORDER_TO_DEMAND_LINK_TYPE_ID)
    const materials = getLinkedTargets(record.id, DEMAND_TO_MATERIAL_LINK_TYPE_ID)

    const riskScore =
      (latest && latest.getTime() < today.value.getTime() ? 2 : 0) +
      (toDisplayString(record.properties.status ?? '') === '未满足' ? 2 : 0)

    return [
      { label: 'Quantity', value: formatNumber(Number(record.properties.quantity ?? 0)), helper: 'Demand', icon: BarChart3 },
      { label: 'Status', value: toDisplayString(record.properties.status ?? '-'), helper: 'Demand status', icon: Layers },
      { label: 'Latest Order', value: latestLeft === null ? '-' : `${latestLeft}d`, helper: 'Days left', icon: CalendarDays, tone: latestLeft !== null && latestLeft < 0 ? 'danger' : 'default' },
      { label: 'Demand Due', value: dueLeft === null ? '-' : `${dueLeft}d`, helper: 'Days left', icon: CalendarDays, tone: dueLeft !== null && dueLeft < 0 ? 'danger' : 'default' },
      { label: 'Work Orders', value: formatNumber(workOrders.length), helper: 'Linked', icon: Factory },
      { label: 'Materials', value: formatNumber(materials.length), helper: 'Linked', icon: PackageOpen },
      { label: 'Risk Score', value: String(riskScore), helper: 'Rule-based v1', icon: AlertTriangle, tone: riskScore >= 3 ? 'danger' : riskScore >= 1 ? 'warning' : 'default' }
    ]
  }

  if (record.objectTypeId === PRODUCTION_ORDER_OBJECT_TYPE_ID) {
    const plannedStart = parseDate(record.properties.planned_start_date ?? null)
    const plannedEnd = parseDate(record.properties.planned_end_date ?? null)
    const plannedEndLeft = plannedEnd ? diffDays(plannedEnd, today.value) : null
    const demands = getLinkedTargets(record.id, PRODUCTION_ORDER_TO_DEMAND_LINK_TYPE_ID)
    const plants = getLinkedTargets(record.id, PRODUCTION_ORDER_TO_PLANT_LINK_TYPE_ID)
    const completionProxy = toDisplayString(record.properties.status ?? '') === '已完成' ? 100 : 0

    return [
      { label: 'Quantity', value: formatNumber(Number(record.properties.quantity ?? 0)), helper: 'Planned', icon: BarChart3 },
      { label: 'Status', value: toDisplayString(record.properties.status ?? '-'), helper: 'Work order', icon: Layers },
      { label: 'Planned Start', value: plannedStart ? plannedStart.toISOString().slice(0, 10) : '-', helper: 'Date', icon: CalendarDays },
      { label: 'Planned End', value: plannedEnd ? plannedEnd.toISOString().slice(0, 10) : '-', helper: plannedEndLeft === null ? 'Date' : `${plannedEndLeft}d left`, icon: CalendarDays, tone: plannedEndLeft !== null && plannedEndLeft < 0 ? 'danger' : 'default' },
      { label: 'Demands', value: formatNumber(demands.length), helper: 'Linked', icon: ClipboardList },
      { label: 'Plant', value: plants[0] ? getInstanceTitle(plants[0]) : '-', helper: 'Assigned', icon: Factory },
      { label: 'Completion', value: `${completionProxy}%`, helper: 'Proxy (v1)', icon: BadgeCheck, tone: completionProxy === 100 ? 'success' : 'default' }
    ]
  }

  */
  return []
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
</script>

<template>
  <aside class="metrics-panel" aria-label="Metrics" @click.stop>
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

    <div class="metrics-panel__body">
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

        <div v-if="chartMetrics.length" class="metrics-widget-grid" aria-label="Charts">
          <MetricsChartWidget
            v-for="metric in chartMetrics"
            :key="`${metric.type}-${metric.title}`"
            :metric="metric"
          />
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
  </aside>
</template>
