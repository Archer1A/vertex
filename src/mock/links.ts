import type { LinkType, LinkInstance } from './types'

export const PROJECT_TO_LINE_ITEM_LINK_TYPE_ID = 'link_type_project_line_items'
export const LINE_ITEM_TO_SKU_LINK_TYPE_ID = 'link_type_line_item_sku'
export const SKU_TO_MATERIAL_LINK_TYPE_ID = 'link_type_sku_material'
export const LINE_ITEM_TO_DEMAND_LINK_TYPE_ID = 'link_type_line_item_demand'
export const DEMAND_TO_MATERIAL_LINK_TYPE_ID = 'link_type_demand_material'
export const DEMAND_PARENT_CHILD_LINK_TYPE_ID = 'link_type_demand_parent_child'
export const BOM_LINE_PARENT_MATERIAL_LINK_TYPE_ID = 'link_type_bom_line_parent_material'
export const BOM_LINE_CHILD_MATERIAL_LINK_TYPE_ID = 'link_type_bom_line_child_material'
export const PRODUCTION_ORDER_TO_MATERIAL_LINK_TYPE_ID = 'link_type_production_order_material'
export const PRODUCTION_ORDER_TO_DEMAND_LINK_TYPE_ID = 'link_type_production_order_demand'
export const PRODUCTION_ORDER_TO_PLANT_LINK_TYPE_ID = 'link_type_production_order_plant'
export const SERVER_ASSIGNED_WORKSTATION_LINK_TYPE_ID = 'link_type_flight_origin_airport'
export const SERVER_FAILURE_EVENT_LINK_TYPE_ID = 'link_type_server_failure_event'
export const WORKSTATION_PASS_RATE_EVENT_LINK_TYPE_ID = 'link_type_workstation_pass_rate_event'

export const projectToLineItemLinkType: LinkType = {
  id: PROJECT_TO_LINE_ITEM_LINK_TYPE_ID,
  apiName: 'projectLineItems',
  displayName: 'Project has Line Items',
  description: 'Links a project to its line items (sales order items)',
  status: 'active',
  sourceObjectTypeId: 'object_type_project',
  targetObjectTypeId: 'object_type_project_line_item',
  cardinality: 'one-to-many',
  showInNode: true,
  direction: 'directed'
}

export const lineItemToSkuLinkType: LinkType = {
  id: LINE_ITEM_TO_SKU_LINK_TYPE_ID,
  apiName: 'lineItemSku',
  displayName: 'Line Item maps to SKU',
  description: 'Links a project line item to the server SKU being ordered',
  status: 'active',
  sourceObjectTypeId: 'object_type_project_line_item',
  targetObjectTypeId: 'object_type_server_sku',
  cardinality: 'many-to-one',
  showInNode: true,
  direction: 'directed'
}

export const skuToMaterialLinkType: LinkType = {
  id: SKU_TO_MATERIAL_LINK_TYPE_ID,
  apiName: 'skuMaterial',
  displayName: 'SKU is made of Material',
  description: 'Links a server SKU to the finished good material',
  status: 'active',
  sourceObjectTypeId: 'object_type_server_sku',
  targetObjectTypeId: 'object_type_material',
  cardinality: 'many-to-one',
  showInNode: true,
  direction: 'directed'
}

export const lineItemToDemandLinkType: LinkType = {
  id: LINE_ITEM_TO_DEMAND_LINK_TYPE_ID,
  apiName: 'lineItemDemand',
  displayName: 'Line Item creates Demand',
  description: 'Links a project line item to material demands it generates',
  status: 'active',
  sourceObjectTypeId: 'object_type_project_line_item',
  targetObjectTypeId: 'object_type_material_demand',
  cardinality: 'one-to-many',
  showInNode: true,
  direction: 'directed'
}

export const demandToMaterialLinkType: LinkType = {
  id: DEMAND_TO_MATERIAL_LINK_TYPE_ID,
  apiName: 'demandMaterial',
  displayName: 'Demand maps to Material',
  description: 'Links a material demand to the required material',
  status: 'active',
  sourceObjectTypeId: 'object_type_material_demand',
  targetObjectTypeId: 'object_type_material',
  cardinality: 'many-to-one',
  showInNode: true,
  direction: 'directed'
}

export const demandParentChildLinkType: LinkType = {
  id: DEMAND_PARENT_CHILD_LINK_TYPE_ID,
  apiName: 'demandParentChild',
  displayName: 'Demand Parent-Child',
  description: 'Links dependent demands (e.g., subassembly demand linked to parent finished good demand)',
  status: 'active',
  sourceObjectTypeId: 'object_type_material_demand',
  targetObjectTypeId: 'object_type_material_demand',
  cardinality: 'one-to-many',
  showInNode: true,
  direction: 'directed'
}

