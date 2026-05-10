import { type ObjectType, type PropertyType, type ObjectInstance } from './types'

export const MATERIAL_OBJECT_TYPE_ID = 'object_type_material'

export const materialProperties: PropertyType[] = [
  { id: 'material_code', objectTypeId: MATERIAL_OBJECT_TYPE_ID, apiName: 'materialCode', displayName: 'Material Code', description: '物料唯一编码', baseType: 'string', required: true, isPrimaryKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'material_name', objectTypeId: MATERIAL_OBJECT_TYPE_ID, apiName: 'materialName', displayName: 'Material Name', description: '物料名称', baseType: 'string', required: true, isTitleKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'material_type', objectTypeId: MATERIAL_OBJECT_TYPE_ID, apiName: 'materialType', displayName: 'Material Type', description: '物料类型：成品/半成品/原材料', baseType: 'enum', searchable: true, sortable: true, filterable: true },
  { id: 'unit', objectTypeId: MATERIAL_OBJECT_TYPE_ID, apiName: 'unit', displayName: 'Unit', description: '单位，如台/个/千克', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'specification', objectTypeId: MATERIAL_OBJECT_TYPE_ID, apiName: 'specification', displayName: 'Specification', description: '规格描述', baseType: 'string' },
  { id: 'default_supply_type', objectTypeId: MATERIAL_OBJECT_TYPE_ID, apiName: 'defaultSupplyType', displayName: 'Default Supply Type', description: '供应方式：制造/采购', baseType: 'enum', searchable: true, sortable: true, filterable: true },
  { id: 'lead_time_days', objectTypeId: MATERIAL_OBJECT_TYPE_ID, apiName: 'leadTimeDays', displayName: 'Lead Time Days', description: '提前期（天）', baseType: 'number', sortable: true, filterable: true }
]

export const materialObjectType: ObjectType = {
  id: MATERIAL_OBJECT_TYPE_ID,
  apiName: 'material',
  displayName: '物料主数据',
  description: '物料主数据',
  icon: 'cube',
  color: '#8b5cf6',
  status: 'active',
  primaryKeyPropertyId: 'material_code',
  titlePropertyId: 'material_name',
  properties: materialProperties
}

export const BOM_LINE_OBJECT_TYPE_ID = 'object_type_bom_line'

export const bomLineProperties: PropertyType[] = [
  { id: 'id', objectTypeId: BOM_LINE_OBJECT_TYPE_ID, apiName: 'id', displayName: 'ID', description: '代理主键', baseType: 'number', required: true, isPrimaryKey: true },
  { id: 'quantity_per', objectTypeId: BOM_LINE_OBJECT_TYPE_ID, apiName: 'quantityPer', displayName: 'Quantity Per', description: '单位父物料所需子物料数量', baseType: 'number', required: true, sortable: true, filterable: true },
  { id: 'effective_date', objectTypeId: BOM_LINE_OBJECT_TYPE_ID, apiName: 'effectiveDate', displayName: 'Effective Date', description: '生效日期', baseType: 'date', sortable: true, filterable: true },
  { id: 'obsolescence_date', objectTypeId: BOM_LINE_OBJECT_TYPE_ID, apiName: 'obsolescenceDate', displayName: 'Obsolescence Date', description: '失效日期', baseType: 'date', sortable: true, filterable: true },
  { id: 'bom_level', objectTypeId: BOM_LINE_OBJECT_TYPE_ID, apiName: 'bomLevel', displayName: 'BOM Level', description: 'BOM层级，便于遍历', baseType: 'number', sortable: true, filterable: true }
]

export const bomLineObjectType: ObjectType = {
  id: BOM_LINE_OBJECT_TYPE_ID,
  apiName: 'bomLine',
  displayName: '物料清单',
  description: '物料清单行，定义父物料与子物料的组成关系',
  icon: 'diagram',
  color: '#ec4899',
  status: 'active',
  primaryKeyPropertyId: 'id',
  titlePropertyId: 'id',
  properties: bomLineProperties
}

export const MATERIAL_DEMAND_OBJECT_TYPE_ID = 'object_type_material_demand'

