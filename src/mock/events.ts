import { type ObjectType, type PropertyType, type ObjectInstance } from './types'

export const EVENT_OBJECT_TYPE_ID = 'object_type_event'

export const eventProperties: PropertyType[] = [
  { id: 'event_id', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventId', displayName: 'Event ID', description: '事件唯一编码', baseType: 'string', required: true, isPrimaryKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'event_title', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventTitle', displayName: 'Title', description: '事件标题', baseType: 'string', required: true, isTitleKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'event_type', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventType', displayName: 'Type', description: '事件类型', baseType: 'enum', searchable: true, sortable: true, filterable: true },
  { id: 'event_time', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventTime', displayName: 'Time', description: '事件发生时间', baseType: 'datetime', sortable: true, filterable: true },
  { id: 'event_summary', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'eventSummary', displayName: 'Summary', description: '事件摘要', baseType: 'string', searchable: true },
  { id: 'badge_color', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'badgeColor', displayName: 'Badge Color', description: '事件徽标颜色（hex）', baseType: 'string' },
  { id: 'severity', objectTypeId: EVENT_OBJECT_TYPE_ID, apiName: 'severity', displayName: 'Severity', description: '严重程度', baseType: 'enum', searchable: true, sortable: true, filterable: true }
]

export const eventObjectType: ObjectType = {
  id: EVENT_OBJECT_TYPE_ID,
  apiName: 'event',
  displayName: 'Event',
  description: '对象事件（mock）',
  icon: 'activity',
  color: '#8b5cf6',
  status: 'active',
  primaryKeyPropertyId: 'event_id',
  titlePropertyId: 'event_title',
  properties: eventProperties
}

export const eventInstances: ObjectInstance[] = [
  {
    id: 'inst_event_001',
    objectTypeId: EVENT_OBJECT_TYPE_ID,
    properties: {
      event_id: 'EVT-001',
      event_title: 'Burn-in failure detected',
      event_type: 'burn_in_failure',
      event_time: '2026-05-05T09:12:00+08:00',
      event_summary: 'Thermal excursion and retry spikes observed during burn-in.',
      badge_color: '#ef4444',
      severity: 'high'
    }
  },
  {
    id: 'inst_event_002',
    objectTypeId: EVENT_OBJECT_TYPE_ID,
    properties: {
      event_id: 'EVT-002',
      event_title: 'Pass rate dip on workstation line',
      event_type: 'quality_signal',
      event_time: '2026-05-07T14:28:00+08:00',
      event_summary: 'Pass rate dropped below threshold for 20 minutes.',
      badge_color: '#f59e0b',
      severity: 'medium'
    }
  },
  {
    id: 'inst_event_003',
    objectTypeId: EVENT_OBJECT_TYPE_ID,
    properties: {
      event_id: 'EVT-003',
      event_title: 'Demand risk: supplier lead time change',
      event_type: 'supply_risk',
      event_time: '2026-05-08T10:03:00+08:00',
      event_summary: 'Lead time updated; latest order date may be missed.',
      badge_color: '#3b82f6',
      severity: 'low'
    }
  },
  {
    id: 'inst_event_004',
    objectTypeId: EVENT_OBJECT_TYPE_ID,
    properties: {
      event_id: 'EVT-004',
      event_title: '物料短缺事件',
      event_type: 'material_shortage',
      event_time: '2026-05-09T08:30:00+08:00',
      event_summary: '物料供给不足，需求可能无法按期满足。',
      badge_color: '#ef4444',
      severity: 'high'
    }
  },
  {
    id: 'inst_event_005',
    objectTypeId: EVENT_OBJECT_TYPE_ID,
    properties: {
      event_id: 'EVT-005',
      event_title: '物料到达最晚下单时间前 7 天提醒',
      event_type: 'latest_order_date_minus_7d',
      event_time: '2024-08-24T00:00:00+08:00',
      event_summary: '距离最晚下单时间（2024-08-31）还有 7 天，请尽快确认下单与到货计划。',
      badge_color: '#f59e0b',
      severity: 'medium'
    }
  },
  {
    id: 'inst_event_006',
    objectTypeId: EVENT_OBJECT_TYPE_ID,
    properties: {
      event_id: 'EVT-006',
      event_title: '项目交付可能延迟风险',
      event_type: 'project_delivery_delay_risk',
      event_time: '2026-05-10T10:00:00+08:00',
      event_summary: '关键里程碑存在风险，项目交付时间可能延后。',
      badge_color: '#f97316',
      severity: 'medium'
    }
  }
]

export const eventBindings: Array<{ objectInstanceId: string; eventId: string }> = [
  { objectInstanceId: 'inst_sku_002', eventId: 'inst_event_001' },
  { objectInstanceId: 'inst_sku_002', eventId: 'inst_event_002' },
  { objectInstanceId: 'inst_dem_003', eventId: 'inst_event_003' },
  { objectInstanceId: 'inst_project_001', eventId: 'inst_event_002' },
  { objectInstanceId: 'inst_dem_002', eventId: 'inst_event_004' },
  { objectInstanceId: 'inst_dem_003', eventId: 'inst_event_005' },
  { objectInstanceId: 'inst_project_002', eventId: 'inst_event_006' }
]

export function getEventsForObjectInstance(objectInstanceId: string): ObjectInstance[] {
  const eventById = new Map(eventInstances.map((event) => [event.id, event] as const))

  return eventBindings
    .filter((binding) => binding.objectInstanceId === objectInstanceId)
    .map((binding) => eventById.get(binding.eventId))
    .filter((event): event is ObjectInstance => Boolean(event))
}

export function getEventBadgeColor(event: ObjectInstance): string {
  const badgeColor = event.properties.badge_color
  if (typeof badgeColor === 'string' && /^#([0-9a-fA-F]{3}){1,2}$/.test(badgeColor)) return badgeColor
  return '#94a3b8'
}
