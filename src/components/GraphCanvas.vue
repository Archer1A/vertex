<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import type { SelectedObject } from '../App.vue'
import {
  airportInstances,
  flightInstances,
  flightDestinationAirportLinkType,
  flightOriginAirportLinkType,
  getObjectTypeById,
  linkTypes,
  objectInstances,
  objectTypes,
  type ObjectInstance,
  type LinkType,
  type PropertyValue
} from '../mock/mock'
import FloatingControls from './FloatingControls.vue'
import GraphNode from './GraphNode.vue'
import LeftSelectionPanel from './LeftSelectionPanel.vue'
import MainToolbar from './MainToolbar.vue'
import RightVerticalPanel from './RightVerticalPanel.vue'
import SearchAroundPanel from './SearchAroundPanel.vue'

interface GraphNodeData {
  id: string
  label: string
  type: 'airport' | 'flight'
  objectTypeId: string
  instance: ObjectInstance
  x: number
  y: number
}

interface GraphEdgeData {
  id: string
  source: string
  target: string
  label: string
  linkTypeId: string
}

const props = defineProps<{
  selectedObject: SelectedObject
  activeSheetIndex: number
}>()

const canvasRef = ref<HTMLElement | null>(null)
const selectedNodeId = ref('airport_sfo')
const isSearchAroundOpen = ref(false)
const searchAroundStartNodeId = ref('airport_sfo')
const searchAroundLinkType = ref<LinkType | null>(null)
const nodeTool = reactive({ open: false, nodeId: '', x: 0, y: 0 })
const objectTypeChooser = reactive({ open: false, nodeId: '', x: 0, y: 0 })
const airportPositions: Record<string, { x: number; y: number }> = {
  SFO: { x: 46, y: 50 },
  LAX: { x: 63, y: 70 },
  SEA: { x: 64, y: 28 },
  JFK: { x: 84, y: 48 }
}

const flightPositions: Record<string, { x: number; y: number }> = {
  'UA1175-2026-04-25': { x: 55, y: 60 },
  'UA2381-2026-04-25': { x: 55, y: 38 },
  'DL421-2026-04-25': { x: 74, y: 62 },
  'AS330-2026-04-25': { x: 55, y: 30 },
  'B6401-2026-04-25': { x: 75, y: 55 },
  'AA1846-2026-04-25': { x: 55, y: 72 }
}

const graphNodes = reactive<GraphNodeData[]>(createGraphNodes())
const graphEdges = computed<GraphEdgeData[]>(createGraphEdges)

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
  edges: graphEdges.value.length
}))

const searchAroundStartNode = computed(() => {
  return graphNodes.find((node) => node.id === searchAroundStartNodeId.value) ?? graphNodes[0]
})

const searchAroundSelectedObject = computed(() => {
  if (!searchAroundStartNode.value) {
    return props.selectedObject
  }

  return toSelectedObject(searchAroundStartNode.value)
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
  graphEdges.value
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

function getInstanceLabel(instance: ObjectInstance) {
  const objectType = getObjectTypeById(instance.objectTypeId)
  const titleProperty = objectType?.properties.find((property) => property.id === objectType.titlePropertyId)
  const title = titleProperty ? toDisplayString(instance.properties[titleProperty.apiName]) : ''

  if (title) {
    return title.length > 28 ? `${title.slice(0, 25)}...` : title
  }

  return instance.id
}

function toSelectedObject(node: GraphNodeData): SelectedObject {
  const objectType = getObjectTypeById(node.objectTypeId)
  const properties =
    objectType?.properties.map((property) => ({
      key: property.displayName,
      value: toDisplayString(node.instance.properties[property.apiName])
    })) ?? []

  return {
    title: node.label,
    subtitle: objectType?.displayName ?? node.objectTypeId,
    nodeLabel: node.label,
    properties
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

function createGraphNodes(): GraphNodeData[] {
  return objectInstances.map((instance, index) => {
    const airportCode = toDisplayString(instance.properties.airport)
    const flightId = toDisplayString(instance.properties.flightId)
    const fallbackPosition = { x: 50 + (index % 5) * 8, y: 30 + Math.floor(index / 5) * 12 }
    const position =
      instance.objectTypeId === 'object_type_airport'
        ? airportPositions[airportCode] ?? fallbackPosition
        : flightPositions[flightId] ?? fallbackPosition

    return {
      id: instance.id,
      label: getInstanceLabel(instance),
      type: instance.objectTypeId === 'object_type_airport' ? 'airport' : 'flight',
      objectTypeId: instance.objectTypeId,
      instance,
      x: position.x,
      y: position.y
    }
  })
}

function findAirportByCode(airportCode: PropertyValue) {
  const code = toDisplayString(airportCode)
  return airportInstances.find((airport) => toDisplayString(airport.properties.airport) === code)
}

function createGraphEdges(): GraphEdgeData[] {
  return flightInstances.flatMap((flight) => {
    const originAirport = findAirportByCode(flight.properties.originAirportCode)
    const destinationAirport = findAirportByCode(flight.properties.destinationAirportCode)
    const flightNumber = toDisplayString(flight.properties.flightNumber)
    const edges: GraphEdgeData[] = []

    if (originAirport) {
      edges.push({
        id: `${flight.id}-${flightOriginAirportLinkType.id}`,
        source: flight.id,
        target: originAirport.id,
        label: 'origin',
        linkTypeId: flightOriginAirportLinkType.id
      })
    }

    if (destinationAirport) {
      edges.push({
        id: `${flight.id}-${flightDestinationAirportLinkType.id}`,
        source: flight.id,
        target: destinationAirport.id,
        label: flightNumber ? `${flightNumber} destination` : 'destination',
        linkTypeId: flightDestinationAirportLinkType.id
      })
    }

    return edges
  })
}

function handleCanvasClick() {
  selectedNodeId.value = ''
  nodeTool.open = false
  objectTypeChooser.open = false
  console.log('canvas clicked')
}

function handlePanelClick(event: MouseEvent) {
  event.stopPropagation()
}

function handleToolAction(label: string) {
  if (label === 'Search Around') {
    searchAroundStartNodeId.value = selectedNodeId.value || 'airport_sfo'
    searchAroundLinkType.value = null
    isSearchAroundOpen.value = true
  }
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
  nodeTool.open = true
  nodeTool.nodeId = nodeId
  nodeTool.x = point.x
  nodeTool.y = point.y
  objectTypeChooser.open = false

  console.log('node context menu', nodeId)
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
    selectedNodeId.value = dragState.nodeId
    console.log('selected node', dragState.nodeId)
  }

  dragState.nodeId = ''
}

onBeforeUnmount(() => {
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
      :selected-object="selectedObject"
      :graph-stats="graphStats"
      :object-types="objectTypes"
      :object-instances="objectInstances"
      :node-groups="nodeGroups"
      :style="panelStyle"
      class="graph-canvas__left-panel"
      @dock-tool="handleDockTool"
      @click="handlePanelClick"
    />
    <MainToolbar class="graph-canvas__toolbar" @tool-action="handleToolAction" @click="handlePanelClick" />
    <SearchAroundPanel
      v-if="isSearchAroundOpen"
      :selected-object="searchAroundSelectedObject"
      :starting-object-type-id="searchAroundStartNode?.objectTypeId ?? 'object_type_airport'"
      :initial-link-type="searchAroundLinkType"
      @close="isSearchAroundOpen = false"
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
      :is-selected="selectedNodeId === node.id"
      :is-dragging="dragState.dragging && dragState.nodeId === node.id"
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
