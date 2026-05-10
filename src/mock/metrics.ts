import {
  projectInstances,
  projectLineItemInstances,
  serverSkuInstances,
  materialInstances,
  materialDemandInstances,
  productionOrderInstances,
  plantInstances,
  bomLineInstances,
  linkInstances,
} from './index'
import { PROJECT_OBJECT_TYPE_ID, PROJECT_LINE_ITEM_OBJECT_TYPE_ID } from './project'
import { SERVER_SKU_OBJECT_TYPE_ID } from './server'
import {
  MATERIAL_OBJECT_TYPE_ID,
  BOM_LINE_OBJECT_TYPE_ID,
  MATERIAL_DEMAND_OBJECT_TYPE_ID,
} from './material'
import {
  PRODUCTION_ORDER_OBJECT_TYPE_ID,
  PLANT_OBJECT_TYPE_ID,
} from './production'
import {
  LINE_ITEM_TO_DEMAND_LINK_TYPE_ID,
  PRODUCTION_ORDER_TO_PLANT_LINK_TYPE_ID,
} from './links'

// ---------------------------------------------------------------------------
// Chart data types
// ---------------------------------------------------------------------------

export interface CardData {
  type: 'card'
  title: string
  value: number | string
  unit?: string
  color?: string
}

export interface PieData {
  type: 'pie'
  title: string
  data: { name: string; value: number; color?: string }[]
}

export interface BarData {
  type: 'bar'
  title: string
  categories: string[]
  series: { name: string; data: number[]; color?: string }[]
}

export interface LineData {
  type: 'line'
  title: string
  categories: string[]
  series: { name: string; data: number[]; color?: string }[]
}

export type ChartMetric = CardData | PieData | BarData | LineData

// ---------------------------------------------------------------------------
// Project metrics
// ---------------------------------------------------------------------------

/** 项目状态分布 - 饼图 */
export function getProjectStatusDistribution(): PieData {
  const statusMap = new Map<string, number>()
  for (const inst of projectInstances) {
    const status = inst.properties.project_status as string
    statusMap.set(status, (statusMap.get(status) ?? 0) + 1)
  }
  return {
    type: 'pie',
    title: '项目状态分布',
    data: Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })),
  }
}

/** 各客户项目数量 - 柱状图 */
export function getCustomerProjectCount(): BarData {
  const customerMap = new Map<string, number>()
  for (const inst of projectInstances) {
    const customer = inst.properties.customer_name as string
    customerMap.set(customer, (customerMap.get(customer) ?? 0) + 1)
  }
  const entries = Array.from(customerMap.entries())
  return {
    type: 'bar',
    title: '各客户项目数量',
    categories: entries.map(([name]) => name),
    series: [{ name: '项目数量', data: entries.map(([, v]) => v) }],
  }
}

/** 项目概览 - 卡片 */
export function getProjectOverview(): CardData[] {
  const total = projectInstances.length
  const inProduction = projectInstances.filter(
    (i) => i.properties.project_status === '生产中'
  ).length
  const delivered = projectInstances.filter(
    (i) => i.properties.project_status === '已交付'
  ).length
  return [
    { type: 'card', title: '项目总数', value: total, color: '#3b82f6' },
    { type: 'card', title: '生产中项目', value: inProduction, color: '#f59e0b' },
    { type: 'card', title: '已交付项目', value: delivered, color: '#10b981' },
  ]
}

// ---------------------------------------------------------------------------
// Line item metrics
// ---------------------------------------------------------------------------

