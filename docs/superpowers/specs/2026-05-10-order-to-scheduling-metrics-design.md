# Order-to-Scheduling Metrics Design (ProjectLineItem → MaterialDemand → ProductionOrder)

## Context

This repo already contains a Vue 3 graph-style UI prototype and a mock object graph under `src/mock`.

We want to design a consistent set of **metric dimensions** and **metric templates** for an order-to-scheduling scenario:

- Order intake is represented by `Project` and `ProjectLineItem`.
- Demand explosion / requirements are represented by `MaterialDemand` (linked to `Material`).
- Scheduling / execution intent is represented by `ProductionOrder` (linked to `Plant`, `Material`, `MaterialDemand`).

This spec focuses on metric definitions and *calculation-ready* formulas that can be computed from the existing mock model (fields + links), while explicitly marking gaps that require future data.

## Goals

- Define a reusable **metric framework** (dimensions + calculation primitives).
- Provide a **metric dictionary** for:
  - `ProjectLineItem` (order line items)
  - `MaterialDemand` (requirements)
  - `ProductionOrder` (work orders / scheduling)
- Split metrics into:
  - **ObjectType metrics** (aggregate metrics over all instances, for overview/list pages)
  - **Instance metrics** (single-object detail metrics, for a vertex detail page)
- Keep the first version compatible with current `src/mock` data without requiring new object types.

## Non-Goals

- Do not implement charts, dashboards, or storage for metric definitions.
- Do not implement “true” production actuals (reporting, completion quantities, WIP at operation level).
- Do not introduce new backend services.
- Do not guarantee metric accuracy beyond current mock data constraints.

## Assumptions (Scenario A)

- “Order” is `Project` / `ProjectLineItem`.
- “Scheduling / work order” is `ProductionOrder`.
- Scheduling is considered “done” when a `ProductionOrder` is linked to a `Plant` (and status indicates scheduling state).

## Available Data In `src/mock` (Current)

**Object types in scope**

- `ProjectLineItem` fields: `quantity`, `requested_delivery_date`, `confirmed_delivery_date`, `estimated_production_start_date`, `estimated_production_end_date`, `actual_production_start_date`, `actual_production_end_date`, `production_status`, `fulfillment_status`
- `MaterialDemand` fields: `demand_type`, `quantity`, `demand_date`, `latest_order_date`, `status`
- `ProductionOrder` fields: `quantity`, `planned_start_date`, `planned_end_date`, `actual_start_date`, `actual_end_date`, `status`

**Links in scope**

- Line item → Demand: `link_type_line_item_demand`
- Demand → Material: `link_type_demand_material`
- Production order → Demand: `link_type_production_order_demand`
- Production order → Plant: `link_type_production_order_plant`
- Production order → Material: `link_type_production_order_material`

## Metric Framework

### Dimension Taxonomy (Reusable)

Metrics should be sliceable by these dimensions (when data exists):

- **Time**
  - event date selection: requested / confirmed / estimated start/end / planned start/end / actual start/end / demand date / latest order date
  - granularity: day / week / month
- **Status**
  - `ProjectLineItem.production_status`, `ProjectLineItem.fulfillment_status`
  - `MaterialDemand.status`
  - `ProductionOrder.status`
- **Scale**
  - count of instances
  - quantity sums (units depend on object)
- **Timeliness / Deviation**
  - (planned/estimated/confirmed) vs actual deltas in days
- **Risk (Rule-based in v1)**
  - overdue / near due / late-to-start / late-to-finish
- **Coverage / Completeness**
  - link existence coverage (e.g., line item has demands; demand is fulfilled by a production order)

### Core Calculation Primitives

- `count(instances)`
- `sum(instances, property)`
- `groupBy(instances, dimension)`
- `dateDiffDays(a, b)` (returns `a - b` in days)
- `hasLink(sourceId, linkTypeId)` / `linkedTargets(sourceId, linkTypeId)`

### Health / Risk Rules (v1 Defaults)

These rules are designed to work without additional event data.

- **Near due threshold**: `N = 14` days (configurable)
- **Overdue**:
  - `dueDate < today` and status not in “done”
- **Near due**:
  - `0 <= dueDate - today <= N` and status indicates “not started” or “not satisfied”

## Metric Dictionary

### `ProjectLineItem` Metrics

#### ObjectType Metrics (Aggregates)

**Volume**

- `LineItem Count` = `count(ProjectLineItem)`
- `Ordered Quantity` = `sum(ProjectLineItem, quantity)`

**Delivery Commitment**

- `Commit Delta Days (confirmed - requested)` = distribution of `dateDiffDays(confirmed_delivery_date, requested_delivery_date)`
  - outputs: avg / p50 / p90 and histogram buckets

**Scheduling / Execution Coverage**

- `Scheduling Coverage (by production_status)` = `groupBy(ProjectLineItem, production_status)` counts
- `Not Scheduled Near Due` = count of items where:
  - `production_status === '待排产'`
  - `dateDiffDays(confirmed_delivery_date, today) <= N`

**Plan Risk**

- `Estimated Late vs Confirmed` = count where:
  - `estimated_production_end_date` exists AND `confirmed_delivery_date` exists
  - `estimated_production_end_date > confirmed_delivery_date`

**Demand Explosion Completeness**

- `Has Demand Coverage` = count where `linkedTargets(lineItemId, link_type_line_item_demand).length > 0`
- `Demand Coverage Rate` = `Has Demand Coverage / LineItem Count`

