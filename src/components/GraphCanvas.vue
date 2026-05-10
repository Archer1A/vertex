<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import type {
  AddObjectPayload,
  AddObjectTypePayload,
  GraphEdgeData,
  GraphNodeData,
  GraphNodeDisplayData,
  InstanceFilterPayload,
  SearchAroundAddPayload,
  SelectedObject
} from '../types/graph'
import { groupNodesByIds } from '../utils/graphGrouping'
import {
  getLinkTypeById,
  getObjectTypeById,
  getEventBadgeColor,
  getEventsForObjectInstance,
  linkTypes,
  linkInstances,
  objectInstances,
  objectTypes,
  type LinkType,
  type ObjectInstance,
  type PropertyType,
  type PropertyValue,
  type TimeSeriesValue
} from '../mock/mock'
import FloatingControls from './FloatingControls.vue'
import GraphNode from './GraphNode.vue'
import LeftSelectionPanel from './LeftSelectionPanel.vue'
import MainToolbar from './MainToolbar.vue'
import MetricAIPanel from './MetricAIPanel.vue'
import RightVerticalPanel from './RightVerticalPanel.vue'
import SearchAroundPanel from './SearchAroundPanel.vue'

defineProps<{
  activeSheetIndex: number
}>()

const canvasRef = ref<HTMLElement | null>(null)
const selectedNodeId = ref('')
const selectedNodeIds = ref<string[]>([])
const isSearchAroundOpen = ref(false)
const isMetricsPanelOpen = ref(false)
const metricsNodeId = ref('')
const searchAroundStartNodeId = ref('')
const searchAroundLinkType = ref<LinkType | null>(null)
const nodeTool = reactive({ open: false, nodeId: '', x: 0, y: 0 })
const objectTypeChooser = reactive({ open: false, nodeId: '', x: 0, y: 0 })
const instanceFilters = reactive<Record<string, InstanceFilterPayload | undefined>>({})
const ownedExpandedInstanceIdsByObjectTypeNodeId = new Map<string, Set<string>>()
const expandedEdgeInstanceIdsByObjectTypeNodeId = new Map<string, Set<string>>()

const graphNodes = reactive<GraphNodeData[]>([])
const graphEdges = reactive<GraphEdgeData[]>([])

const pinnedPropertyApiNamesByObjectTypeId = reactive<Record<string, string[]>>({})

const panelPosition = reactive({ x: 8, y: 8 })
const dragState = reactive({
  dragging: false,
  pointerId: 0,
  nodeId: '',
  offsetX: 0,
  offsetY: 0,
  moved: false
})

const doubleClickState = reactive({ lastNodeId: '', lastAt: 0 })

const panelStyle = computed(() => ({
  left: `${panelPosition.x}px`,
  top: `${panelPosition.y}px`
}))

const graphStats = computed(() => ({
  objects: objectTypes.length,
  nodes: graphNodes.length,
  edges: graphEdges.length
}))

const selectedGraphNode = computed(() => {
  return graphNodes.find((node) => node.id === selectedNodeId.value) ?? null
})

const metricsGraphNode = computed(() => {
  return graphNodes.find((node) => node.id === metricsNodeId.value) ?? null
})

const metricsObjectType = computed(() => {
  if (!metricsGraphNode.value) {
    return null
  }

  return getObjectTypeById(metricsGraphNode.value.objectTypeId) ?? null
})

const metricsFilteredInstances = computed(() => {
  if (!metricsGraphNode.value || metricsGraphNode.value.nodeKind !== 'objectType') {
    return undefined
  }

  return getFilteredObjectInstances(metricsGraphNode.value.objectTypeId)
})

const contextGraphNode = computed(() => {
  return graphNodes.find((node) => node.id === nodeTool.nodeId) ?? null
})

const contextGraphNodeIsObjectType = computed(() => {
  return contextGraphNode.value?.nodeKind === 'objectType'
})

const selectedGraphNodes = computed(() => {
  const selectedIds = new Set(selectedNodeIds.value)
  return graphNodes.filter((node) => selectedIds.has(node.id))
})

const canGroupSelectedNodes = computed(() => {
  if (selectedGraphNodes.value.length < 2) {
    return false
  }

  return new Set(selectedGraphNodes.value.map((node) => node.objectTypeId)).size === 1
})

const selectedObjectForPanel = computed<SelectedObject | null>(() => {
  return selectedGraphNode.value ? toSelectedObject(selectedGraphNode.value) : null
})

const pinnedPropertyApiNamesForPanel = computed(() => {
  const objectTypeId = selectedObjectForPanel.value?.objectTypeId
  if (!objectTypeId) return []
  return pinnedPropertyApiNamesByObjectTypeId[objectTypeId] ?? []
})

const searchAroundStartNode = computed(() => {
  return graphNodes.find((node) => node.id === searchAroundStartNodeId.value) ?? null
})

const searchAroundSelectedObject = computed<SelectedObject | null>(() => {
  return searchAroundStartNode.value ? toSelectedObject(searchAroundStartNode.value) : null
})

const associatedObjectTypeOptions = computed(() => {
  const node = graphNodes.find((item) => item.id === objectTypeChooser.nodeId)

  if (!node) {
    return []
  }

  const options = linkTypes
    .filter((linkType) => linkType.sourceObjectTypeId === node.objectTypeId || linkType.targetObjectTypeId === node.objectTypeId)
    .map((linkType) => {
      const objectTypeId =
        linkType.sourceObjectTypeId === node.objectTypeId ? linkType.targetObjectTypeId : linkType.sourceObjectTypeId
      const objectType = getObjectTypeById(objectTypeId)

      if (!objectType) {
        return null
      }

      return {
        objectType,
        linkType,
        count: countLinkedObjects(node, linkType)
      }
    })
    .filter((option): option is NonNullable<typeof option> => option !== null)

  return options.filter((option, index, allOptions) => {
    return allOptions.findIndex((item) => item.objectType.id === option.objectType.id) === index
  })
})

