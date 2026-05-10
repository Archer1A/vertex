<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import type { AddObjectPayload, GraphEdgeData, GraphNodeData, SearchAroundAddPayload, SelectedObject } from '../types/graph'
import type { TimeSeriesValue } from '../mock/types'
import { groupNodesByIds } from '../utils/graphGrouping'
import {
  flightInstances,
  getObjectTypeById,
  linkTypes,
  objectInstances,
  objectTypes,
  type LinkType,
  type ObjectInstance,
  type PropertyValue
} from '../mock/mock'
import FloatingControls from './FloatingControls.vue'
import GraphNode from './GraphNode.vue'
import LeftSelectionPanel from './LeftSelectionPanel.vue'
import MainToolbar from './MainToolbar.vue'
import MetricsWorkspacePanel from './MetricsWorkspacePanel.vue'
import RightVerticalPanel from './RightVerticalPanel.vue'
import SearchAroundPanel from './SearchAroundPanel.vue'

defineProps<{
  activeSheetIndex: number
}>()

const canvasRef = ref<HTMLElement | null>(null)
const selectedNodeId = ref('')
const selectedNodeIds = ref<string[]>([])
const isSearchAroundOpen = ref(false)
const searchAroundStartNodeId = ref('')
const searchAroundLinkType = ref<LinkType | null>(null)
const isMetricsWorkspaceOpen = ref(false)
const metricsWorkspaceNodeId = ref('')
const nodeTool = reactive({ open: false, nodeId: '', x: 0, y: 0 })
const objectTypeChooser = reactive({ open: false, nodeId: '', x: 0, y: 0 })

const graphNodes = reactive<GraphNodeData[]>([])
const graphEdges = reactive<GraphEdgeData[]>([])

const airportPositions: Record<string, { x: number; y: number }> = {
  SFO: { x: 56, y: 58 },
  LAX: { x: 46, y: 62 },
  SEA: { x: 52, y: 38 },
  JFK: { x: 70, y: 48 }
}

const flightPositions: Record<string, { x: number; y: number }> = {
  'UA1175-2026-04-25': { x: 58, y: 44 },
  'UA2381-2026-04-25': { x: 62, y: 38 },
  'DL421-2026-04-25': { x: 64, y: 58 },
  'AS330-2026-04-25': { x: 50, y: 50 },
  'B6401-2026-04-25': { x: 74, y: 54 },
  'AA1846-2026-04-25': { x: 52, y: 66 }
}

const panelPosition = reactive({ x: 8, y: 8 })
const dragState = reactive({
  dragging: false,
  pointerId: 0,
  nodeId: '',
  offsetX: 0,
  offsetY: 0,
  moved: false
})

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

const searchAroundStartNode = computed(() => {
  return graphNodes.find((node) => node.id === searchAroundStartNodeId.value) ?? null
})

const searchAroundSelectedObject = computed<SelectedObject | null>(() => {
  return searchAroundStartNode.value ? toSelectedObject(searchAroundStartNode.value) : null
})

const metricsWorkspaceNode = computed(() => {
  return graphNodes.find((node) => node.id === metricsWorkspaceNodeId.value) ?? null
})