/** 行项概览 - 卡片 */
export function getLineItemOverview(): CardData[] {
  const total = projectLineItemInstances.length
  const totalQty = projectLineItemInstances.reduce((sum, i) => sum + (i.properties.quantity as number), 0)

  const hasDemandCount = projectLineItemInstances.filter((lineItem) => {
    return linkInstances.some((link) => link.linkTypeId === LINE_ITEM_TO_DEMAND_LINK_TYPE_ID && link.sourceObjectInstanceId === lineItem.id)
  }).length
  const coverage = total ? Math.round((hasDemandCount / total) * 100) : 0

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const nearDueNotScheduled = projectLineItemInstances.filter((lineItem) => {
    const confirmed = lineItem.properties.confirmed_delivery_date as string | undefined
    if (!confirmed) return false
    const confirmedDate = new Date(confirmed)
    confirmedDate.setHours(0, 0, 0, 0)
    const daysLeft = Math.round((confirmedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return (lineItem.properties.production_status as string) === '待排产' && daysLeft >= 0 && daysLeft <= 14
  }).length

  const estimatedLate = projectLineItemInstances.filter((lineItem) => {
    const estimatedEnd = lineItem.properties.estimated_production_end_date as string | undefined
    const confirmed = lineItem.properties.confirmed_delivery_date as string | undefined
    if (!estimatedEnd || !confirmed) return false
    return new Date(estimatedEnd).getTime() > new Date(confirmed).getTime()
  }).length

  const commitDeltas = projectLineItemInstances
    .map((lineItem) => {
      const requested = lineItem.properties.requested_delivery_date as string | undefined
      const confirmed = lineItem.properties.confirmed_delivery_date as string | undefined
      if (!requested || !confirmed) return null
      const req = new Date(requested)
      const con = new Date(confirmed)
      req.setHours(0, 0, 0, 0)
      con.setHours(0, 0, 0, 0)
      return Math.round((con.getTime() - req.getTime()) / (1000 * 60 * 60 * 24))
    })
    .filter((value): value is number => value !== null)
  const avgCommitDelta = commitDeltas.length ? Math.round(commitDeltas.reduce((a, b) => a + b, 0) / commitDeltas.length) : 0

  return [
    { type: 'card', title: '行项数', value: total, color: '#f59e0b' },
    { type: 'card', title: '订购数量', value: totalQty, color: '#2563eb' },
    { type: 'card', title: '需求覆盖率', value: coverage, unit: '%', color: coverage >= 80 ? '#10b981' : '#f59e0b' },
    { type: 'card', title: '临期未排产', value: nearDueNotScheduled, color: nearDueNotScheduled > 0 ? '#f59e0b' : '#64748b' },
    { type: 'card', title: '预计晚交', value: estimatedLate, color: estimatedLate > 0 ? '#ef4444' : '#64748b' },
    { type: 'card', title: '平均承诺偏差', value: avgCommitDelta, unit: 'd', color: '#64748b' },
  ]
}

/** 行项生产状态分布 - 饼图 */
export function getLineItemProductionStatusDistribution(): PieData {
  const statusMap = new Map<string, number>()
  for (const inst of projectLineItemInstances) {
    const status = inst.properties.production_status as string
    statusMap.set(status, (statusMap.get(status) ?? 0) + 1)
  }
  return {
    type: 'pie',
    title: '生产状态分布',
    data: Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })),
  }
}

/** 项目行项履行状态分布 - 饼图 */
export function getFulfillmentStatusDistribution(): PieData {
  const statusMap = new Map<string, number>()
  for (const inst of projectLineItemInstances) {
    const status = inst.properties.fulfillment_status as string
    statusMap.set(status, (statusMap.get(status) ?? 0) + 1)
  }
  return {
    type: 'pie',
    title: '交付状态分布',
    data: Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })),
  }
}

/** 各SKU订购数量 - 柱状图 */
export function getSkuOrderQuantity(): BarData {
  const skuMap = new Map<string, number>()
  for (const inst of projectLineItemInstances) {
    const sku = inst.properties.sku_code as string
    const qty = inst.properties.quantity as number
    skuMap.set(sku, (skuMap.get(sku) ?? 0) + qty)
  }
  const entries = Array.from(skuMap.entries())
  return {
    type: 'bar',
    title: '各型号订购数量',
    categories: entries.map(([name]) => name),
    series: [{ name: '订购数量', data: entries.map(([, v]) => v) }],
  }
}

// ---------------------------------------------------------------------------
// Server SKU metrics
// ---------------------------------------------------------------------------

/** 服务器类别分布 - 饼图 */
export function getSkuCategoryDistribution(): PieData {
  const catMap = new Map<string, number>()
  for (const inst of serverSkuInstances) {
    const cat = inst.properties.category as string
    catMap.set(cat, (catMap.get(cat) ?? 0) + 1)
  }
  return {
    type: 'pie',
    title: '服务器类别分布',
    data: Array.from(catMap.entries()).map(([name, value]) => ({ name, value })),
  }
}

