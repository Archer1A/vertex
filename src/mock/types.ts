export interface ObjectType {
  id: string
  apiName: string
  displayName: string
  description?: string
  icon?: string
  color?: string
  status: 'experimental' | 'active' | 'deprecated'
  primaryKeyPropertyId: string
  titlePropertyId: string
  properties: PropertyType[]
}

export interface LinkType {
  id: string
  apiName: string
  displayName: string
  description?: string
  status: 'experimental' | 'active' | 'deprecated'
  sourceObjectTypeId: string
  targetObjectTypeId: string
  cardinality: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'
  direction: 'directed' | 'bidirectional'
  properties?: PropertyType[]
}

export interface PropertyType {
  id: string
  objectTypeId: string
  apiName: string
  displayName: string
  description?: string
  baseType: 'string' | 'number' | 'integer' | 'boolean' | 'date' | 'datetime' | 'geopoint' | 'enum' | 'array' | 'struct'
  required?: boolean
  isPrimaryKey?: boolean
  isTitleKey?: boolean
  searchable?: boolean
  sortable?: boolean
  filterable?: boolean
}

export type PropertyValue = string | number | boolean | string[] | number[] | { latitude: number; longitude: number } | null

export interface ObjectInstance {
  id: string
  objectTypeId: string
  properties: Record<string, PropertyValue>
}

export interface LinkInstance {
  id: string
  linkTypeId: string
  sourceObjectInstanceId: string
  targetObjectInstanceId: string
  properties?: Record<string, PropertyValue>
}