#### Instance Metrics (Single Line Item)

**Milestones (Timeline)**

- Requested / Confirmed delivery date
- Estimated start/end date
- Actual start/end date (may be null)

**Demand Rollup (linked `MaterialDemand`)**

- `Demand Count` = number of linked demands
- `Demand Quantity Sum` = sum of linked `MaterialDemand.quantity`
- `Demand Status Breakdown` = group by `MaterialDemand.status`
- `Overdue-by-latest-order Demands` = count where `latest_order_date < today` AND `status !== '已满足'`

**Independent Demand Coverage (Sanity Check)**

- `Independent Demand Qty` = sum where `demand_type === '独立需求'`
- `Independent Coverage Ratio` = `Independent Demand Qty / ProjectLineItem.quantity`
  - if `> 1`, flag as data anomaly (or multi-demand scenario to explain)

**Traceability**

- upstream: which `Project` it belongs to (via project→line item link)
- SKU and Material (via line item → SKU → Material links, if needed in the UI)

### `MaterialDemand` Metrics

#### ObjectType Metrics (Aggregates)

**Volume**

- `Demand Count` = `count(MaterialDemand)`
- `Demand Quantity` = `sum(MaterialDemand, quantity)`

**Status Funnel**

- `Demand Status Breakdown` = group by `status` (counts + quantity sums)

**Due Structure**

- `Due Quantity by Week` = group by week bucket on `demand_date`, sum `quantity`

**Overdue / Risk**

- `Overdue by Latest Order Date` = count where `latest_order_date < today` AND `status !== '已满足'`
- `Overdue by Demand Date` = count where `demand_date < today` AND `status !== '已满足'`

**Supply Path Split (via linked `Material`)**

- `Supply Type Breakdown` = group by `Material.default_supply_type` for linked materials
- `High Lead Time Unmet` = count where:
  - linked `Material.lead_time_days` is high (e.g. `>= 30`)
  - `status === '未满足'`

#### Instance Metrics (Single Demand)

**Time Triangle**

- `Days to Latest Order Date` = `dateDiffDays(latest_order_date, today)`
- `Days to Demand Date` = `dateDiffDays(demand_date, today)`
- `Latest Order Overdue` = boolean `latest_order_date < today`

**Fulfillment / Ownership**

- `Fulfilled by ProductionOrder?` = exists reverse link `production_order_demand` targeting this demand
- `Source Line Item` = exists reverse link `line_item_demand` targeting this demand

**Risk Score (v1 Rule-based)**

- Score components:
  - `latest_order_date < today`: +2
  - `status === '未满足'`: +2
  - linked material lead time exceeds remaining time: +1

### `ProductionOrder` Metrics

#### ObjectType Metrics (Aggregates)

**Volume**

- `Work Order Count` = `count(ProductionOrder)`
- `Planned Quantity` = `sum(ProductionOrder, quantity)`

**Status Funnel**

- `Work Order Status Breakdown` = group by `status` (counts + quantity sums)

**Load by Plant**

- For each `Plant`:
  - `WO Count` and `WO Quantity` for production orders linked to that plant
  - `WIP Proxy Quantity` = sum of `quantity` where `status in ('已排产','生产中')`

**Plan Deviation**

- `Start Deviation Days` = distribution of `dateDiffDays(actual_start_date, planned_start_date)` when both exist
- `Finish Deviation Days` = distribution of `dateDiffDays(actual_end_date, planned_end_date)` when both exist

**Demand / Output Coverage**

- `Has Demand Coverage` = count where `linkedTargets(poId, link_type_production_order_demand).length > 0`
- `Has Output Material Coverage` = count where `linkedTargets(poId, link_type_production_order_material).length > 0`

#### Instance Metrics (Single Production Order)

**Planned vs Actual Timeline**

- planned start/end
- actual start/end (may be null)

**Completion Proxy (v1)**

- `Completion %`:
  - if `status === '已完成'` then `100%`
  - else `0%`
  - NOTE: this is a prototype-only proxy until reporting data exists

**Scheduling Placement**

- `Plant` (via `production_order_plant` link)

**Demand Ownership**

- linked demands list and their statuses

**Alerts (Rule-based)**

- `Planned End Overdue` = `planned_end_date < today` AND `status !== '已完成'`
- `Scheduled but Not Started` = `status === '已排产'` AND `planned_start_date` exists AND `dateDiffDays(today, planned_start_date) > N`

## Known Gaps And Upgrade Path

- **No real “actual per day” output**:
  - The mock model lacks reporting events (completion quantities, scrap, WIP snapshots).
  - Upgrade by introducing: operation reporting, completion events, inventory receipt, or a time series table.
- **No explicit line item ↔ production order mapping**:
  - In mock, the linkage is indirect (LineItem → Demand → ProductionOrder).
  - Upgrade by adding a direct link type if needed for UI performance and clarity.
- **No capacity/line/work-center objects**:
  - Plant-level aggregation is possible now; line/work-center scheduling requires new object types.

## Acceptance Criteria (For The UI Prototype Using These Metrics)

- Each of the three object types can show:
  - a compact set of KPI cards (count, quantity, key risks)
  - at least one breakdown chart by status
  - at least one time-based view (due structure / planned timeline)
- Each instance can show:
  - timeline milestones
  - linked-object rollups (demands and plants)
  - rule-based alerts (near due / overdue)