/** 各型号 CPU 核心数 - 柱状图 */
export function getSkuCpuCores(): BarData {
  return {
    type: 'bar',
    title: '各型号 CPU 核心数',
    categories: serverSkuInstances.map((i) => i.properties.sku_name as string),
    series: [
      {
        name: 'CPU 核心数',
        data: serverSkuInstances.map((i) => i.properties.cpu_cores as number),
      },
    ],
  }
}

/** 各型号内存容量 - 柱状图 */
export function getSkuMemoryCapacity(): BarData {
  return {
    type: 'bar',
    title: '各型号内存容量 (GB)',
    categories: serverSkuInstances.map((i) => i.properties.sku_name as string),
    series: [
      {
        name: '内存 (GB)',
        data: serverSkuInstances.map((i) => i.properties.memory_gb as number),
      },
    ],
  }
}

/** 各型号存储容量 - 柱状图 */
export function getSkuStorageCapacity(): BarData {
  return {
    type: 'bar',
    title: '各型号存储容量 (GB)',
    categories: serverSkuInstances.map((i) => i.properties.sku_name as string),
    series: [
      {
        name: '存储 (GB)',
        data: serverSkuInstances.map((i) => i.properties.storage_capacity_gb as number),
      },
    ],
  }
}

/** 产品生命周期状态分布 - 饼图 */
export function getSkuLifecycleStatus(): PieData {
  const statusMap = new Map<string, number>()
  for (const inst of serverSkuInstances) {
    const s = inst.properties.lifecycle_status as string
    statusMap.set(s, (statusMap.get(s) ?? 0) + 1)
  }
  return {
    type: 'pie',
    title: '产品生命周期状态',
    data: Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })),
  }
}

/** 服务器型号概览 - 卡片 */
export function getSkuOverview(): CardData[] {
  const total = serverSkuInstances.length
  const onSale = serverSkuInstances.filter(
    (i) => i.properties.lifecycle_status === '在售'
  ).length
  return [
    { type: 'card', title: 'SKU 总数', value: total, color: '#10b981' },
    { type: 'card', title: '在售型号', value: onSale, color: '#3b82f6' },
  ]
}

// ---------------------------------------------------------------------------
// Material metrics
// ---------------------------------------------------------------------------

/** 物料类型分布 - 饼图 */
export function getMaterialTypeDistribution(): PieData {
  const typeMap = new Map<string, number>()
  for (const inst of materialInstances) {
    const t = inst.properties.material_type as string
    typeMap.set(t, (typeMap.get(t) ?? 0) + 1)
  }
  return {
    type: 'pie',
    title: '物料类型分布',
    data: Array.from(typeMap.entries()).map(([name, value]) => ({ name, value })),
  }
}

/** 供应方式分布 - 饼图 */
export function getSupplyTypeDistribution(): PieData {
  const typeMap = new Map<string, number>()
  for (const inst of materialInstances) {
    const t = inst.properties.default_supply_type as string
    typeMap.set(t, (typeMap.get(t) ?? 0) + 1)
  }
  return {
    type: 'pie',
    title: '供应方式分布',
    data: Array.from(typeMap.entries()).map(([name, value]) => ({ name, value })),
  }
}

/** 物料提前期对比 - 柱状图 */
export function getMaterialLeadTime(): BarData {
  return {
    type: 'bar',
    title: '物料提前期 (天)',
    categories: materialInstances.map(
      (i) => i.properties.material_name as string
    ),
    series: [
      {
        name: '提前期 (天)',
        data: materialInstances.map((i) => i.properties.lead_time_days as number),
      },
    ],
  }
}

/** 物料概览 - 卡片 */
export function getMaterialOverview(): CardData[] {
  return [
    { type: 'card', title: '物料总数', value: materialInstances.length, color: '#8b5cf6' },
    { type: 'card', title: 'BOM 行数', value: 3, color: '#ec4899' },
  ]
}

// ---------------------------------------------------------------------------
// Material demand metrics
// ---------------------------------------------------------------------------

