import type { LinkType, ObjectInstance, PropertyType } from '../mock/mock'

export interface SelectedObject {
  title: string
  subtitle: string
  nodeLabel: string
  nodeKind: 'objectType' | 'objectInstance'
  objectTypeId: string
  properties: Array<{
    key: string
    value: string
    apiName?: string
  }>
  instanceProperties?: Array<{
    apiName: string
    displayName: string
    baseType: PropertyType['baseType']
  }>
  appliedInstanceFilter?: InstanceFilterPayload | null
  instances?: Array<{
    id: string
    title: string
    subtitle: string
  }>
  events?: Array<{
    id: string
    title: string
    subtitle: string
    properties: Array<{
      key: string
      value: string
    }>
  }>
  timeSeries?: Array<{
    apiName: string
    displayName: string
    unit?: string
    granularity: 'day' | 'hour'
    points: Array<{ ts: string; value: number | null }>
  }>
}

export interface GraphNodeData {
  id: string
  label: string
  nodeKind: 'objectType' | 'objectInstance'
  type: 'airport' | 'flight' | 'event'
  objectTypeId: string
  instance: ObjectInstance
  eventIds?: string[]
  x: number
  y: number
}

export interface GraphNodeDisplayData {
  title: string
  subtitle: string
  accentColor: string
  icon: 'airport' | 'flight' | 'event'
  chips?: Array<{
    key: string
    value: string
  }>
  metrics: Array<{
    label: string
    value: string
    title?: string
  }>
  badges: Array<{
    label: string
    tone: 'info' | 'success' | 'warning' | 'danger' | 'neutral'
    title?: string
  }>
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

export type InstanceFilterPayload = {
  objectTypeId: string
  propertyApiName: string
  operator: 'equals'
  value: string
}

export type AddObjectTypePayload = {
  nodeKind: 'objectType'
  objectTypeId: string
}

export type AddObjectInstancePayload = {
  nodeKind: 'objectInstance'
  objectTypeId: string
  objectIds: string[]
  filter: EqualsFilterPayload | null
}

export type AddObjectPayload = AddObjectTypePayload | AddObjectInstancePayload

export type SearchAroundAddPayload = {
  linkType: LinkType
  objectIds: string[]
}
