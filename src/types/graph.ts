import type { LinkType, ObjectInstance } from '../mock/mock'

export interface SelectedObject {
  title: string
  subtitle: string
  nodeLabel: string
  properties: Array<{
    key: string
    value: string
  }>
}

export interface GraphNodeData {
  id: string
  label: string
  type: 'airport' | 'flight'
  objectTypeId: string
  instance: ObjectInstance
  x: number
  y: number
}

export interface GraphEdgeData {
  id: string
  source: string
  target: string
  label: string
  linkTypeId: string
}

export type EqualsFilterPayload = {
  objectTypeId: string
  propertyApiName: string
  operator: 'equals'
  value: string
}

export type AddObjectPayload = {
  objectTypeId: string
  objectIds: string[]
  filter: EqualsFilterPayload | null
}

export type SearchAroundAddPayload = {
  linkType: LinkType
  objectIds: string[]
}