const nodeGroups = computed(() =>
  objectTypes.map((objectType) => ({
    objectTypeId: objectType.id,
    displayName: objectType.displayName,
    apiName: objectType.apiName,
    icon: objectType.icon,
    color: objectType.color,
    count: graphNodes.filter((node) => node.objectTypeId === objectType.id).length
  })).sort((a, b) => {
    if (a.apiName === 'flight') {
      return -1
    }

    if (b.apiName === 'flight') {
      return 1
    }

    return a.displayName.localeCompare(b.displayName)
  })
)

const edgeLines = computed(() =>
  graphEdges
    .map((edge) => {
      const source = graphNodes.find((node) => node.id === edge.source)
      const target = graphNodes.find((node) => node.id === edge.target)

      if (!source || !target) {
        return null
      }

      return {
        ...edge,
        x1: source.x,
        y1: source.y,
        x2: target.x - (target.x - source.x) * 0.08,
        y2: target.y - (target.y - source.y) * 0.08
      }
    })
    .filter((edge): edge is NonNullable<typeof edge> => edge !== null)
)

function isGeoPoint(value: PropertyValue): value is { latitude: number; longitude: number } {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && 'latitude' in value
}

function isTimeSeriesValue(value: unknown): value is TimeSeriesValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'granularity' in value &&
    'points' in value
  )
}