export const materialDemandProperties: PropertyType[] = [
  { id: 'id', objectTypeId: MATERIAL_DEMAND_OBJECT_TYPE_ID, apiName: 'id', displayName: 'ID', description: '代理主键', baseType: 'number', required: true, isPrimaryKey: true },
  { id: 'demand_type', objectTypeId: MATERIAL_DEMAND_OBJECT_TYPE_ID, apiName: 'demandType', displayName: 'Demand Type', description: '需求类型：独立需求/相关需求', baseType: 'enum', searchable: true, sortable: true, filterable: true },
  { id: 'quantity', objectTypeId: MATERIAL_DEMAND_OBJECT_TYPE_ID, apiName: 'quantity', displayName: 'Quantity', description: '需求数量', baseType: 'number', required: true, sortable: true, filterable: true },
  { id: 'demand_date', objectTypeId: MATERIAL_DEMAND_OBJECT_TYPE_ID, apiName: 'demandDate', displayName: 'Demand Date', description: '需求到货/可用日期（最早到达时间）', baseType: 'date', sortable: true, filterable: true },
  { id: 'latest_order_date', objectTypeId: MATERIAL_DEMAND_OBJECT_TYPE_ID, apiName: 'latestOrderDate', displayName: 'Latest Order Date', description: '最晚下单/开工日期', baseType: 'date', sortable: true, filterable: true },
  { id: 'status', objectTypeId: MATERIAL_DEMAND_OBJECT_TYPE_ID, apiName: 'status', displayName: 'Status', description: '状态：未满足/已下生产/已采购/已满足', baseType: 'enum', searchable: true, sortable: true, filterable: true }
]

export const materialDemandObjectType: ObjectType = {
  id: MATERIAL_DEMAND_OBJECT_TYPE_ID,
  apiName: 'materialDemand',
  displayName: '物料需求',
  description: '物料需求，记录成品、半成品或原材料的需求',
  icon: 'clipboard',
  color: '#f97316',
  status: 'active',
  primaryKeyPropertyId: 'id',
  titlePropertyId: 'id',
  properties: materialDemandProperties
}

export const materialInstances: ObjectInstance[] = [
  { id: 'inst_mat_001', objectTypeId: MATERIAL_OBJECT_TYPE_ID, properties: { material_code: 'MAT-FG-R740', material_name: 'PowerEdge R740 成品', material_type: '成品', unit: '台', specification: 'R740 标准配置', default_supply_type: '制造', lead_time_days: 30 } },
  { id: 'inst_mat_002', objectTypeId: MATERIAL_OBJECT_TYPE_ID, properties: { material_code: 'MAT-SF-MB-001', material_name: 'R740 主板总成', material_type: '半成品', unit: '个', specification: 'R740 定制主板', default_supply_type: '制造', lead_time_days: 15 } },
  { id: 'inst_mat_003', objectTypeId: MATERIAL_OBJECT_TYPE_ID, properties: { material_code: 'MAT-RM-CPU-001', material_name: 'Intel Xeon Silver 4214', material_type: '原材料', unit: '个', specification: '12核 2.2GHz', default_supply_type: '采购', lead_time_days: 45 } }
]

export const bomLineInstances: ObjectInstance[] = [
  { id: 'inst_bom_001', objectTypeId: BOM_LINE_OBJECT_TYPE_ID, properties: { id: 1, quantity_per: 1, effective_date: '2024-01-01', obsolescence_date: '2025-12-31', bom_level: 1 } },
  { id: 'inst_bom_002', objectTypeId: BOM_LINE_OBJECT_TYPE_ID, properties: { id: 2, quantity_per: 2, effective_date: '2024-01-01', obsolescence_date: '2025-12-31', bom_level: 2 } },
  { id: 'inst_bom_003', objectTypeId: BOM_LINE_OBJECT_TYPE_ID, properties: { id: 3, quantity_per: 1, effective_date: '2024-01-01', obsolescence_date: '2025-12-31', bom_level: 1 } }
]

export const materialDemandInstances: ObjectInstance[] = [
  { id: 'inst_dem_001', objectTypeId: MATERIAL_DEMAND_OBJECT_TYPE_ID, properties: { id: 1001, demand_type: '独立需求', quantity: 50, demand_date: '2024-09-30', latest_order_date: '2024-08-31', status: '已下生产' } },
  { id: 'inst_dem_002', objectTypeId: MATERIAL_DEMAND_OBJECT_TYPE_ID, properties: { id: 1002, demand_type: '相关需求', quantity: 50, demand_date: '2024-09-15', latest_order_date: '2024-08-31', status: '已下生产' } },
  { id: 'inst_dem_003', objectTypeId: MATERIAL_DEMAND_OBJECT_TYPE_ID, properties: { id: 1003, demand_type: '相关需求', quantity: 100, demand_date: '2024-09-15', latest_order_date: '2024-08-31', status: '未满足' } }
]
