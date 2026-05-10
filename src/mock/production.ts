import { type ObjectType, type PropertyType, type ObjectInstance, type TimeSeriesValue } from './types'

export const PRODUCTION_ORDER_OBJECT_TYPE_ID = 'object_type_production_order'

export const productionOrderProperties: PropertyType[] = [
  { id: 'production_order_number', objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID, apiName: 'productionOrderNumber', displayName: 'Production Order Number', description: '生产订单号', baseType: 'string', required: true, isPrimaryKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'quantity', objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID, apiName: 'quantity', displayName: 'Quantity', description: '生产数量', baseType: 'number', required: true, sortable: true, filterable: true },
  { id: 'planned_start_date', objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID, apiName: 'plannedStartDate', displayName: 'Planned Start Date', description: '计划开始日期', baseType: 'date', sortable: true, filterable: true },
  { id: 'planned_end_date', objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID, apiName: 'plannedEndDate', displayName: 'Planned End Date', description: '计划结束日期', baseType: 'date', sortable: true, filterable: true },
  { id: 'actual_start_date', objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID, apiName: 'actualStartDate', displayName: 'Actual Start Date', description: '实际开始日期', baseType: 'date', sortable: true, filterable: true },
  { id: 'actual_end_date', objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID, apiName: 'actualEndDate', displayName: 'Actual End Date', description: '实际结束日期', baseType: 'date', sortable: true, filterable: true },
  { id: 'status', objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID, apiName: 'status', displayName: 'Status', description: '状态：计划/已排产/生产中/已完成', baseType: 'enum', searchable: true, sortable: true, filterable: true },
  { id: 'daily_planned_quantity', objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID, apiName: 'dailyPlannedQuantity', displayName: 'Daily Planned Quantity', description: '每日计划生产数量', baseType: 'timeseries', timeSeries: { granularity: 'day', valueBaseType: 'integer', unit: 'pcs' } },
  { id: 'daily_actual_quantity', objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID, apiName: 'dailyActualQuantity', displayName: 'Daily Actual Quantity', description: '每日实际生产数量', baseType: 'timeseries', timeSeries: { granularity: 'day', valueBaseType: 'integer', unit: 'pcs' } }
]

export const productionOrderObjectType: ObjectType = {
  id: PRODUCTION_ORDER_OBJECT_TYPE_ID,
  apiName: 'productionOrder',
  displayName: '生产订单',
  description: '生产订单，表示一次具体的生产任务',
  icon: 'wrench',
  color: '#ef4444',
  status: 'active',
  primaryKeyPropertyId: 'production_order_number',
  titlePropertyId: 'production_order_number',
  properties: productionOrderProperties
}

export const PLANT_OBJECT_TYPE_ID = 'object_type_plant'

export const plantProperties: PropertyType[] = [
  { id: 'plant_code', objectTypeId: PLANT_OBJECT_TYPE_ID, apiName: 'plantCode', displayName: 'Plant Code', description: '工厂编码', baseType: 'string', required: true, isPrimaryKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'plant_name', objectTypeId: PLANT_OBJECT_TYPE_ID, apiName: 'plantName', displayName: 'Plant Name', description: '工厂名称', baseType: 'string', required: true, isTitleKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'location', objectTypeId: PLANT_OBJECT_TYPE_ID, apiName: 'location', displayName: 'Location', description: '工厂地址', baseType: 'string', searchable: true, sortable: true, filterable: true }
]

export const plantObjectType: ObjectType = {
  id: PLANT_OBJECT_TYPE_ID,
  apiName: 'plant',
  displayName: '工厂',
  description: '工厂',
  icon: 'building',
  color: '#06b6d4',
  status: 'active',
  primaryKeyPropertyId: 'plant_code',
  titlePropertyId: 'plant_name',
  properties: plantProperties
}

function buildDailySeries(startDate: string, dailyValues: Array<number | null>, unit = 'pcs'): TimeSeriesValue {
  const start = new Date(`${startDate}T00:00:00Z`)
  const points = dailyValues.map((value, index) => {
    const dt = new Date(start)
    dt.setUTCDate(start.getUTCDate() + index)
    const ts = dt.toISOString().slice(0, 10)
    return { ts, value }
  })

  return { granularity: 'day', unit, points }
}

export const productionOrderInstances: ObjectInstance[] = [
  { id: 'inst_po_001', objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID, properties: { production_order_number: 'PO-2024-001', quantity: 50, planned_start_date: '2024-08-01', planned_end_date: '2024-09-15', status: '生产中', daily_planned_quantity: buildDailySeries('2024-08-01', [4, 4, 4, 4, 4, 0, 0, 5, 5, 5, 5, 5, 0, 0]), daily_actual_quantity: buildDailySeries('2024-08-01', [3, 4, 4, 3, 5, 0, 0, 4, 5, 5, 4, 5, 0, 0]) } },
  { id: 'inst_po_002', objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID, properties: { production_order_number: 'PO-2024-002', quantity: 30, planned_start_date: '2024-08-01', planned_end_date: '2024-09-15', status: '已排产', daily_planned_quantity: buildDailySeries('2024-08-01', [2, 2, 2, 3, 3, 0, 0, 3, 3, 3, 3, 3, 0, 0, 3, 3]), daily_actual_quantity: buildDailySeries('2024-08-01', [1, 2, 2, 2, 3, 0, 0, 2, 3, 3, 3, 2, 0, 0, 2, 3]) } },
  { id: 'inst_po_003', objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID, properties: { production_order_number: 'PO-2024-003', quantity: 100, planned_start_date: '2024-10-01', planned_end_date: '2024-12-01', status: '计划', daily_planned_quantity: buildDailySeries('2024-10-01', [2, 0, 0, 2, 2, 2, 0, 0, 3, 3, 3, 3, 0, 0, 4, 4, 4, 4]), daily_actual_quantity: buildDailySeries('2024-10-01', [1, 0, 0, 1, 2, 2, 0, 0, 2, 3, 3, 3, 0, 0, 3, 4, 4, 3]) } }
]

export const plantInstances: ObjectInstance[] = [
  { id: 'inst_plant_001', objectTypeId: PLANT_OBJECT_TYPE_ID, properties: { plant_code: 'PLT-SH-001', plant_name: '上海总装工厂', location: '上海市浦东新区张江高科技园区' } },
  { id: 'inst_plant_002', objectTypeId: PLANT_OBJECT_TYPE_ID, properties: { plant_code: 'PLT-SZ-001', plant_name: '深圳主板工厂', location: '深圳市南山区科技园' } },
  { id: 'inst_plant_003', objectTypeId: PLANT_OBJECT_TYPE_ID, properties: { plant_code: 'PLT-CD-001', plant_name: '成都测试中心', location: '成都市高新区天府软件园' } }
]
