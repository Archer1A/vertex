import type { GraphEdgeData, GraphNodeData } from '../types/graph'

export interface GroupNodesResult {
  nodes: GraphNodeData[]
  edges: GraphEdgeData[]
  groupedNodeId: string | null
}

export function groupNodesByIds(
  nodes: GraphNodeData[],
  edges: GraphEdgeData[],
  selectedNodeIds: string[],
  getObjectTypeName: (objectTypeId: string) => string
): GroupNodesResult {
  const selectedIdSet = new Set(selectedNodeIds)
  const selectedNodes = selectedNodeIds
    .map((nodeId) => nodes.find((node) => node.id === nodeId))
    .filter((node): node is GraphNodeData => node !== undefined)

  if (selectedNodes.length < 2) {
    throw new Error('Group requires at least two nodes')
  }

  const objectTypeId = selectedNodes[0].objectTypeId
  const hasOneObjectType = selectedNodes.every((node) => node.objectTypeId === objectTypeId)

  if (!hasOneObjectType) {
    throw new Error('Group requires selected nodes to have the same object type')
  }

  const groupedNodeId = `group_${objectTypeId}_${selectedNodes.map((node) => node.id).join('_')}`
  const x = selectedNodes.reduce((total, node) => total + node.x, 0) / selectedNodes.length
  const y = selectedNodes.reduce((total, node) => total + node.y, 0) / selectedNodes.length
  const firstNode = selectedNodes[0]

  const groupedNode: GraphNodeData = {
    ...firstNode,
    id: groupedNodeId,
    label: `${selectedNodes.length} ${getObjectTypeName(objectTypeId)}`,
    instance: {
      id: groupedNodeId,
      objectTypeId,
      properties: {}
    },
    x,
    y
  }

  const nextNodes = [
    ...nodes.filter((node) => !selectedIdSet.has(node.id)),
    groupedNode
  ]
  const nextEdges: GraphEdgeData[] = []
  const edgeKeys = new Set<string>()

  edges.forEach((edge) => {
    const sourceWasGrouped = selectedIdSet.has(edge.source)
    const targetWasGrouped = selectedIdSet.has(edge.target)

    if (sourceWasGrouped && targetWasGrouped) {
      return
    }

    const source = sourceWasGrouped ? groupedNodeId : edge.source
    const target = targetWasGrouped ? groupedNodeId : edge.target
    const edgeKey = `${source}-${edge.linkTypeId}-${target}-${edge.label}`

    if (edgeKeys.has(edgeKey)) {
      return
    }

    edgeKeys.add(edgeKey)
    nextEdges.push({
      ...edge,
      id: edgeKey,
      source,
      target
    })
  })

  return {
    nodes: nextNodes,
    edges: nextEdges,
    groupedNodeId
  }
}
