import { type ObjectType, type PropertyType, type ObjectInstance } from './types'

export const PROJECT_OBJECT_TYPE_ID = 'object_type_project'

export const projectProperties: PropertyType[] = [
  { id: 'project_id', objectTypeId: PROJECT_OBJECT_TYPE_ID, apiName: 'projectId', displayName: 'Project ID', description: '项目唯一编号', baseType: 'string', required: true, isPrimaryKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'project_name', objectTypeId: PROJECT_OBJECT_TYPE_ID, apiName: 'projectName', displayName: 'Project Name', description: '项目名称', baseType: 'string', required: true, isTitleKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'customer_name', objectTypeId: PROJECT_OBJECT_TYPE_ID, apiName: 'customerName', displayName: 'Customer Name', description: '客户名称', baseType: 'string', searchable: true, sortable: true, filterable: true ,showInNode:true},
  { id: 'project_status', objectTypeId: PROJECT_OBJECT_TYPE_ID, apiName: 'projectStatus', displayName: 'Project Status', description: '项目状态，如需求确认/生产中/已交付', baseType: 'enum', searchable: true, sortable: true, filterable: true ,showInNode:true},
  { id: 'requested_delivery_date', objectTypeId: PROJECT_OBJECT_TYPE_ID, apiName: 'requestedDeliveryDate', displayName: 'Requested Delivery Date', description: '客户要求的整体交付日期', baseType: 'date', sortable: true, filterable: true }
]

export const projectObjectType: ObjectType = {
  id: PROJECT_OBJECT_TYPE_ID,
  apiName: 'project',
  displayName: '销售项目',
  description: '销售项目，承载客户需求与交付背景',
  icon: 'briefcase',
  color: '#3b82f6',
  status: 'active',
  primaryKeyPropertyId: 'project_id',
  titlePropertyId: 'project_name',
  properties: projectProperties
}

export const PROJECT_LINE_ITEM_OBJECT_TYPE_ID = 'object_type_project_line_item'

export const projectLineItemProperties: PropertyType[] = [
  { id: 'id', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, apiName: 'id', displayName: 'ID', description: '代理主键', baseType: 'number', required: true, isPrimaryKey: true },
  { id: 'sku_code', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, apiName: 'skuCode', displayName: 'SKU Code', description: '对应的服务器型号编码', baseType: 'string', required: true, searchable: true, sortable: true, filterable: true },
  { id: 'quantity', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, apiName: 'quantity', displayName: 'Quantity', description: '订购数量', baseType: 'number', required: true, sortable: true, filterable: true },
  { id: 'requested_delivery_date', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, apiName: 'requestedDeliveryDate', displayName: 'Requested Delivery Date', description: '客户要求交付日期', baseType: 'date', sortable: true, filterable: true ,showInNode:true},
  { id: 'confirmed_delivery_date', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, apiName: 'confirmedDeliveryDate', displayName: 'Confirmed Delivery Date', description: '承诺交付日期', baseType: 'date', sortable: true, filterable: true },
  { id: 'estimated_production_start_date', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, apiName: 'estimatedProductionStartDate', displayName: 'Estimated Production Start Date', description: '预计生产开始日期', baseType: 'date', sortable: true, filterable: true },
  { id: 'estimated_production_end_date', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, apiName: 'estimatedProductionEndDate', displayName: 'Estimated Production End Date', description: '预计生产结束日期', baseType: 'date', sortable: true, filterable: true },
  { id: 'actual_production_start_date', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, apiName: 'actualProductionStartDate', displayName: 'Actual Production Start Date', description: '实际生产开始日期', baseType: 'date', sortable: true, filterable: true },
  { id: 'actual_production_end_date', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, apiName: 'actualProductionEndDate', displayName: 'Actual Production End Date', description: '实际生产结束日期', baseType: 'date', sortable: true, filterable: true },
  { id: 'production_status', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, apiName: 'productionStatus', displayName: 'Production Status', description: '生产状态：待排产/生产中/已完成', baseType: 'enum', searchable: true, sortable: true, filterable: true ,showInNode:true},
  { id: 'custom_config', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, apiName: 'customConfig', displayName: 'Custom Config', description: '定制配置备注', baseType: 'string' },
  { id: 'serial_numbers', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, apiName: 'serialNumbers', displayName: 'Serial Numbers', description: '交付后记录的序列号，JSON数组', baseType: 'string' },
  { id: 'fulfillment_status', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, apiName: 'fulfillmentStatus', displayName: 'Fulfillment Status', description: '整体交付状态：未交付/部分交付/已交付', baseType: 'enum', searchable: true, sortable: true, filterable: true }
]

export const projectLineItemObjectType: ObjectType = {
  id: PROJECT_LINE_ITEM_OBJECT_TYPE_ID,
  apiName: 'projectLineItem',
  displayName: '项目行项',
  description: '项目行项，记录客户订购的每种服务器型号数量与交付生产信息',
  icon: 'list',
  color: '#f59e0b',
  status: 'active',
  primaryKeyPropertyId: 'id',
  titlePropertyId: 'sku_code',
  properties: projectLineItemProperties
}

export const projectInstances: ObjectInstance[] = [
  { id: 'inst_project_001', objectTypeId: PROJECT_OBJECT_TYPE_ID, properties: { project_id: 'PRJ-2024-001', project_name: 'XX银行核心系统扩容', customer_name: 'XX银行', project_status: '生产中', requested_delivery_date: '2024-09-30' } },
  { id: 'inst_project_002', objectTypeId: PROJECT_OBJECT_TYPE_ID, properties: { project_id: 'PRJ-2024-002', project_name: 'YY证券交易平台升级', customer_name: 'YY证券', project_status: '需求确认', requested_delivery_date: '2024-12-15' } },
  { id: 'inst_project_003', objectTypeId: PROJECT_OBJECT_TYPE_ID, properties: { project_id: 'PRJ-2024-003', project_name: 'ZZ政府云平台建设', customer_name: 'ZZ政府', project_status: '已交付', requested_delivery_date: '2024-06-30' } }
]

export const projectLineItemInstances: ObjectInstance[] = [
  { id: 'inst_line_001', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, properties: { id: 1, sku_code: 'SRV-R740-001', quantity: 50, requested_delivery_date: '2024-09-30', confirmed_delivery_date: '2024-10-15', estimated_production_start_date: '2024-08-01', estimated_production_end_date: '2024-09-15', production_status: '生产中', fulfillment_status: '未交付' } },
  { id: 'inst_line_002', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, properties: { id: 2, sku_code: 'SRV-DL380-002', quantity: 30, requested_delivery_date: '2024-09-30', confirmed_delivery_date: '2024-10-15', estimated_production_start_date: '2024-08-01', estimated_production_end_date: '2024-09-15', production_status: '生产中', fulfillment_status: '未交付' } },
  { id: 'inst_line_003', objectTypeId: PROJECT_LINE_ITEM_OBJECT_TYPE_ID, properties: { id: 3, sku_code: 'SRV-DL380-002', quantity: 100, requested_delivery_date: '2024-12-15', confirmed_delivery_date: '2024-12-20', estimated_production_start_date: '2024-10-01', estimated_production_end_date: '2024-12-01', production_status: '待排产', fulfillment_status: '未交付' } }
]
