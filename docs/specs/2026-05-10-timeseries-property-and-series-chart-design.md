# 时间序列属性（Mock）+ LeftSelectionPanel Series 图表（设计）

**日期：** 2026-05-10  
**目标：** 在 `src/mock` 新增一种“时间序列（Time Series）”属性类型：属性定义绑定到 `ObjectType`，具体时间序列值绑定到 `ObjectInstance`；并在点击 `ObjectInstance` 后，在 `src/components/LeftSelectionPanel.vue` 的 **Series** 选项中用一张图表叠加展示两条序列（每日计划生产数量 / 每日实际生产数量）。

---

## 范围（Scope）

### In Scope
- 新增 `PropertyType.baseType = 'timeseries'`（在 mock 类型定义层）。
- 在 `ProductionOrder`（生产订单）ObjectType 上增加 2 个时间序列属性：
  - `dailyPlannedQuantity`：每日计划生产数量
  - `dailyActualQuantity`：每日实际生产数量
- 为每个生产订单 `ObjectInstance` 生成 mock 时间序列值（例如连续 14 天，按日粒度）。
- `LeftSelectionPanel` 的 **Series** 子选项实现 1 张叠加折线图（计划 vs 实际），无需复杂交互（hover tooltip 可选，默认不做）。

### Out of Scope
- 不接入真实后端/数据库。
- 不引入 ECharts / Chart.js 等第三方图表库（保持轻量，纯 DOM/SVG 实现）。
- 不做时间序列筛选、对齐、聚合、缺失填补等复杂逻辑。

---

## 数据模型设计（Mock Types）

### 1) `PropertyType` 扩展
在 `src/mock/types.ts`：
- `PropertyType.baseType` 增加 `'timeseries'`
- `PropertyType` 增加可选 schema：
  - `timeSeries?: { granularity: 'day' | 'hour'; valueBaseType: 'number' | 'integer'; unit?: string }`

### 2) `PropertyValue` 扩展
在 `src/mock/types.ts`：
- 新增类型：
  - `TimeSeriesPoint = { ts: string; value: number | null }`
  - `TimeSeriesValue = { granularity: 'day' | 'hour'; unit?: string; points: TimeSeriesPoint[] }`
- `PropertyValue` union 增加 `TimeSeriesValue`

> `ts` 字段：按日粒度时使用 `YYYY-MM-DD`；按小时粒度时使用 ISO datetime 字符串（例如 `2026-05-10T08:00:00Z`）。本需求默认按日粒度。

---

## ProductionOrder 的时间序列属性与实例 mock

在 `src/mock/production.ts`：

### 1) ObjectType 属性定义
在 `productionOrderProperties` 增加：
- `daily_planned_quantity` / `dailyActualQuantity`（id 命名可保持现有下划线风格，apiName 采用 camelCase）：
  - `baseType: 'timeseries'`
  - `timeSeries: { granularity: 'day', valueBaseType: 'integer', unit: 'pcs' }`

> 统一约定：`ObjectInstance.properties` 存值时，优先使用 `property.apiName` 作为 key（与当前代码匹配）。

### 2) ObjectInstance 值（绑定到实例）
为 `productionOrderInstances` 中每个实例增加：
- `dailyPlannedQuantity: TimeSeriesValue`
- `dailyActualQuantity: TimeSeriesValue`

mock 生成规则（确定性，便于稳定展示）：
- 生成连续 14 天序列（起始日期可与 `planned_start_date` 对齐；若为空则用固定日期）
- `planned`：每天固定值或小幅波动（例如 10/12/8…）
- `actual`：围绕 planned 略有偏差（例如 planned * 0.85 ~ 1.05），可带少量 `null` 表示缺失（可选）

---

## UI：LeftSelectionPanel Series 图表

### 1) 数据传递方式
当前 `LeftSelectionPanel` 仅接收 `SelectedObject`（字符串化属性），无法直接拿到时间序列对象值。

因此扩展 `SelectedObject`（`src/types/graph.ts`）增加可选字段：

- `timeSeries?: Array<{ apiName: string; displayName: string; unit?: string; granularity: 'day' | 'hour'; points: Array<{ ts: string; value: number | null }> }>`

在 `src/components/GraphCanvas.vue` 的 `toSelectedObject(node)`：
- 当 `node.nodeKind === 'objectInstance'` 时：
  - 从 `objectType.properties` 中筛选 `baseType === 'timeseries'`
  - 从 `node.instance.properties[property.apiName]` 读取 `TimeSeriesValue`
  - 组装到 `SelectedObject.timeSeries`
- 同时在 `SelectedObject.properties`（Properties tab 的 key/value 列表）中 **过滤掉** `baseType === 'timeseries'` 的属性，避免在 Properties 里出现空值/杂讯。

### 2) Series tab 行为
在 `src/components/LeftSelectionPanel.vue`：
- 将当前 “Series empty state” 的 `v-else` 替换为显式分支：`v-else-if="activeSecondaryTab === 'Series'"`。
- 当 `selectedObject.timeSeries` 中同时存在：
  - `dailyPlannedQuantity`
  - `dailyActualQuantity`
 以 **单张图表叠加两条折线** 展示（蓝色 = planned，紫色/绿色 = actual；具体色值以现有 UI 主色为准）。
- 若没有任何 `timeSeries` 数据：显示 “No series configured for this object.”

### 3) 图表实现（纯 SVG）
新增一个轻量组件（建议）：
- `src/components/TimeSeriesChart.vue`

Props（最小化）：
- `series: Array<{ key: string; label: string; color: string; unit?: string; points: Array<{ ts: string; value: number | null }> }>`
- `height?: number`（默认 160）

渲染规则：
- X 轴：按 points 顺序等距分布（不做时间比例刻度）
- Y 轴：取所有 series 的非空值 min/max，给 10% padding；max==min 时做兜底范围
- 线条：`path` 折线；遇到 `null` 断线（分段路径）
- 简单 legend：显示 planned / actual 标签与色块

---

## 验收标准（Acceptance Criteria）

- `src/mock` 中 ProductionOrder ObjectType 含 2 个 timeseries 属性定义。
- `productionOrderInstances` 中每个实例都带对应 timeseries mock 值（14 天）。
- 点击生产订单 ObjectInstance 后，`LeftSelectionPanel` 的 **Series** 里显示 1 张图表叠加两条折线（计划 vs 实际）。
- 不引入第三方图表库；项目能正常 `npm run dev` 编译运行。