/** 物料需求概览 - 卡片 */
export function getDemandOverview(): CardData[] {
  const total = materialDemandInstances.length
  const totalQty = materialDemandInstances.reduce((sum, i) => sum + (i.properties.quantity as number), 0)
  const unmet = materialDemandInstances.filter((i) => i.properties.status === '未满足').length

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const overdueLatestOrder = materialDemandInstances.filter((i) => {
    const latest = i.properties.latest_order_date as string | undefined
    if (!latest) return false
    return new Date(latest).getTime() < now.getTime() && i.properties.status !== '已满足'
  }).length

  const overdueDemandDate = materialDemandInstances.filter((i) => {
    const due = i.properties.demand_date as string | undefined
    if (!due) return false
    return new Date(due).getTime() < now.getTime() && i.properties.status !== '已满足'
  }).length

  return [
    { type: 'card', title: '需求条数', value: total, color: '#f97316' },
    { type: 'card', title: '需求总量', value: totalQty, color: '#2563eb' },
    { type: 'card', title: '未满足', value: unmet, color: unmet > 0 ? '#f59e0b' : '#10b981' },
    { type: 'card', title: '最晚下单逾期', value: overdueLatestOrder, color: overdueLatestOrder > 0 ? '#ef4444' : '#64748b' },
    { type: 'card', title: '需求到期逾期', value: overdueDemandDate, color: overdueDemandDate > 0 ? '#ef4444' : '#64748b' },
  ]
}

/** 物料需求状态分布 - 饼图 */
export function getDemandStatusDistribution(): PieData {
  const statusMap = new Map<string, number>()
  for (const inst of materialDemandInstances) {
    const s = inst.properties.status as string
    statusMap.set(s, (statusMap.get(s) ?? 0) + 1)
  }
  return {
    type: 'pie',
    title: '物料需求状态分布',
    data: Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })),
  }
}

/** 物料需求量 - 柱状图 */
export function getDemandQuantity(): BarData {
  return {
    type: 'bar',
    title: '物料需求量',
    categories: materialDemandInstances.map(
      (i) => `需求#${i.properties.id}`
    ),
    series: [
      {
        name: '需求量',
        data: materialDemandInstances.map((i) => i.properties.quantity as number),
      },
    ],
  }
}

/** 需求类型分布 - 饼图 */
export function getDemandTypeDistribution(): PieData {
  const typeMap = new Map<string, number>()
  for (const inst of materialDemandInstances) {
    const t = inst.properties.demand_type as string
    typeMap.set(t, (typeMap.get(t) ?? 0) + 1)
  }
  return {
    type: 'pie',
    title: '需求类型分布',
    data: Array.from(typeMap.entries()).map(([name, value]) => ({ name, value })),
  }
}

// ---------------------------------------------------------------------------
// Production order metrics
// ---------------------------------------------------------------------------

/** 工单负荷（按工厂）- 柱状图 */
export function getProductionLoadByPlant(): BarData {
  const plantQty = new Map<string, number>()

  for (const link of linkInstances) {
    if (link.linkTypeId !== PRODUCTION_ORDER_TO_PLANT_LINK_TYPE_ID) continue
    const plantId = link.targetObjectInstanceId
    const woId = link.sourceObjectInstanceId
    const wo = productionOrderInstances.find((item) => item.id === woId)
    if (!wo) continue
    const qty = wo.properties.quantity as number
    plantQty.set(plantId, (plantQty.get(plantId) ?? 0) + qty)
  }

  const entries = plantInstances.map((plant) => {
    const name = plant.properties.plant_name as string
    const qty = plantQty.get(plant.id) ?? 0
    return { name, qty }
  })

  return {
    type: 'bar',
    title: '工厂负荷 (数量)',
    categories: entries.map((i) => i.name),
    series: [{ name: '数量', data: entries.map((i) => i.qty), color: '#2563eb' }],
  }
}

/** 生产订单状态分布 - 饼图 */
export function getProductionOrderStatusDistribution(): PieData {
  const statusMap = new Map<string, number>()
  for (const inst of productionOrderInstances) {
    const s = inst.properties.status as string
    statusMap.set(s, (statusMap.get(s) ?? 0) + 1)
  }
  return {
    type: 'pie',
    title: '生产订单状态分布',
    data: Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })),
  }
}

