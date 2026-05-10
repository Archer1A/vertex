# Event 绑定指南（Mock）

本项目里，`Event` 是一个特殊的 `objectType`（`object_type_event`），它不会作为关系边显示在图上，而是通过 `eventBindings` 绑定到任意 `objectInstance` 上，用于：

- 节点右上角徽章（数量 + 颜色）
- 选中节点后，`LeftSelectionPanel` 的 `Events` 页展示对应事件

## 文件位置

- Event 定义与数据：`src/mock/events.ts`
  - `eventObjectType`
  - `eventInstances`
  - `eventBindings`

## 1) 新增一个 Event

在 `src/mock/events.ts` 的 `eventInstances` 中添加一条 `ObjectInstance`，注意属性字段使用 **下划线命名**：

```ts
export const eventInstances: ObjectInstance[] = [
  // ...
  {
    id: 'inst_event_004',
    objectTypeId: EVENT_OBJECT_TYPE_ID,
    properties: {
      event_id: 'EVT-004',
      event_title: 'Something happened',
      event_type: 'custom_type',
      event_time: '2026-05-10T12:00:00+08:00',
      event_summary: 'Short summary for the panel.',
      severity: 'low',
      badge_color: '#22c55e'
    }
  }
]
```

### `badge_color`

- 这是节点徽章颜色来源（hex，如 `#ef4444` / `#f59e0b` / `#3b82f6`）。
- UI 会取该节点绑定的 **第一个** Event 的 `badge_color` 作为徽章颜色。

## 2) 将 Event 绑定到某个 objectInstance

在 `src/mock/events.ts` 的 `eventBindings` 里追加一条绑定：

```ts
export const eventBindings: Array<{ objectInstanceId: string; eventId: string }> = [
  // ...
  { objectInstanceId: 'inst_sku_003', eventId: 'inst_event_004' }
]
```

字段含义：

- `objectInstanceId`：要显示徽章/事件的业务对象实例 ID（必须存在于 mock 的 `objectInstances` 里）
- `eventId`：要绑定的 Event 实例 ID（必须存在于 `eventInstances` 里）

## 3) 如何找到 objectInstanceId

在 `src/mock/` 下找到对应对象的实例数据文件（例如 `server.ts` / `material.ts` / `project.ts` / `production.ts`），实例 ID 一般形如：

- `inst_sku_001`
- `inst_dem_003`
- `inst_project_001`

也可以用命令快速搜索（在仓库根目录执行）：

```bash
rg -n \"id: 'inst_\" src/mock
```

## 4) UI 中如何验证

1. 在左侧面板把对应对象实例加到画布（例如先 Add objectType，再 Expand Instances，或直接 add instances）。
2. 若该实例在 `eventBindings` 中有绑定：
   - 节点卡片右上角显示徽章（数字 = 绑定事件数量）
   - 点击节点后左侧面板会自动切到 `Events`，并展示绑定事件卡片

