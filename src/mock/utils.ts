import type { LinkType, ObjectInstance, LinkInstance, PropertyValue } from './types'

export function createLinkInstance(
  linkType: LinkType,
  sourceObjectInstance: ObjectInstance,
  targetObjectInstance: ObjectInstance,
  properties?: Record<string, PropertyValue>
): LinkInstance {
  const id = `link_${linkType.id}_${sourceObjectInstance.id}_${targetObjectInstance.id}`
  return {
    id,
    linkTypeId: linkType.id,
    sourceObjectInstanceId: sourceObjectInstance.id,
    targetObjectInstanceId: targetObjectInstance.id,
    properties
  }
}
