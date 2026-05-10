import { type ObjectType, type LinkType, type ObjectInstance, type LinkInstance } from './types'
import { projectObjectType, projectLineItemObjectType, projectInstances, projectLineItemInstances } from './project'
import { serverSkuObjectType, serverSkuInstances } from './server'
import { materialObjectType, bomLineObjectType, materialDemandObjectType, materialInstances, bomLineInstances, materialDemandInstances } from './material'
import { productionOrderObjectType, plantObjectType, productionOrderInstances, plantInstances } from './production'
import { linkTypes, linkInstances } from './links'
import { eventObjectType, eventInstances } from './events'

export * from './types'
export * from './utils'
export * from './project'
export * from './server'
export * from './material'
export * from './production'
export * from './links'
export * from './metrics'
export * from './events'

export type { ObjectType, LinkType, PropertyType, PropertyValue, ObjectInstance, LinkInstance } from './types'

export const objectTypes: ObjectType[] = [
  projectObjectType,
  serverSkuObjectType,
  projectLineItemObjectType,
  materialObjectType,
  bomLineObjectType,
  materialDemandObjectType,
  productionOrderObjectType,
  plantObjectType,
  eventObjectType,
]

export const objectInstances: ObjectInstance[] = [
  ...projectInstances,
  ...projectLineItemInstances,
  ...serverSkuInstances,
  ...materialInstances,
  ...bomLineInstances,
  ...materialDemandInstances,
  ...productionOrderInstances,
  ...plantInstances,
  ...eventInstances,
]

export function getObjectTypeById(id: string): ObjectType | undefined {
  return objectTypes.find(ot => ot.id === id)
}

export function getLinkTypeById(id: string): LinkType | undefined {
  return linkTypes.find(lt => lt.id === id)
}

export function getObjectInstanceById(id: string): ObjectInstance | undefined {
  return objectInstances.find(oi => oi.id === id)
}

export function getLinkInstanceById(id: string): LinkInstance | undefined {
  return linkInstances.find(li => li.id === id)
}