function getTimeSeriesForInstance(instance: ObjectInstance, objectTypeId: string): NonNullable<SelectedObject['timeSeries']> {
  const objectType = getObjectTypeById(objectTypeId)
  if (!objectType) return []

  return objectType.properties
    .filter((property) => property.baseType === 'timeseries')
    .map((property) => {
      const raw = instance.properties[property.apiName] ?? instance.properties[property.id]
      if (!isTimeSeriesValue(raw)) return null
      return {
        apiName: property.apiName,
        displayName: property.displayName,
        unit: raw.unit,
        granularity: raw.granularity,
        points: raw.points
      }
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
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

function getInstancePropertyText(instance: ObjectInstance, property: Pick<PropertyType, 'apiName' | 'id'>) {
  return toDisplayString(getInstancePropertyValue(instance, property))
}

function getInstanceLabel(instance: ObjectInstance) {
  const objectType = getObjectTypeById(instance.objectTypeId)
  const titleProperty = objectType?.properties.find((property) => property.id === objectType.titlePropertyId)
  const title = titleProperty ? getInstancePropertyText(instance, titleProperty) : ''

  return title || instance.id
}

function getObjectTypeName(objectTypeId: string) {
  return getObjectTypeById(objectTypeId)?.displayName ?? objectTypeId
}

function clampPercent(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getDefaultNodePosition(instance: ObjectInstance, index: number) {
  void instance
  const fallbackPosition = {
    x: 48 + (index % 4) * 8,
    y: 42 + Math.floor(index / 4) * 10
  }
  return fallbackPosition
}

function getAnchoredNodePosition(anchor: GraphNodeData, index: number, total: number) {
  const angle = total <= 1 ? 0 : (Math.PI * 2 * index) / total
  const radius = 16

  return {
    x: clampPercent(anchor.x + Math.cos(angle) * radius, 8, 92),
    y: clampPercent(anchor.y + Math.sin(angle) * radius, 10, 90)
  }
}

function createGraphNode(instance: ObjectInstance, index: number, anchor?: GraphNodeData, total = 1): GraphNodeData {
  const position = anchor ? getAnchoredNodePosition(anchor, index, total) : getDefaultNodePosition(instance, graphNodes.length + index)
  const relatedEvents = getEventsForObjectInstance(instance.id)

  return {
    id: instance.id,
    label: getInstanceLabel(instance),
    nodeKind: 'objectInstance',
    type: getNodeType(instance.objectTypeId),
    objectTypeId: instance.objectTypeId,
    instance,
    eventIds: relatedEvents.map((event) => event.id),
    x: position.x,
    y: position.y
  }
}

function createObjectTypeGraphNode(payload: AddObjectTypePayload): GraphNodeData | null {
  const objectType = getObjectTypeById(payload.objectTypeId)

  if (!objectType) {
    return null
  }

  const index = graphNodes.filter((node) => node.nodeKind === 'objectType').length
  const position = {
    x: clampPercent(42 + index * 8, 12, 88),
    y: clampPercent(32 + index * 6, 12, 82)
  }

  return {
    id: `object_type_node_${objectType.id}`,
    label: objectType.displayName,
    nodeKind: 'objectType',
    type: getNodeType(objectType.id),
    objectTypeId: objectType.id,
    instance: {
      id: `object_type_node_${objectType.id}`,
      objectTypeId: objectType.id,
      properties: {}
    },
    x: position.x,
    y: position.y
  }
}

function getNodeType(objectTypeId: string): GraphNodeData['type'] {
  if (objectTypeId === 'object_type_production_order') return 'flight'
  if (objectTypeId === 'object_type_material_demand') return 'event'
  return 'airport'
}

function addNodeIfMissing(instance: ObjectInstance, index: number, anchor?: GraphNodeData, total = 1) {
  const existingNode = graphNodes.find((node) => node.id === instance.id)

  if (existingNode) {
    return existingNode
  }

  const node = createGraphNode(instance, index, anchor, total)
  graphNodes.push(node)
  return node
}

function getObjectTypeInstanceFilterProperties(objectTypeId: string): NonNullable<SelectedObject['instanceProperties']> {
  return getObjectTypeById(objectTypeId)?.properties.map((property) => ({
    apiName: property.apiName,
    displayName: property.displayName,
    baseType: property.baseType
  })) ?? []
}

function matchesInstanceFilter(instance: ObjectInstance, filter: InstanceFilterPayload | undefined) {
  if (!filter || filter.value.trim() === '') {
    return true
  }

  const objectType = getObjectTypeById(filter.objectTypeId)
  const property = objectType?.properties.find((property) => {
    return property.apiName === filter.propertyApiName || property.id === filter.propertyApiName
  })

  if (!property) {
    return false
  }

  return getInstancePropertyText(instance, property) === filter.value
}

function getFilteredObjectInstances(objectTypeId: string) {
  const filter = instanceFilters[objectTypeId]

  return objectInstances.filter((instance) => instance.objectTypeId === objectTypeId && matchesInstanceFilter(instance, filter))
}

function getObjectTypeInstancesForSelection(objectTypeId: string): NonNullable<SelectedObject['instances']> {
  return getFilteredObjectInstances(objectTypeId).map((instance) => ({
    id: instance.id,
    title: getInstanceLabel(instance),
    subtitle: instance.id
  }))
}

function toSelectedObject(node: GraphNodeData): SelectedObject {
  const objectType = getObjectTypeById(node.objectTypeId)

  if (node.nodeKind === 'objectType') {
    const properties =
      objectType?.properties.map((property) => ({
        key: property.displayName,
        value: `${property.baseType}${property.required ? ' required' : ''}`,
        apiName: property.apiName
      })) ?? []

    return {
      title: objectType?.displayName ?? node.label,
      subtitle: 'ObjectType',
      nodeLabel: node.label,
      nodeKind: node.nodeKind,
      objectTypeId: node.objectTypeId,
      properties,
      instanceProperties: getObjectTypeInstanceFilterProperties(node.objectTypeId),
      appliedInstanceFilter: instanceFilters[node.objectTypeId] ?? null,
      instances: getObjectTypeInstancesForSelection(node.objectTypeId),
      events: (() => {
          const toText = (value: unknown) => (value === null || value === undefined ? '' : String(value))
          const filteredInstances = getFilteredObjectInstances(node.objectTypeId)
          const seenEventIds = new Set<string>()
          const allEvents: NonNullable<SelectedObject['events']> = []

          for (const instance of filteredInstances) {
            for (const eventInstance of getEventsForObjectInstance(instance.id)) {
              if (seenEventIds.has(eventInstance.id)) continue
              seenEventIds.add(eventInstance.id)

              const eventProperties = eventInstance.properties ?? {}
              const title = toText(eventProperties.event_title || eventProperties.event_id || eventInstance.id)
              const severity = toText(eventProperties.severity)
              const subtitle = severity ? `Severity: ${severity}` : 'Event'

              allEvents.push({
                id: eventInstance.id,
                title,
                subtitle,
                properties: [
                  { key: 'Event Title', value: title },
                  { key: 'Event Type', value: toText(eventProperties.event_type) },
                  { key: 'Severity', value: severity },
                  { key: 'Started At', value: toText(eventProperties.event_time) },
                  { key: 'Summary', value: toText(eventProperties.event_summary) }
                ].filter((item) => item.value.trim() !== '')
              })
            }
          }

          return allEvents
        })()
    }
  }

  const properties =
    objectType?.properties
      .filter((property) => property.baseType !== 'timeseries')
      .map((property) => ({
        key: property.displayName,
        value: getInstancePropertyText(node.instance, property),
        apiName: property.apiName
      })) ?? []

  const toText = (value: unknown) => (value === null || value === undefined ? '' : String(value))
  const relatedEvents = getEventsForObjectInstance(node.id)
  const events: NonNullable<SelectedObject['events']> = relatedEvents.map((eventInstance) => {
    const properties = eventInstance.properties ?? {}
    const title = toText(properties.event_title || properties.event_id || eventInstance.id)
    const severity = toText(properties.severity)
    const subtitle = severity ? `Severity: ${severity}` : 'Event'

    return {
      id: eventInstance.id,
      title,
      subtitle,
      properties: [
        { key: 'Event Title', value: title },
        { key: 'Event Type', value: toText(properties.event_type) },
        { key: 'Severity', value: severity },
        { key: 'Started At', value: toText(properties.event_time) },
        { key: 'Summary', value: toText(properties.event_summary) }
      ].filter((item) => item.value.trim() !== '')
    }
  })

  return {
    title: node.label,
    subtitle: objectType?.displayName ?? node.objectTypeId,
    nodeLabel: node.label,
    nodeKind: node.nodeKind,
    objectTypeId: node.objectTypeId,
    properties,
    timeSeries: getTimeSeriesForInstance(node.instance, node.objectTypeId),
    events
  }
}

function countLinkedObjects(node: GraphNodeData, linkType: LinkType) {
  if (node.nodeKind === 'objectType') return 0
  return getRelatedInstances(node, linkType).length
}

function getRelatedInstances(startNode: GraphNodeData, linkType: LinkType) {
  if (startNode.nodeKind === 'objectType') return []

  const isSource = startNode.objectTypeId === linkType.sourceObjectTypeId
  const isTarget = startNode.objectTypeId === linkType.targetObjectTypeId

  if (!isSource && !isTarget) return []

  const relatedIds = new Set(
    linkInstances
      .filter((linkInstance) => {
        if (linkInstance.linkTypeId !== linkType.id) return false
        return isSource
          ? linkInstance.sourceObjectInstanceId === startNode.id
          : linkInstance.targetObjectInstanceId === startNode.id
      })
      .map((linkInstance) => (isSource ? linkInstance.targetObjectInstanceId : linkInstance.sourceObjectInstanceId))
  )

  return objectInstances.filter((instance) => relatedIds.has(instance.id))
}

function createRelationshipEdge(startNode: GraphNodeData, resultNode: GraphNodeData, linkType: LinkType): GraphEdgeData | null {
  const source = startNode.objectTypeId === linkType.sourceObjectTypeId ? startNode.id : resultNode.id
  const target = startNode.objectTypeId === linkType.targetObjectTypeId ? startNode.id : resultNode.id

  if (source === target) {
    return null
  }

  return {
    id: `${source}-${linkType.id}-${target}`,
    source,
    target,
    label: getRelationshipLabel(linkType),
    linkTypeId: linkType.id
  }
}

function createObjectTypeRelationshipEdge(startNode: GraphNodeData, resultNode: GraphNodeData, linkType: LinkType): GraphEdgeData | null {
  const source = startNode.objectTypeId === linkType.sourceObjectTypeId ? startNode.id : resultNode.id
  const target = startNode.objectTypeId === linkType.targetObjectTypeId ? startNode.id : resultNode.id

  if (source === target) {
    return null
  }

  return {
    id: `${source}-${linkType.id}-${target}`,
    source,
    target,
    label: linkType.displayName,
    linkTypeId: linkType.id
  }
}

function getRelationshipLabel(linkType: LinkType) {
  return linkType.displayName || linkType.apiName
}

function getNodeEventCount(node: GraphNodeData) {
  if (node.nodeKind === 'objectType') {
    const instances = getFilteredObjectInstances(node.objectTypeId)
    return instances.reduce((count, instance) => count + getEventsForObjectInstance(instance.id).length, 0)
  }
  return node.eventIds?.length ?? getEventsForObjectInstance(node.id).length
}

function getNodeEventBadgeColor(node: GraphNodeData) {
  if (node.nodeKind === 'objectType') {
    const instances = getFilteredObjectInstances(node.objectTypeId)
    for (const instance of instances) {
      const events = getEventsForObjectInstance(instance.id)
      if (events.length) return getEventBadgeColor(events[0])
    }
    return undefined
  }
  const events = getEventsForObjectInstance(node.id)
  return events.length ? getEventBadgeColor(events[0]) : undefined
}

function displayOrDash(value: string) {
  return value.trim() ? value : '-'
}

function metric(label: string, value: string, title?: string): GraphNodeDisplayData['metrics'][number] {
  const resolvedValue = displayOrDash(value)

  return {
    label,
    value: resolvedValue,
    title: title ?? `${label}: ${resolvedValue}`
  }
}

function getBadgeTone(label: string): GraphNodeDisplayData['badges'][number]['tone'] {
  const normalizedLabel = label.toLowerCase()

  if (['failed', 'critical', 'high', 'degraded', 'quarantined'].some((keyword) => normalizedLabel.includes(keyword))) {
    return 'danger'
  }

  if (['warning', 'medium'].some((keyword) => normalizedLabel.includes(keyword))) {
    return 'warning'
  }

  if (['running', 'passed', 'active'].some((keyword) => normalizedLabel.includes(keyword))) {
    return 'success'
  }

  return 'info'
}

function badge(label: string, tone?: GraphNodeDisplayData['badges'][number]['tone']): GraphNodeDisplayData['badges'][number] {
  const resolvedLabel = displayOrDash(label)

  return {
    label: resolvedLabel,
    tone: tone ?? getBadgeTone(resolvedLabel),
    title: resolvedLabel
  }
}

function compactBadgeList(badges: GraphNodeDisplayData['badges']) {
  return badges.filter((item) => item.label !== '-').slice(0, 3)
}

function getNodeDisplayData(node: GraphNodeData): GraphNodeDisplayData {
  const objectType = getObjectTypeById(node.objectTypeId)
  const title = node.label
  const subtitle = node.nodeKind === 'objectType' ? 'ObjectType' : objectType?.displayName ?? node.objectTypeId
  const accentColor = objectType?.color ?? (node.type === 'flight' ? '#2563eb' : node.type === 'event' ? '#dc2626' : '#8b3f9f')

  if (node.nodeKind === 'objectType') {
    const instanceCount = getFilteredObjectInstances(node.objectTypeId).length
    const linkCount = linkTypes.filter((linkType) => {
      return linkType.sourceObjectTypeId === node.objectTypeId || linkType.targetObjectTypeId === node.objectTypeId
    }).length

    return {
      title,
      subtitle,
      accentColor,
      icon: node.type,
      metrics: [
        metric('Schema', String(objectType?.properties.length ?? 0), 'Property count'),
        metric('Records', String(instanceCount), 'Instance count'),
        metric('Links', String(linkCount), 'Relationship type count')
      ],
      badges: compactBadgeList([
        badge('ObjectType', 'info'),
        badge(objectType?.status ?? '-', 'success'),
        badge(objectType?.apiName ?? node.objectTypeId, 'neutral')
      ])
    }
  }

  const pinnedApiNames = pinnedPropertyApiNamesByObjectTypeId[node.objectTypeId] ?? []
  const chips =
    pinnedApiNames
      .map((apiName) => {
        const property = objectType?.properties.find((candidate) => candidate.apiName === apiName)
        if (!property) {
          return null
        }

        return {
          key: property.displayName,
          value: getInstancePropertyText(node.instance, property)
        }
      })
      .filter((chip): chip is NonNullable<typeof chip> => chip !== null)
      .slice(0, 2)

  const statusProperty = objectType?.properties.find((property) => property.apiName.toLowerCase().includes('status'))
  const quantityProperty = objectType?.properties.find((property) => property.apiName.toLowerCase().includes('quantity'))
  const dateProperty = objectType?.properties.find((property) => property.baseType === 'date' || property.baseType === 'datetime')
  const primaryKeyProperty = objectType?.properties.find((property) => property.id === objectType.primaryKeyPropertyId)

  const instanceMetrics: GraphNodeDisplayData['metrics'] = []

  if (quantityProperty) {
    instanceMetrics.push(metric(quantityProperty.displayName, getInstancePropertyText(node.instance, quantityProperty), quantityProperty.apiName))
  }

  if (statusProperty) {
    instanceMetrics.push(metric(statusProperty.displayName, getInstancePropertyText(node.instance, statusProperty), statusProperty.apiName))
  }

  if (dateProperty) {
    instanceMetrics.push(metric(dateProperty.displayName, getInstancePropertyText(node.instance, dateProperty), dateProperty.apiName))
  }

  if (instanceMetrics.length === 0 && primaryKeyProperty) {
    instanceMetrics.push(metric(primaryKeyProperty.displayName, getInstancePropertyText(node.instance, primaryKeyProperty), primaryKeyProperty.apiName))
  }

  return {
    title,
    subtitle,
    accentColor,
    icon: node.type,
    chips: chips.length ? chips : undefined,
    metrics: instanceMetrics.slice(0, 3),
    badges: compactBadgeList([
      badge(statusProperty ? getInstancePropertyText(node.instance, statusProperty) : '-', 'neutral'),
      badge(objectType?.apiName ?? node.objectTypeId, 'info'),
      badge(node.instance.id, 'neutral')
    ])
  }
}

function handleTogglePinnedProperty(payload: { objectTypeId: string; propertyApiName: string }) {
  const current = pinnedPropertyApiNamesByObjectTypeId[payload.objectTypeId] ?? []
  const existsIndex = current.indexOf(payload.propertyApiName)

  if (existsIndex >= 0) {
    pinnedPropertyApiNamesByObjectTypeId[payload.objectTypeId] = current.filter((item) => item !== payload.propertyApiName)
    console.log('unpin node property', payload)
    return
  }

  if (current.length >= 2) {
    console.log('node property pin limit reached (max 2)', payload)
    return
  }

  pinnedPropertyApiNamesByObjectTypeId[payload.objectTypeId] = [...current, payload.propertyApiName]
  console.log('pin node property', payload)
}

function addEdgeIfMissing(edge: GraphEdgeData | null) {
  if (!edge) {
    return
  }

  if (graphEdges.some((existingEdge) => existingEdge.id === edge.id)) {
    return
  }

  if (
    graphEdges.some(
      (existingEdge) =>
        existingEdge.source === edge.source &&
        existingEdge.target === edge.target &&
        existingEdge.linkTypeId === edge.linkTypeId
    )
  ) {
    return
  }

  graphEdges.push(edge)
}

function syncLinkInstanceEdges() {
  const instanceNodeIds = new Set(
    graphNodes.filter((node) => node.nodeKind === 'objectInstance').map((node) => node.id)
  )

  linkInstances.forEach((linkInstance) => {
    if (!instanceNodeIds.has(linkInstance.sourceObjectInstanceId) || !instanceNodeIds.has(linkInstance.targetObjectInstanceId)) {
      return
    }

    const linkType = getLinkTypeById(linkInstance.linkTypeId)

    addEdgeIfMissing({
      id: linkInstance.id,
      source: linkInstance.sourceObjectInstanceId,
      target: linkInstance.targetObjectInstanceId,
      label: linkType?.displayName ?? linkInstance.linkTypeId,
      linkTypeId: linkInstance.linkTypeId
    })
  })
}

function syncEdgesForNode(node: GraphNodeData) {
  if (node.nodeKind === 'objectType') {
    syncObjectTypeEdgesForNode(node)
    return
  }

  linkTypes
    .filter((linkType) => {
      return linkType.sourceObjectTypeId === node.objectTypeId || linkType.targetObjectTypeId === node.objectTypeId
    })
    .forEach((linkType) => {
      const relatedInstanceIds = new Set(getRelatedInstances(node, linkType).map((instance) => instance.id))

      graphNodes
        .filter((candidate) => candidate.id !== node.id && relatedInstanceIds.has(candidate.id))
        .forEach((candidate) => {
          addEdgeIfMissing(createRelationshipEdge(node, candidate, linkType))
        })
    })
}

function syncObjectTypeEdgesForNode(node: GraphNodeData) {
  linkTypes
    .filter((linkType) => {
      return linkType.sourceObjectTypeId === node.objectTypeId || linkType.targetObjectTypeId === node.objectTypeId
    })
    .forEach((linkType) => {
      graphNodes
        .filter((candidate) => {
          return (
            candidate.id !== node.id &&
            candidate.nodeKind === 'objectType' &&
            (candidate.objectTypeId === linkType.sourceObjectTypeId || candidate.objectTypeId === linkType.targetObjectTypeId)
          )
        })
        .forEach((candidate) => {
          addEdgeIfMissing(createObjectTypeRelationshipEdge(node, candidate, linkType))
        })
    })
}

function handleCanvasClick() {
  selectedNodeId.value = ''
  selectedNodeIds.value = []
  nodeTool.open = false
  objectTypeChooser.open = false
  console.log('canvas clicked')
}

function handlePanelClick(event: MouseEvent) {
  event.stopPropagation()
}

function handleToolAction(label: string) {
  if (label === 'Group') {
    groupSelectedNodes()
    return
  }

  if (label !== 'Search Around') {
    console.log('tool action', label)
    return
  }

  if (!selectedGraphNode.value) {
    isSearchAroundOpen.value = false
    console.log('search around requires selected node')
    return
  }

  searchAroundStartNodeId.value = selectedGraphNode.value.id
  searchAroundLinkType.value = null
  isSearchAroundOpen.value = true
}

function groupSelectedNodes() {
  if (!canGroupSelectedNodes.value) {
    console.log('group requires multiple selected nodes with the same object type')
    return
  }

  const result = groupNodesByIds(graphNodes, graphEdges, selectedNodeIds.value, getObjectTypeName)

  graphNodes.splice(0, graphNodes.length, ...result.nodes)
  graphEdges.splice(0, graphEdges.length, ...result.edges)

  selectedNodeId.value = result.groupedNodeId ?? ''
  selectedNodeIds.value = result.groupedNodeId ? [result.groupedNodeId] : []
  nodeTool.open = false
  objectTypeChooser.open = false

  console.log('group nodes', selectedNodeIds.value)
}

function getCanvasPoint(clientX: number, clientY: number) {
  const canvas = canvasRef.value

  if (!canvas) {
    return { x: 0, y: 0 }
  }

  const rect = canvas.getBoundingClientRect()

  return {
    x: Math.min(rect.width - 180, Math.max(8, clientX - rect.left + 12)),
    y: Math.min(rect.height - 140, Math.max(8, clientY - rect.top - 8))
  }
}

function handleNodeContextMenu(event: MouseEvent, nodeId: string) {
  event.preventDefault()
  event.stopPropagation()

  const point = getCanvasPoint(event.clientX, event.clientY)
  selectedNodeId.value = nodeId
  selectedNodeIds.value = [nodeId]
  nodeTool.open = true
  nodeTool.nodeId = nodeId
  nodeTool.x = point.x
  nodeTool.y = point.y
  objectTypeChooser.open = false

  console.log('node context menu', nodeId)
}

function removeNodeById(nodeId: string) {
  const index = graphNodes.findIndex((node) => node.id === nodeId)
  if (index === -1) {
    return
  }

  graphNodes.splice(index, 1)

  for (let edgeIndex = graphEdges.length - 1; edgeIndex >= 0; edgeIndex -= 1) {
    const edge = graphEdges[edgeIndex]
    if (edge.source === nodeId || edge.target === nodeId) {
      graphEdges.splice(edgeIndex, 1)
    }
  }

  if (selectedNodeId.value === nodeId) {
    selectedNodeId.value = ''
    selectedNodeIds.value = []
  } else if (selectedNodeIds.value.includes(nodeId)) {
    selectedNodeIds.value = selectedNodeIds.value.filter((selected) => selected !== nodeId)
    selectedNodeId.value = selectedNodeIds.value.at(-1) ?? ''
  }
}

function removeInstanceOfEdge(instanceId: string, objectTypeNodeId: string) {
  const edgeId = `${instanceId}-instanceOf-${objectTypeNodeId}`

  for (let index = graphEdges.length - 1; index >= 0; index -= 1) {
    if (graphEdges[index].id === edgeId) {
      graphEdges.splice(index, 1)
      return
    }
  }
}

function expandObjectTypeInstances() {
  const objectTypeNode = contextGraphNode.value
  if (!objectTypeNode || objectTypeNode.nodeKind !== 'objectType') {
    return
  }

  const objectTypeNodeId = objectTypeNode.id
  const objectTypeId = objectTypeNode.objectTypeId
  const prevOwnedNodes = ownedExpandedInstanceIdsByObjectTypeNodeId.get(objectTypeNodeId) ?? new Set<string>()
  const prevExpandedEdges = expandedEdgeInstanceIdsByObjectTypeNodeId.get(objectTypeNodeId) ?? new Set<string>()

  const instances = getFilteredObjectInstances(objectTypeId)
  const nextInstanceIdSet = new Set(instances.map((instance) => instance.id))

  const staleEdgeInstanceIds = Array.from(prevExpandedEdges).filter((instanceId) => !nextInstanceIdSet.has(instanceId))
  staleEdgeInstanceIds.forEach((instanceId) => {
    prevExpandedEdges.delete(instanceId)
    removeInstanceOfEdge(instanceId, objectTypeNodeId)

    if (prevOwnedNodes.has(instanceId)) {
      prevOwnedNodes.delete(instanceId)
      removeNodeById(instanceId)
    }
  })

  instances.forEach((instance, index) => {
    const existingNode = graphNodes.find((node) => node.id === instance.id)
    if (!existingNode) {
      graphNodes.push(createGraphNode(instance, index, objectTypeNode, instances.length))
      prevOwnedNodes.add(instance.id)
    }

    prevExpandedEdges.add(instance.id)
    addEdgeIfMissing({
      id: `${instance.id}-instanceOf-${objectTypeNodeId}`,
      source: instance.id,
      target: objectTypeNodeId,
      label: 'instanceOf',
      linkTypeId: 'instanceOf'
    })
  })

  syncLinkInstanceEdges()

  ownedExpandedInstanceIdsByObjectTypeNodeId.set(objectTypeNodeId, prevOwnedNodes)
  expandedEdgeInstanceIdsByObjectTypeNodeId.set(objectTypeNodeId, prevExpandedEdges)
  selectedNodeId.value = objectTypeNodeId
  selectedNodeIds.value = [objectTypeNodeId]
  nodeTool.open = false
  objectTypeChooser.open = false

  console.log('expand objectType instances', { objectTypeNodeId, objectTypeId, instances: instances.length })
}

function selectNode(nodeId: string, additive: boolean) {
  if (!additive) {
    selectedNodeId.value = nodeId
    selectedNodeIds.value = [nodeId]
    return
  }

  const alreadySelected = selectedNodeIds.value.includes(nodeId)

  if (alreadySelected) {
    selectedNodeIds.value = selectedNodeIds.value.filter((selectedId) => selectedId !== nodeId)
    selectedNodeId.value = selectedNodeIds.value.at(-1) ?? ''
    return
  }

  selectedNodeIds.value = [...selectedNodeIds.value, nodeId]
  selectedNodeId.value = nodeId
}

function openAssociatedObjectTypes() {
  objectTypeChooser.open = true
  objectTypeChooser.nodeId = nodeTool.nodeId
  objectTypeChooser.x = nodeTool.x + 8
  objectTypeChooser.y = nodeTool.y + 42
  console.log('open associated object types', nodeTool.nodeId)
}

function openSearchAroundForObjectType(option: { linkType: LinkType }) {
  searchAroundStartNodeId.value = objectTypeChooser.nodeId
  searchAroundLinkType.value = option.linkType
  isSearchAroundOpen.value = true
  nodeTool.open = false
  objectTypeChooser.open = false
  console.log('open search around relation', option.linkType.apiName)
}

function handleDockTool(payload: { tab: string; clientX: number; clientY: number }) {
  const canvas = canvasRef.value

  if (!canvas) {
    return
  }

  const rect = canvas.getBoundingClientRect()
  const panelWidth = 360
  const panelHeight = Math.min(window.innerHeight - 90, Math.max(420, rect.height - 24))
  const nextX = payload.clientX - rect.left - 16
  const nextY = payload.clientY - rect.top - 16

  panelPosition.x = Math.min(Math.max(8, rect.width - panelWidth - 8), Math.max(8, nextX))
  panelPosition.y = Math.min(Math.max(8, rect.height - panelHeight - 8), Math.max(8, nextY))

  console.log('dock tool', payload.tab, panelPosition)
}

function handleAddObjectTypeToCanvas(payload: AddObjectTypePayload) {
  const existingNode = graphNodes.find((node) => node.id === `object_type_node_${payload.objectTypeId}`)
  const node = existingNode ?? createObjectTypeGraphNode(payload)

  if (!node) {
    console.log('add objectType skipped: unknown object type', payload.objectTypeId)
    return
  }

  if (!existingNode) {
    graphNodes.push(node)
  }

  syncObjectTypeEdgesForNode(node)

  selectedNodeId.value = node.id
  selectedNodeIds.value = [node.id]

  console.log('add objectType to canvas', payload)
}

function handleAddObjectsToCanvas(payload: AddObjectPayload) {
  if (payload.nodeKind === 'objectType') {
    handleAddObjectTypeToCanvas(payload)
    return
  }

  const instancesToAdd = payload.objectIds
    .map((objectId) => objectInstances.find((instance) => instance.id === objectId))
    .filter((instance): instance is ObjectInstance => {
      return instance !== undefined && instance.objectTypeId === payload.objectTypeId
    })

  let firstAddedNode: GraphNodeData | null = null
  let firstResolvedNode: GraphNodeData | null = null

  for (let index = 0; index < instancesToAdd.length; index += 1) {
    const instance = instancesToAdd[index]
    const existingNode = graphNodes.find((node) => node.id === instance.id)
    const node = addNodeIfMissing(instance, index)

    firstResolvedNode ??= node

    if (!existingNode) {
      firstAddedNode ??= node
    }
  }

  instancesToAdd.forEach((instance) => {
    const node = graphNodes.find((item) => item.id === instance.id)

    if (node) {
      syncEdgesForNode(node)
    }
  })

  syncLinkInstanceEdges()

  const nodeToSelect = firstAddedNode ?? firstResolvedNode

  if (nodeToSelect) {
    selectedNodeId.value = nodeToSelect.id
    selectedNodeIds.value = [nodeToSelect.id]
  }

  console.log('add objects to canvas', payload)
}

function handleApplyInstanceFilter(payload: InstanceFilterPayload) {
  instanceFilters[payload.objectTypeId] = payload

  console.log('apply instance filter', payload)
}

function handleAddSearchAroundToGraph(payload: SearchAroundAddPayload) {
  const startNode = searchAroundStartNode.value

  if (!startNode) {
    console.log('search around add skipped: no start node')
    return
  }

  const isStartNodeConnectedToLink =
    payload.linkType.sourceObjectTypeId === startNode.objectTypeId ||
    payload.linkType.targetObjectTypeId === startNode.objectTypeId

  if (!isStartNodeConnectedToLink) {
    console.log('search around add skipped: link type does not match start node', payload.linkType.apiName)
    return
  }

  const relatedInstanceIds = new Set(getRelatedInstances(startNode, payload.linkType).map((instance) => instance.id))
  const resultObjectTypeId =
    payload.linkType.sourceObjectTypeId === startNode.objectTypeId
      ? payload.linkType.targetObjectTypeId
      : payload.linkType.sourceObjectTypeId
  const resultInstances = payload.objectIds
    .map((objectId) => objectInstances.find((instance) => instance.id === objectId))
    .filter((instance): instance is ObjectInstance => {
      return (
        instance !== undefined &&
        instance.objectTypeId === resultObjectTypeId &&
        relatedInstanceIds.has(instance.id)
      )
    })

  resultInstances.forEach((instance, index) => {
    const resultNode = addNodeIfMissing(instance, index, startNode, resultInstances.length)
    addEdgeIfMissing(createRelationshipEdge(startNode, resultNode, payload.linkType))
  })

  syncLinkInstanceEdges()

  if (resultInstances.length > 0) {
    selectedNodeId.value = startNode.id
    selectedNodeIds.value = [startNode.id]
  }

  console.log('add search around to graph', payload)
}

function getDraggingNode() {
  return graphNodes.find((node) => node.id === dragState.nodeId)
}

function updateNodePosition(clientX: number, clientY: number) {
  const canvas = canvasRef.value
  const node = getDraggingNode()

  if (!canvas || !node) {
    return
  }

  const rect = canvas.getBoundingClientRect()
  const nextX = ((clientX - rect.left - dragState.offsetX) / rect.width) * 100
  const nextY = ((clientY - rect.top - dragState.offsetY) / rect.height) * 100

  node.x = Math.min(94, Math.max(6, nextX))
  node.y = Math.min(92, Math.max(8, nextY))
}

function handleNodePointerDown(event: PointerEvent, nodeId: string) {
  const target = event.currentTarget as HTMLElement
  const canvas = canvasRef.value

  if (!canvas) {
    return
  }

  event.stopPropagation()
  event.preventDefault()
  target.setPointerCapture(event.pointerId)

  const nodeRect = target.getBoundingClientRect()
  const nodeCenterX = nodeRect.left + nodeRect.width / 2
  const nodeCenterY = nodeRect.top + nodeRect.height / 2

  dragState.dragging = true
  dragState.pointerId = event.pointerId
  dragState.nodeId = nodeId
  dragState.offsetX = event.clientX - nodeCenterX
  dragState.offsetY = event.clientY - nodeCenterY
  dragState.moved = false
}

function handleNodePointerMove(event: PointerEvent) {
  if (!dragState.dragging || event.pointerId !== dragState.pointerId) {
    return
  }

  event.stopPropagation()
  dragState.moved = true
  updateNodePosition(event.clientX, event.clientY)
}

function handleNodePointerUp(event: PointerEvent) {
  if (!dragState.dragging || event.pointerId !== dragState.pointerId) {
    return
  }

  event.stopPropagation()
  const target = event.currentTarget as HTMLElement

  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId)
  }

  dragState.dragging = false

  if (!dragState.moved) {
    selectNode(dragState.nodeId, event.shiftKey || event.metaKey || event.ctrlKey)
    console.log('selected node', dragState.nodeId)

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const isSameNode = doubleClickState.lastNodeId === dragState.nodeId
    const withinThreshold = now - doubleClickState.lastAt <= 320

    if (isSameNode && withinThreshold) {
      doubleClickState.lastNodeId = ''
      doubleClickState.lastAt = 0
      openMetricsPanel(dragState.nodeId)
    } else {
      doubleClickState.lastNodeId = dragState.nodeId
      doubleClickState.lastAt = now
    }
  }

  dragState.nodeId = ''
}

onBeforeUnmount(() => {
  dragState.dragging = false
  dragState.nodeId = ''
})

function openMetricsPanel(nodeId: string) {
  metricsNodeId.value = nodeId
  isMetricsPanelOpen.value = true
  console.log('open metrics panel', nodeId)
}

function closeMetricsPanel() {
  isMetricsPanelOpen.value = false
  metricsNodeId.value = ''
  console.log('close metrics panel')
}

function handleWindowKeydown(event: KeyboardEvent) {
  if (!isMetricsPanelOpen.value) {
    return
  }

  if (event.key === 'Escape') {
    closeMetricsPanel()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleWindowKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleWindowKeydown)
})

// Future enhancement:
// import cytoscape from 'cytoscape'
// onMounted(() => {
//   // initialize cytoscape here when graph interactions are needed
// })
</script>

<template>
  <main ref="canvasRef" class="graph-canvas" @click="handleCanvasClick">
    <div class="graph-canvas__grid" aria-hidden="true"></div>
    <LeftSelectionPanel
      :selected-object="selectedObjectForPanel"
      :pinned-property-api-names="pinnedPropertyApiNamesForPanel"
      :graph-stats="graphStats"
      :object-types="objectTypes"
      :node-groups="nodeGroups"
      :style="panelStyle"
      class="graph-canvas__left-panel"
      @dock-tool="handleDockTool"
      @add-to-canvas="handleAddObjectsToCanvas"
      @apply-instance-filter="handleApplyInstanceFilter"
      @toggle-pinned-property="handleTogglePinnedProperty"
      @click="handlePanelClick"
    />
    <MainToolbar
      class="graph-canvas__toolbar"
      :can-group="canGroupSelectedNodes"
      @tool-action="handleToolAction"
      @click="handlePanelClick"
    />
    <SearchAroundPanel
      v-if="isSearchAroundOpen && searchAroundStartNode && searchAroundSelectedObject"
      :selected-object="searchAroundSelectedObject"
      :starting-instance="searchAroundStartNode.instance"
      :starting-object-type-id="searchAroundStartNode.objectTypeId"
      :initial-link-type="searchAroundLinkType"
      @add-to-graph="handleAddSearchAroundToGraph"
      @close="isSearchAroundOpen = false"
      @click="handlePanelClick"
    />
    <Transition name="metrics-panel-slide">
      <MetricAIPanel
        v-if="isMetricsPanelOpen && metricsGraphNode && metricsObjectType"
        :node="metricsGraphNode"
        :object-type="metricsObjectType"
        :filtered-instances="metricsFilteredInstances"
        @close="closeMetricsPanel"
      />
    </Transition>
    <RightVerticalPanel
      class="graph-canvas__right-panel"
      :search-around-open="isSearchAroundOpen"
      @click="handlePanelClick"
    />
    <svg class="graph-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <marker
          id="graph-edge-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 0 L 8 4 L 0 8 z" class="graph-edge__arrow" />
        </marker>
      </defs>
      <g v-for="edge in edgeLines" :key="edge.id">
        <line
          :class="['graph-edge', { 'graph-edge--dashed': edge.linkTypeId === 'instanceOf' }]"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
          marker-end="url(#graph-edge-arrow)"
          vector-effect="non-scaling-stroke"
        />
      </g>
    </svg>
    <GraphNode
      v-for="node in graphNodes"
      :key="node.id"
      :label="node.label"
      :node-kind="node.nodeKind"
      :node-type="node.type"
      :display-data="getNodeDisplayData(node)"
      :style="{ left: `${node.x}%`, top: `${node.y}%` }"
      :is-selected="selectedNodeIds.includes(node.id)"
      :is-dragging="dragState.dragging && dragState.nodeId === node.id"
      :event-count="getNodeEventCount(node)"
      :event-badge-color="getNodeEventBadgeColor(node)"
      @pointerdown="handleNodePointerDown($event, node.id)"
      @pointermove="handleNodePointerMove"
      @pointerup="handleNodePointerUp"
      @pointercancel="handleNodePointerUp"
      @contextmenu="handleNodeContextMenu($event, node.id)"
      @click.stop
    />
    <div
      v-if="nodeTool.open"
      class="node-context-toolbar"
      :style="{ left: `${nodeTool.x}px`, top: `${nodeTool.y}px` }"
      @click.stop
    >
      <button v-if="contextGraphNodeIsObjectType" type="button" @click="expandObjectTypeInstances">
        Expand Instances
      </button>
      <button type="button" @click="openAssociatedObjectTypes">
        Search Around
      </button>
    </div>
    <div
      v-if="objectTypeChooser.open"
      class="node-object-type-menu"
      :style="{ left: `${objectTypeChooser.x}px`, top: `${objectTypeChooser.y}px` }"
      @click.stop
    >
      <div class="node-object-type-menu__title">Linked ObjectTypes</div>
      <button
        v-for="option in associatedObjectTypeOptions"
        :key="option.objectType.id"
        class="node-object-type-option"
        type="button"
        @click="openSearchAroundForObjectType(option)"
      >
        <span class="node-object-type-option__swatch" :style="{ background: option.objectType.color }"></span>
        <span class="node-object-type-option__copy">
          <span>{{ option.objectType.displayName }}</span>
          <small>{{ option.count }} linked objects</small>
        </span>
      </button>
    </div>
    <FloatingControls @click="handlePanelClick" />
    <button class="series-button" @click.stop="console.log('series')">Series</button>
  </main>
</template>