export const bomLineParentMaterialLinkType: LinkType = {
  id: BOM_LINE_PARENT_MATERIAL_LINK_TYPE_ID,
  apiName: 'bomLineParentMaterial',
  displayName: 'BOM Line Parent Material',
  description: 'Links a BOM line to its parent material (the finished good or subassembly being built)',
  status: 'active',
  sourceObjectTypeId: 'object_type_bom_line',
  targetObjectTypeId: 'object_type_material',
  cardinality: 'many-to-one',
  showInNode: true,
  direction: 'directed'
}

export const bomLineChildMaterialLinkType: LinkType = {
  id: BOM_LINE_CHILD_MATERIAL_LINK_TYPE_ID,
  apiName: 'bomLineChildMaterial',
  displayName: 'BOM Line Child Material',
  description: 'Links a BOM line to its child material (component required in the build)',
  status: 'active',
  sourceObjectTypeId: 'object_type_bom_line',
  targetObjectTypeId: 'object_type_material',
  cardinality: 'many-to-one',
  showInNode: true,
  direction: 'directed'
}

export const productionOrderToMaterialLinkType: LinkType = {
  id: PRODUCTION_ORDER_TO_MATERIAL_LINK_TYPE_ID,
  apiName: 'productionOrderMaterial',
  displayName: 'Production Order produces Material',
  description: 'Links a production order to the material it produces',
  status: 'active',
  sourceObjectTypeId: 'object_type_production_order',
  targetObjectTypeId: 'object_type_material',
  cardinality: 'many-to-one',
  showInNode: true,
  direction: 'directed'
}

export const productionOrderToDemandLinkType: LinkType = {
  id: PRODUCTION_ORDER_TO_DEMAND_LINK_TYPE_ID,
  apiName: 'productionOrderDemand',
  displayName: 'Production Order fulfills Demand',
  description: 'Links a production order to the material demand it fulfills',
  status: 'active',
  sourceObjectTypeId: 'object_type_production_order',
  targetObjectTypeId: 'object_type_material_demand',
  cardinality: 'many-to-one',
  showInNode: true,
  direction: 'directed'
}

export const productionOrderToPlantLinkType: LinkType = {
  id: PRODUCTION_ORDER_TO_PLANT_LINK_TYPE_ID,
  apiName: 'productionOrderPlant',
  displayName: 'Production Order at Plant',
  description: 'Links a production order to the plant where it will be executed',
  status: 'active',
  sourceObjectTypeId: 'object_type_production_order',
  targetObjectTypeId: 'object_type_plant',
  cardinality: 'many-to-one',
  showInNode: true,
  direction: 'directed'
}

export const serverAssignedWorkstationLinkType: LinkType = {
  id: SERVER_ASSIGNED_WORKSTATION_LINK_TYPE_ID,
  apiName: 'flightOriginAirport',
  displayName: '[Burn-in] Server Assigned Workstation',
  description: 'Connects a server to the workstation currently running burn-in.',
  status: 'active',
  sourceObjectTypeId: 'object_type_flight',
  targetObjectTypeId: 'object_type_airport',
  cardinality: 'many-to-one',
  showInNode: true,
  direction: 'directed'
}

export const serverFailureEventLinkType: LinkType = {
  id: SERVER_FAILURE_EVENT_LINK_TYPE_ID,
  apiName: 'serverFailureEvent',
  displayName: '[Burn-in] Server Failure Event',
  description: 'Connects a server to failed burn-in test events.',
  status: 'active',
  sourceObjectTypeId: 'object_type_flight',
  targetObjectTypeId: 'object_type_event',
  cardinality: 'one-to-many',
  showInNode: true,
  direction: 'directed'
}

export const workstationPassRateEventLinkType: LinkType = {
  id: WORKSTATION_PASS_RATE_EVENT_LINK_TYPE_ID,
  apiName: 'workstationPassRateEvent',
  displayName: '[Burn-in] Workstation Pass Rate Event',
  description: 'Connects a workstation to pass-rate threshold events.',
  status: 'active',
  sourceObjectTypeId: 'object_type_airport',
  targetObjectTypeId: 'object_type_event',
  cardinality: 'one-to-many',
  showInNode: true,
  direction: 'directed'
}

export const flightOriginAirportLinkType = serverAssignedWorkstationLinkType

export const linkTypes: LinkType[] = [
  projectToLineItemLinkType,
  lineItemToSkuLinkType,
  skuToMaterialLinkType,
  lineItemToDemandLinkType,
  demandToMaterialLinkType,
  demandParentChildLinkType,
  bomLineParentMaterialLinkType,
  bomLineChildMaterialLinkType,
  productionOrderToMaterialLinkType,
  productionOrderToDemandLinkType,
  productionOrderToPlantLinkType,
  serverAssignedWorkstationLinkType,
  serverFailureEventLinkType,
  workstationPassRateEventLinkType
]