const metricsWorkspaceObjectType = computed(() => {
  return metricsWorkspaceNode.value ? getObjectTypeById(metricsWorkspaceNode.value.objectTypeId) ?? null : null
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

function getInstanceLabel(instance: ObjectInstance) {
  const objectType = getObjectTypeById(instance.objectTypeId)
  const titleProperty = objectType?.properties.find((property) => property.id === objectType.titlePropertyId)
  const title = titleProperty ? toDisplayString(instance.properties[titleProperty.apiName]) : ''

  return title || instance.id
}

function getObjectTypeName(objectTypeId: string) {
  return getObjectTypeById(objectTypeId)?.displayName ?? objectTypeId
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

function clampPercent(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getDefaultNodePosition(instance: ObjectInstance, index: number) {
  const airportCode = toDisplayString(instance.properties.airport)
  const flightId = toDisplayString(instance.properties.flightId)
  const fallbackPosition = {
    x: 48 + (index % 4) * 8,
    y: 42 + Math.floor(index / 4) * 10
  }

  if (instance.objectTypeId === 'object_type_airport') {
    return airportPositions[airportCode] ?? fallbackPosition
  }

  return flightPositions[flightId] ?? fallbackPosition
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

  return {
    id: instance.id,
    label: getInstanceLabel(instance),
    type: instance.objectTypeId === 'object_type_airport' ? 'airport' : 'flight',
    objectTypeId: instance.objectTypeId,
    instance,
    x: position.x,
    y: position.y
  }
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

function toSelectedObject(node: GraphNodeData): SelectedObject {
  const objectType = getObjectTypeById(node.objectTypeId)
  const properties =
    objectType?.properties
      .filter((property) => property.baseType !== 'timeseries')
      .map((property) => ({
        key: property.displayName,
        value: toDisplayString(node.instance.properties[property.apiName])
      })) ?? []

  return {
    title: node.label,
    subtitle: objectType?.displayName ?? node.objectTypeId,
    nodeLabel: node.label,
    properties,
    timeSeries: getTimeSeriesForInstance(node.instance, node.objectTypeId)
  }
}

function countLinkedObjects(node: GraphNodeData, linkType: LinkType) {
  if (node.objectTypeId === 'object_type_airport') {
    const airportCode = toDisplayString(node.instance.properties.airport)

    if (linkType.apiName === 'flightDestinationAirport') {
      return flightInstances.filter((flight) => toDisplayString(flight.properties.destinationAirportCode) === airportCode).length
    }

    return flightInstances.filter((flight) => toDisplayString(flight.properties.originAirportCode) === airportCode).length
  }

  return 1
}

function findAirportByCode(code: PropertyValue) {
  const airportCode = toDisplayString(code)

  return objectInstances.find((instance) => {
    return instance.objectTypeId === 'object_type_airport' && toDisplayString(instance.properties.airport) === airportCode
  })
}

function getRelatedInstances(startNode: GraphNodeData, linkType: LinkType) {
  if (startNode.objectTypeId === 'object_type_airport') {
    const airportCode = toDisplayString(startNode.instance.properties.airport)

    if (linkType.apiName === 'flightDestinationAirport') {
      return flightInstances.filter((flight) => toDisplayString(flight.properties.destinationAirportCode) === airportCode)
    }

    return flightInstances.filter((flight) => toDisplayString(flight.properties.originAirportCode) === airportCode)
  }

  const airportCode =
    linkType.apiName === 'flightDestinationAirport'
      ? startNode.instance.properties.destinationAirportCode
      : startNode.instance.properties.originAirportCode
  const airport = findAirportByCode(airportCode)

  return airport ? [airport] : []
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
    label: linkType.apiName === 'flightDestinationAirport' ? 'destination' : 'origin',
    linkTypeId: linkType.id
  }
}

function addEdgeIfMissing(edge: GraphEdgeData | null) {
  if (!edge) {
    return
  }

  if (graphEdges.some((existingEdge) => existingEdge.id === edge.id)) {
    return
  }

  graphEdges.push(edge)
}

function syncEdgesForNode(node: GraphNodeData) {
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

function openMetricsWorkspace(nodeId: string) {
  const node = graphNodes.find((item) => item.id === nodeId)

  if (!node) {
    console.log('metrics workspace skipped: node not found', nodeId)
    return
  }

  selectedNodeId.value = nodeId
  selectedNodeIds.value = [nodeId]
  metricsWorkspaceNodeId.value = nodeId
  isMetricsWorkspaceOpen.value = true
  nodeTool.open = false
  objectTypeChooser.open = false

  console.log('open metrics workspace', nodeId)
}

function closeMetricsWorkspace() {
  isMetricsWorkspaceOpen.value = false
  metricsWorkspaceNodeId.value = ''
  console.log('close metrics workspace')
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isMetricsWorkspaceOpen.value) {
    closeMetricsWorkspace()
  }
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

function handleAddObjectsToCanvas(payload: AddObjectPayload) {
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

  const nodeToSelect = firstAddedNode ?? firstResolvedNode

  if (nodeToSelect) {
    selectedNodeId.value = nodeToSelect.id
    selectedNodeIds.value = [nodeToSelect.id]
  }

  console.log('add objects to canvas', payload)
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
  }

  dragState.nodeId = ''
}

onMounted(() => {
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleDocumentKeydown)
  dragState.dragging = false
  dragState.nodeId = ''
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
      :graph-stats="graphStats"
      :object-types="objectTypes"
      :object-instances="objectInstances"
      :node-groups="nodeGroups"
      :style="panelStyle"
      class="graph-canvas__left-panel"
      @dock-tool="handleDockTool"
      @add-to-canvas="handleAddObjectsToCanvas"
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
    <MetricsWorkspacePanel
      v-if="isMetricsWorkspaceOpen && metricsWorkspaceNode && metricsWorkspaceObjectType"
      :node="metricsWorkspaceNode"
      :object-type="metricsWorkspaceObjectType"
      @close="closeMetricsWorkspace"
      @click="handlePanelClick"
    />
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
          class="graph-edge"
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
      :node-type="node.type"
      :style="{ left: `${node.x}%`, top: `${node.y}%` }"
      :is-selected="selectedNodeIds.includes(node.id)"
      :is-dragging="dragState.dragging && dragState.nodeId === node.id"
      @pointerdown="handleNodePointerDown($event, node.id)"
      @pointermove="handleNodePointerMove"
      @pointerup="handleNodePointerUp"
      @pointercancel="handleNodePointerUp"
      @contextmenu="handleNodeContextMenu($event, node.id)"
      @dblclick.stop="openMetricsWorkspace(node.id)"
      @click.stop
    />
    <div
      v-if="nodeTool.open"
      class="node-context-toolbar"
      :style="{ left: `${nodeTool.x}px`, top: `${nodeTool.y}px` }"
      @click.stop
    >
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