/** 生产订单数量对比 - 柱状图 */
export function getProductionOrderQuantity(): BarData {
  return {
    type: 'bar',
    title: '各生产订单数量',
    categories: productionOrderInstances.map(
      (i) => i.properties.production_order_number as string
    ),
    series: [
      {
        name: '生产数量',
        data: productionOrderInstances.map((i) => i.properties.quantity as number),
      },
    ],
  }
}

/** 生产订单概览 - 卡片 */
export function getProductionOrderOverview(): CardData[] {
  const total = productionOrderInstances.length
  const totalQty = productionOrderInstances.reduce(
    (sum, i) => sum + (i.properties.quantity as number),
    0
  )
  return [
    { type: 'card', title: '生产订单数', value: total, color: '#ef4444' },
    { type: 'card', title: '总生产数量', value: totalQty, color: '#f97316' },
  ]
}

// ---------------------------------------------------------------------------
// Plant (工厂) metrics
// ---------------------------------------------------------------------------

/** 工厂分布 - 卡片 */
export function getPlantOverview(): CardData[] {
  return [
    { type: 'card', title: '工厂数量', value: plantInstances.length, color: '#06b6d4' },
    ...plantInstances.map((i) => ({
      type: 'card' as const,
      title: i.properties.plant_name as string,
      value: i.properties.location as string,
      color: '#06b6d4',
    })),
  ]
}

// ---------------------------------------------------------------------------
// BOM line metrics
// ---------------------------------------------------------------------------

/** BOM 层级分布 */
export function getBomLevelDistribution(): PieData {
  const levelMap = new Map<string, number>()
  for (const inst of bomLineInstances) {
    const level = `Level ${inst.properties.bom_level}`
    levelMap.set(level, (levelMap.get(level) ?? 0) + 1)
  }
  return {
    type: 'pie',
    title: 'BOM 层级分布',
    data: Array.from(levelMap.entries()).map(([name, value]) => ({ name, value })),
  }
}

// ---------------------------------------------------------------------------
// Per-instance metrics: get custom metric cards for a single instance
// ---------------------------------------------------------------------------