export const linkInstances: LinkInstance[] = [
  { id: 'link_link_type_project_line_items_inst_project_001_inst_line_001', linkTypeId: 'link_type_project_line_items', sourceObjectInstanceId: 'inst_project_001', targetObjectInstanceId: 'inst_line_001' },
  { id: 'link_link_type_project_line_items_inst_project_001_inst_line_002', linkTypeId: 'link_type_project_line_items', sourceObjectInstanceId: 'inst_project_001', targetObjectInstanceId: 'inst_line_002' },
  { id: 'link_link_type_project_line_items_inst_project_002_inst_line_003', linkTypeId: 'link_type_project_line_items', sourceObjectInstanceId: 'inst_project_002', targetObjectInstanceId: 'inst_line_003' },
  { id: 'link_link_type_line_item_sku_inst_line_001_inst_sku_001', linkTypeId: 'link_type_line_item_sku', sourceObjectInstanceId: 'inst_line_001', targetObjectInstanceId: 'inst_sku_001' },
  { id: 'link_link_type_line_item_sku_inst_line_002_inst_sku_002', linkTypeId: 'link_type_line_item_sku', sourceObjectInstanceId: 'inst_line_002', targetObjectInstanceId: 'inst_sku_002' },
  { id: 'link_link_type_line_item_sku_inst_line_003_inst_sku_002', linkTypeId: 'link_type_line_item_sku', sourceObjectInstanceId: 'inst_line_003', targetObjectInstanceId: 'inst_sku_002' },
  { id: 'link_link_type_sku_material_inst_sku_001_inst_mat_001', linkTypeId: 'link_type_sku_material', sourceObjectInstanceId: 'inst_sku_001', targetObjectInstanceId: 'inst_mat_001' },
  { id: 'link_link_type_sku_material_inst_sku_002_inst_mat_001', linkTypeId: 'link_type_sku_material', sourceObjectInstanceId: 'inst_sku_002', targetObjectInstanceId: 'inst_mat_001' },
  { id: 'link_link_type_sku_material_inst_sku_003_inst_mat_001', linkTypeId: 'link_type_sku_material', sourceObjectInstanceId: 'inst_sku_003', targetObjectInstanceId: 'inst_mat_001' },
  { id: 'link_link_type_line_item_demand_inst_line_001_inst_dem_001', linkTypeId: 'link_type_line_item_demand', sourceObjectInstanceId: 'inst_line_001', targetObjectInstanceId: 'inst_dem_001' },
  { id: 'link_link_type_line_item_demand_inst_line_001_inst_dem_002', linkTypeId: 'link_type_line_item_demand', sourceObjectInstanceId: 'inst_line_001', targetObjectInstanceId: 'inst_dem_002' },
  { id: 'link_link_type_line_item_demand_inst_line_003_inst_dem_003', linkTypeId: 'link_type_line_item_demand', sourceObjectInstanceId: 'inst_line_003', targetObjectInstanceId: 'inst_dem_003' },
  { id: 'link_link_type_demand_material_inst_dem_001_inst_mat_001', linkTypeId: 'link_type_demand_material', sourceObjectInstanceId: 'inst_dem_001', targetObjectInstanceId: 'inst_mat_001' },
  { id: 'link_link_type_demand_material_inst_dem_002_inst_mat_002', linkTypeId: 'link_type_demand_material', sourceObjectInstanceId: 'inst_dem_002', targetObjectInstanceId: 'inst_mat_002' },
  { id: 'link_link_type_demand_material_inst_dem_003_inst_mat_002', linkTypeId: 'link_type_demand_material', sourceObjectInstanceId: 'inst_dem_003', targetObjectInstanceId: 'inst_mat_002' },
  { id: 'link_link_type_production_order_material_inst_po_001_inst_mat_001', linkTypeId: 'link_type_production_order_material', sourceObjectInstanceId: 'inst_po_001', targetObjectInstanceId: 'inst_mat_001' },
  { id: 'link_link_type_production_order_material_inst_po_002_inst_mat_001', linkTypeId: 'link_type_production_order_material', sourceObjectInstanceId: 'inst_po_002', targetObjectInstanceId: 'inst_mat_001' },
  { id: 'link_link_type_production_order_material_inst_po_003_inst_mat_001', linkTypeId: 'link_type_production_order_material', sourceObjectInstanceId: 'inst_po_003', targetObjectInstanceId: 'inst_mat_001' },
  { id: 'link_link_type_production_order_demand_inst_po_001_inst_dem_001', linkTypeId: 'link_type_production_order_demand', sourceObjectInstanceId: 'inst_po_001', targetObjectInstanceId: 'inst_dem_001' },
  { id: 'link_link_type_production_order_demand_inst_po_002_inst_dem_002', linkTypeId: 'link_type_production_order_demand', sourceObjectInstanceId: 'inst_po_002', targetObjectInstanceId: 'inst_dem_002' },
  { id: 'link_link_type_production_order_demand_inst_po_003_inst_dem_003', linkTypeId: 'link_type_production_order_demand', sourceObjectInstanceId: 'inst_po_003', targetObjectInstanceId: 'inst_dem_003' },
  { id: 'link_link_type_production_order_plant_inst_po_001_inst_plant_001', linkTypeId: 'link_type_production_order_plant', sourceObjectInstanceId: 'inst_po_001', targetObjectInstanceId: 'inst_plant_001' },
  { id: 'link_link_type_production_order_plant_inst_po_002_inst_plant_001', linkTypeId: 'link_type_production_order_plant', sourceObjectInstanceId: 'inst_po_002', targetObjectInstanceId: 'inst_plant_001' },
  { id: 'link_link_type_production_order_plant_inst_po_003_inst_plant_003', linkTypeId: 'link_type_production_order_plant', sourceObjectInstanceId: 'inst_po_003', targetObjectInstanceId: 'inst_plant_003' },
  { id: 'link_link_type_flight_origin_airport_server01_workstation_st_burnin_01', linkTypeId: 'link_type_flight_origin_airport', sourceObjectInstanceId: 'server01', targetObjectInstanceId: 'workstation_st_burnin_01' },
  { id: 'link_link_type_flight_origin_airport_server02_workstation_st_burnin_01', linkTypeId: 'link_type_flight_origin_airport', sourceObjectInstanceId: 'server02', targetObjectInstanceId: 'workstation_st_burnin_01' },
  { id: 'link_link_type_flight_origin_airport_server03_workstation_st_burnin_01', linkTypeId: 'link_type_flight_origin_airport', sourceObjectInstanceId: 'server03', targetObjectInstanceId: 'workstation_st_burnin_01' },
  { id: 'link_link_type_flight_origin_airport_server04_workstation_st_burnin_02', linkTypeId: 'link_type_flight_origin_airport', sourceObjectInstanceId: 'server04', targetObjectInstanceId: 'workstation_st_burnin_02' },
  { id: 'link_link_type_flight_origin_airport_server05_workstation_st_burnin_02', linkTypeId: 'link_type_flight_origin_airport', sourceObjectInstanceId: 'server05', targetObjectInstanceId: 'workstation_st_burnin_02' },
  { id: 'link_link_type_flight_origin_airport_server06_workstation_st_burnin_02', linkTypeId: 'link_type_flight_origin_airport', sourceObjectInstanceId: 'server06', targetObjectInstanceId: 'workstation_st_burnin_02' },
  { id: 'link_link_type_flight_origin_airport_server07_workstation_st_burnin_02', linkTypeId: 'link_type_flight_origin_airport', sourceObjectInstanceId: 'server07', targetObjectInstanceId: 'workstation_st_burnin_02' },
  { id: 'link_link_type_flight_origin_airport_server08_workstation_st_burnin_03', linkTypeId: 'link_type_flight_origin_airport', sourceObjectInstanceId: 'server08', targetObjectInstanceId: 'workstation_st_burnin_03' },
  { id: 'link_link_type_flight_origin_airport_server09_workstation_st_burnin_03', linkTypeId: 'link_type_flight_origin_airport', sourceObjectInstanceId: 'server09', targetObjectInstanceId: 'workstation_st_burnin_03' },
  { id: 'link_link_type_flight_origin_airport_server10_workstation_st_burnin_03', linkTypeId: 'link_type_flight_origin_airport', sourceObjectInstanceId: 'server10', targetObjectInstanceId: 'workstation_st_burnin_03' },
  { id: 'link_link_type_server_failure_event_server02_event_burnin_failure_server02', linkTypeId: 'link_type_server_failure_event', sourceObjectInstanceId: 'server02', targetObjectInstanceId: 'event_burnin_failure_server02' },
  { id: 'link_link_type_server_failure_event_server05_event_burnin_failure_server05', linkTypeId: 'link_type_server_failure_event', sourceObjectInstanceId: 'server05', targetObjectInstanceId: 'event_burnin_failure_server05' },
  { id: 'link_link_type_server_failure_event_server06_event_burnin_failure_server06', linkTypeId: 'link_type_server_failure_event', sourceObjectInstanceId: 'server06', targetObjectInstanceId: 'event_burnin_failure_server06' },
  { id: 'link_link_type_workstation_pass_rate_event_workstation_st_burnin_02_event_low_pass_rate_workstation2', linkTypeId: 'link_type_workstation_pass_rate_event', sourceObjectInstanceId: 'workstation_st_burnin_02', targetObjectInstanceId: 'event_low_pass_rate_workstation2' }
]
