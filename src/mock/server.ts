import { type ObjectType, type PropertyType, type ObjectInstance } from './types'

export const SERVER_SKU_OBJECT_TYPE_ID = 'object_type_server_sku'

export const serverSkuProperties: PropertyType[] = [
  { id: 'sku_code', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, apiName: 'skuCode', displayName: 'SKU Code', description: '型号唯一编码，如 SRV-R740-001', baseType: 'string', required: true, isPrimaryKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'sku_name', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, apiName: 'skuName', displayName: 'SKU Name', description: '型号名称，如 PowerEdge R740 银牌双路', baseType: 'string', required: true, isTitleKey: true, searchable: true, sortable: true, filterable: true },
  { id: 'category', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, apiName: 'category', displayName: 'Category', description: '服务器类别：机架式/刀片/塔式/GPU服务器', baseType: 'enum', searchable: true, sortable: true, filterable: true },
  { id: 'brand_line', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, apiName: 'brandLine', displayName: 'Brand Line', description: '品牌系列，如 Dell PowerEdge', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'cpu_model', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, apiName: 'cpuModel', displayName: 'CPU Model', description: 'CPU 型号', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'cpu_cores', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, apiName: 'cpuCores', displayName: 'CPU Cores', description: 'CPU 核心数', baseType: 'number', sortable: true, filterable: true },
  { id: 'memory_gb', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, apiName: 'memoryGb', displayName: 'Memory GB', description: '内存大小（GB）', baseType: 'integer', sortable: true, filterable: true },
  { id: 'storage_type', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, apiName: 'storageType', displayName: 'Storage Type', description: '主存储类型，如 SSD SAS / NVMe', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'storage_capacity_gb', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, apiName: 'storageCapacityGb', displayName: 'Storage Capacity GB', description: '存储容量（GB）', baseType: 'integer', sortable: true, filterable: true },
  { id: 'network_interface', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, apiName: 'networkInterface', displayName: 'Network Interface', description: '网卡规格', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'form_factor', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, apiName: 'formFactor', displayName: 'Form Factor', description: '外形尺寸描述', baseType: 'string', searchable: true, sortable: true, filterable: true },
  { id: 'warranty_years', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, apiName: 'warrantyYears', displayName: 'Warranty Years', description: '标准质保年限', baseType: 'integer', sortable: true, filterable: true },
  { id: 'lifecycle_status', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, apiName: 'lifecycleStatus', displayName: 'Lifecycle Status', description: '产品状态：在售/停产/促销', baseType: 'enum', searchable: true, sortable: true, filterable: true }
]

export const serverSkuObjectType: ObjectType = {
  id: SERVER_SKU_OBJECT_TYPE_ID,
  apiName: 'serverSku',
  displayName: 'Server SKU',
  description: '服务器型号主数据',
  icon: 'server',
  color: '#10b981',
  status: 'active',
  primaryKeyPropertyId: 'sku_code',
  titlePropertyId: 'sku_name',
  properties: serverSkuProperties
}

export const serverSkuInstances: ObjectInstance[] = [
  { id: 'inst_sku_001', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, properties: { sku_code: 'SRV-R740-001', sku_name: 'PowerEdge R740 银牌双路', category: '机架式', brand_line: 'Dell PowerEdge', cpu_model: 'Intel Xeon Silver 4214', cpu_cores: 16, memory_gb: 128, storage_type: 'SSD SAS', storage_capacity_gb: 1920, network_interface: 'Broadcom 57416 10GbE', form_factor: '2U', warranty_years: 3, lifecycle_status: '在售' } },
  { id: 'inst_sku_002', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, properties: { sku_code: 'SRV-DL380-002', sku_name: 'ProLiant DL380 Gen10 金牌双路', category: '机架式', brand_line: 'HPE ProLiant', cpu_model: 'Intel Xeon Gold 6248', cpu_cores: 20, memory_gb: 256, storage_type: 'NVMe', storage_capacity_gb: 3840, network_interface: 'HPE FlexFabric 10GbE', form_factor: '2U', warranty_years: 3, lifecycle_status: '在售' } },
  { id: 'inst_sku_003', objectTypeId: SERVER_SKU_OBJECT_TYPE_ID, properties: { sku_code: 'SRV-GPU-003', sku_name: 'SuperServer GPU 4路', category: 'GPU服务器', brand_line: 'SuperMicro', cpu_model: 'AMD EPYC 7742', cpu_cores: 64, memory_gb: 512, storage_type: 'NVMe', storage_capacity_gb: 7680, network_interface: 'Mellanox ConnectX-6 25GbE', form_factor: '4U', warranty_years: 5, lifecycle_status: '促销' } }
]
