import { type ObjectType, type LinkType, type ObjectInstance, type LinkInstance } from './types'
import { projectObjectType, projectLineItemObjectType, projectInstances, projectLineItemInstances } from './project'
import { serverSkuObjectType, serverSkuInstances } from './server'
import { materialObjectType, bomLineObjectType, materialDemandObjectType, materialInstances, bomLineInstances, materialDemandInstances } from './material'
import { productionOrderObjectType, plantObjectType, productionOrderInstances, plantInstances } from './production'
import { workstationObjectType, serverObjectType, eventObjectType, workstationInstances, serverInstances, eventInstances, workstationProperties, serverProperties } from './burnin'
import { linkTypes, linkInstances } from './links'

export * from './types'
export * from './utils'
export * from './project'
export * from './server'
export * from './material'
export * from './production'
export * from './burnin'
export * from './links'

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
  workstationObjectType,
  serverObjectType,
  eventObjectType
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
  ...workstationInstances,
  ...serverInstances,
  ...eventInstances
]

export const airportInstances = workstationInstances
export const flightInstances = serverInstances
export const airportObjectType = workstationObjectType
export const flightObjectType = serverObjectType
export const airportProperties = workstationProperties
export const flightProperties = serverProperties

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