function daysFromNow(dateStr: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function dayDiff(start: string, end: string): number {
  const a = new Date(start)
  const b = new Date(end)
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * 根据实例 ID 返回该实例的定制指标卡片。
 * 例如传入 materialDemandInstances 的 id，返回"距离最晚下单时间"、"距离需求时间"等卡片。
 */
export function getInstanceMetrics(instanceId: string): CardData[] {
  const all = [
    ...projectInstances,
    ...projectLineItemInstances,
    ...serverSkuInstances,
    ...materialInstances,
    ...bomLineInstances,
    ...materialDemandInstances,
    ...productionOrderInstances,
    ...plantInstances,
  ]
  const inst = all.find((i) => i.id === instanceId)
  if (!inst) return []

  const p = inst.properties
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  switch (inst.objectTypeId) {
    // ---- Project ----
    case PROJECT_OBJECT_TYPE_ID: {
      const reqDate = p.requested_delivery_date as string
      const days = daysFromNow(reqDate)
      return [
        { type: 'card', title: '项目编号', value: p.project_id as string, color: '#3b82f6' },
        { type: 'card', title: '项目名称', value: p.project_name as string, color: '#1e40af' },
        { type: 'card', title: '客户名称', value: p.customer_name as string, color: '#6366f1' },
        { type: 'card', title: '项目状态', value: p.project_status as string, color: '#f59e0b' },
        { type: 'card', title: '距离交付日期', value: days, unit: '天', color: days <= 30 ? '#ef4444' : '#10b981' },
      ]
    }

    // ---- Project Line Item ----
    case PROJECT_LINE_ITEM_OBJECT_TYPE_ID: {
      const reqDate = p.requested_delivery_date as string
      const confDate = p.confirmed_delivery_date as string | undefined
      const estStart = p.estimated_production_start_date as string | undefined
      const estEnd = p.estimated_production_end_date as string | undefined
      const cards: CardData[] = [
        { type: 'card', title: 'SKU 编号', value: p.sku_code as string, color: '#f59e0b' },
        { type: 'card', title: '订购数量', value: p.quantity as number, color: '#2563eb' },
        { type: 'card', title: '生产状态', value: p.production_status as string, color: '#8b5cf6' },
        { type: 'card', title: '交付状态', value: p.fulfillment_status as string, color: '#ec4899' },
        { type: 'card', title: '距离要求交付', value: daysFromNow(reqDate), unit: '天', color: daysFromNow(reqDate) <= 30 ? '#ef4444' : '#10b981' },
      ]
      if (confDate) cards.push({ type: 'card', title: '距离承诺交付', value: daysFromNow(confDate), unit: '天', color: daysFromNow(confDate) <= 14 ? '#ef4444' : '#10b981' })
      if (estStart && estEnd) cards.push({ type: 'card', title: '预计生产周期', value: dayDiff(estStart, estEnd), unit: '天', color: '#64748b' })
      return cards
    }

    // ---- Server SKU ----
    case SERVER_SKU_OBJECT_TYPE_ID:
      return [
        { type: 'card', title: '型号编码', value: p.sku_code as string, color: '#10b981' },
        { type: 'card', title: '型号名称', value: p.sku_name as string, color: '#059669' },
        { type: 'card', title: '类别', value: p.category as string, color: '#06b6d4' },
        { type: 'card', title: '品牌系列', value: p.brand_line as string, color: '#6366f1' },
        { type: 'card', title: 'CPU 型号', value: p.cpu_model as string, color: '#a855f7' },
        { type: 'card', title: 'CPU 核心数', value: p.cpu_cores as number, color: '#7c3aed' },
        { type: 'card', title: '内存', value: p.memory_gb as number, unit: 'GB', color: '#2563eb' },
        { type: 'card', title: '存储类型', value: p.storage_type as string, color: '#0891b2' },
        { type: 'card', title: '存储容量', value: p.storage_capacity_gb as number, unit: 'GB', color: '#0e7490' },
        { type: 'card', title: '网卡', value: p.network_interface as string, color: '#64748b' },
        { type: 'card', title: '外形尺寸', value: p.form_factor as string, color: '#475569' },
        { type: 'card', title: '质保', value: p.warranty_years as number, unit: '年', color: '#16a34a' },
        { type: 'card', title: '生命周期', value: p.lifecycle_status as string, color: '#dc2626' },
      ]

    // ---- Material ----
    case MATERIAL_OBJECT_TYPE_ID:
      return [
        { type: 'card', title: '物料编码', value: p.material_code as string, color: '#8b5cf6' },
        { type: 'card', title: '物料名称', value: p.material_name as string, color: '#7c3aed' },
        { type: 'card', title: '物料类型', value: p.material_type as string, color: '#a855f7' },
        { type: 'card', title: '单位', value: p.unit as string, color: '#6366f1' },
        { type: 'card', title: '供应方式', value: p.default_supply_type as string, color: '#06b6d4' },
        { type: 'card', title: '提前期', value: p.lead_time_days as number, unit: '天', color: p.lead_time_days as number > 30 ? '#f59e0b' : '#10b981' },
      ]

    // ---- BOM Line ----
    case BOM_LINE_OBJECT_TYPE_ID: {
      const effDate = p.effective_date as string
      const obsDate = p.obsolescence_date as string
      return [
        { type: 'card', title: 'BOM ID', value: p.id as number, color: '#ec4899' },
        { type: 'card', title: '单位用量', value: p.quantity_per as number, color: '#db2777' },
        { type: 'card', title: 'BOM 层级', value: p.bom_level as number, color: '#be185d' },
        { type: 'card', title: '距离生效日期', value: daysFromNow(effDate), unit: '天', color: daysFromNow(effDate) > 0 ? '#10b981' : '#64748b' },
        { type: 'card', title: '距离失效日期', value: daysFromNow(obsDate), unit: '天', color: daysFromNow(obsDate) <= 90 ? '#f59e0b' : '#10b981' },
      ]
    }

    // ---- Material Demand ----
    case MATERIAL_DEMAND_OBJECT_TYPE_ID: {
      const demandDate = p.demand_date as string
      const latestOrder = p.latest_order_date as string
      const daysDemand = daysFromNow(demandDate)
      const daysOrder = daysFromNow(latestOrder)
      return [
        { type: 'card', title: '需求 ID', value: p.id as number, color: '#f97316' },
        { type: 'card', title: '需求类型', value: p.demand_type as string, color: '#ea580c' },
        { type: 'card', title: '需求量', value: p.quantity as number, color: '#2563eb' },
        { type: 'card', title: '需求状态', value: p.status as string, color: '#dc2626' },
        { type: 'card', title: '距离需求日期', value: daysDemand, unit: '天', color: daysDemand <= 14 ? '#ef4444' : daysDemand <= 30 ? '#f59e0b' : '#10b981' },
        { type: 'card', title: '距离最晚下单', value: daysOrder, unit: '天', color: daysOrder <= 0 ? '#ef4444' : daysOrder <= 7 ? '#f59e0b' : '#10b981' },
      ]
    }

    // ---- Production Order ----
    case PRODUCTION_ORDER_OBJECT_TYPE_ID: {
      const planStart = p.planned_start_date as string
      const planEnd = p.planned_end_date as string
      const daysStart = daysFromNow(planStart)
      const daysEnd = daysFromNow(planEnd)
      return [
        { type: 'card', title: '生产订单号', value: p.production_order_number as string, color: '#ef4444' },
        { type: 'card', title: '生产数量', value: p.quantity as number, color: '#2563eb' },
        { type: 'card', title: '订单状态', value: p.status as string, color: '#dc2626' },
        { type: 'card', title: '距离计划开始', value: daysStart, unit: '天', color: daysStart <= 7 ? '#f59e0b' : '#10b981' },
        { type: 'card', title: '距离计划结束', value: daysEnd, unit: '天', color: daysEnd <= 0 ? '#ef4444' : '#10b981' },
        { type: 'card', title: '计划生产周期', value: dayDiff(planStart, planEnd), unit: '天', color: '#64748b' },
      ]
    }

    // ---- Plant ----
    case PLANT_OBJECT_TYPE_ID:
      return [
        { type: 'card', title: '工厂编码', value: p.plant_code as string, color: '#06b6d4' },
        { type: 'card', title: '工厂名称', value: p.plant_name as string, color: '#0891b2' },
        { type: 'card', title: '位置', value: p.location as string, color: '#0e7490' },
      ]

    default:
      return []
  }
}

// ---------------------------------------------------------------------------
// Unified: get metrics by ObjectType ID
// ---------------------------------------------------------------------------

/**
 * 根据 ObjectType ID 返回该对象类型的所有图表指标。
 * 返回 ChartMetric[] 数组，包含饼图、柱状图、折线图、卡片等。
 */
export function getMetricsByObjectTypeId(objectTypeId: string): ChartMetric[] {
  switch (objectTypeId) {
    case PROJECT_OBJECT_TYPE_ID:
      return [
        ...getProjectOverview(),
        getProjectStatusDistribution(),
        getCustomerProjectCount(),
      ]

    case PROJECT_LINE_ITEM_OBJECT_TYPE_ID:
      return [
        ...getLineItemOverview(),
        getLineItemProductionStatusDistribution(),
        getFulfillmentStatusDistribution(),
        getSkuOrderQuantity(),
      ]

    case SERVER_SKU_OBJECT_TYPE_ID:
      return [
        ...getSkuOverview(),
        getSkuCategoryDistribution(),
        getSkuLifecycleStatus(),
        getSkuCpuCores(),
        getSkuMemoryCapacity(),
        getSkuStorageCapacity(),
      ]

    case MATERIAL_OBJECT_TYPE_ID:
      return [
        ...getMaterialOverview(),
        getMaterialTypeDistribution(),
        getSupplyTypeDistribution(),
        getMaterialLeadTime(),
      ]

    case BOM_LINE_OBJECT_TYPE_ID:
      return [getBomLevelDistribution()]

    case MATERIAL_DEMAND_OBJECT_TYPE_ID:
      return [
        ...getDemandOverview(),
        getDemandStatusDistribution(),
        getDemandTypeDistribution(),
        getDemandQuantity(),
      ]

    case PRODUCTION_ORDER_OBJECT_TYPE_ID:
      return [
        ...getProductionOrderOverview(),
        getProductionOrderStatusDistribution(),
        getProductionLoadByPlant(),
        getProductionOrderQuantity(),
      ]

    case PLANT_OBJECT_TYPE_ID:
      return getPlantOverview()

    default:
      return []
  }
}
