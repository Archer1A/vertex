import { type PropertyType, type ObjectInstance, type TimeSeriesValue } from './types'

export const PRODUCTION_ORDER_OBJECT_TYPE_ID = 'object_type_production_order'

export const productionOrderProperties: PropertyType[] = [
  {
    id: 'production_order_number',
    objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID,
    apiName: 'productionOrderNumber',
    displayName: 'Production Order Number',
    description: 'Unique identifier for the production order.',
    baseType: 'string',
    required: true,
    isPrimaryKey: true,
    isTitleKey: true,
    searchable: true,
    sortable: true,
    filterable: true
  },
  {
    id: 'quantity',
    objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID,
    apiName: 'quantity',
    displayName: 'Quantity',
    description: 'Total quantity to produce.',
    baseType: 'integer',
    required: true,
    sortable: true,
    filterable: true
  },
  {
    id: 'planned_start_date',
    objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID,
    apiName: 'plannedStartDate',
    displayName: 'Planned Start Date',
    description: 'Planned start date for production.',
    baseType: 'date',
    required: true,
    sortable: true,
    filterable: true
  },
  {
    id: 'planned_end_date',
    objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID,
    apiName: 'plannedEndDate',
    displayName: 'Planned End Date',
    description: 'Planned end date for production.',
    baseType: 'date',
    required: true,
    sortable: true,
    filterable: true
  },
  {
    id: 'status',
    objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID,
    apiName: 'status',
    displayName: 'Status',
    description: 'Current status of the production order.',
    baseType: 'string',
    required: true,
    searchable: true,
    sortable: true,
    filterable: true
  },
  {
    id: 'daily_planned_quantity',
    objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID,
    apiName: 'dailyPlannedQuantity',
    displayName: 'Daily Planned Quantity',
    description: '每日计划生产数量',
    baseType: 'timeseries',
    timeSeries: { granularity: 'day', valueBaseType: 'integer', unit: 'pcs' }
  },
  {
    id: 'daily_actual_quantity',
    objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID,
    apiName: 'dailyActualQuantity',
    displayName: 'Daily Actual Quantity',
    description: '每日实际生产数量',
    baseType: 'timeseries',
    timeSeries: { granularity: 'day', valueBaseType: 'integer', unit: 'pcs' }
  }
]

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
  {
    id: 'inst_po_001',
    objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID,
    properties: {
      production_order_number: 'PO-2024-001',
      quantity: 50,
      planned_start_date: '2024-08-01',
      planned_end_date: '2024-09-15',
      status: '生产中',
      daily_planned_quantity: buildDailySeries('2024-08-01', [4, 4, 4, 4, 4, 0, 0, 5, 5, 5, 5, 5, 0, 0]),
      daily_actual_quantity: buildDailySeries('2024-08-01', [3, 4, 4, 3, 5, 0, 0, 4, 5, 5, 4, 5, 0, 0])
    }
  },
  {
    id: 'inst_po_002',
    objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID,
    properties: {
      production_order_number: 'PO-2024-002',
      quantity: 30,
      planned_start_date: '2024-07-01',
      planned_end_date: '2024-10-31',
      status: '生产中',
      daily_planned_quantity: buildDailySeries('2024-07-01', [2, 2, 2, 3, 3, 0, 0, 3, 3, 3, 3, 3, 0, 0, 3, 3]),
      daily_actual_quantity: buildDailySeries('2024-07-01', [1, 2, 2, 2, 3, 0, 0, 2, 3, 3, 3, 2, 0, 0, 2, 3])
    }
  },
  {
    id: 'inst_po_003',
    objectTypeId: PRODUCTION_ORDER_OBJECT_TYPE_ID,
    properties: {
      production_order_number: 'PO-2024-003',
      quantity: 40,
      planned_start_date: '2024-04-20',
      planned_end_date: '2024-12-15',
      status: '生产中',
      daily_planned_quantity: buildDailySeries('2024-04-20', [2, 0, 0, 2, 2, 2, 0, 0, 3, 3, 3, 3, 0, 0, 4, 4, 4, 4]),
      daily_actual_quantity: buildDailySeries('2024-04-20', [1, 0, 0, 2, 1, 2, 0, 0, 2, 3, 3, 2, 0, 0, 3, 4, 4, 3])
    }
  }
]
