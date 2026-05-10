# Mock 数据文件结构

本目录包含应用程序的 Mock 数据，按功能模块拆分以便维护和阅读。

## 文件结构

| 文件 | 内容描述 |
|------|----------|
| [types.ts](types.ts) | 所有 TypeScript 接口定义（ObjectType, LinkType, PropertyType, PropertyValue, ObjectInstance, LinkInstance） |
| [utils.ts](utils.ts) | 工具函数（createLinkInstance） |
| [project.ts](project.ts) | 销售项目（Project）、项目行项（ProjectLineItem）的类型定义和实例数据 |
| [server.ts](server.ts) | Server SKU 的类型定义和实例数据 |
| [material.ts](material.ts) | 物料（Material）、BOM 行（MaterialDemand）、物料需求（MaterialDemand）的类型定义和实例数据 |
| [production.ts](production.ts) | 生产订单（ProductionOrder）、工厂（Plant）的类型定义和实例数据 |
| [burnin.ts](burnin.ts) | Burn-in 测试相关的工作站（Workstation）、服务器（Server）、事件（Event）的类型定义和实例数据 |
| [links.ts](links.ts) | 链接类型（LinkType）和链接实例（LinkInstance）的定义和数据 |
| [index.ts](index.ts) | 统一导出 objectTypes, objectInstances, linkTypes, linkInstances 以及查找函数（getObjectTypeById, getLinkTypeById, getObjectInstanceById, getLinkInstanceById） |
| [mock.ts](mock.ts) | 入口文件 re-export index.ts，保持向后兼容 |

## 数据关系

```
Project (销售项目)
  └── ProjectLineItem (项目行项)
        ├── ServerSku (服务器SKU)
        │     └── Material (物料)
        └── MaterialDemand (物料需求)
              └── Material (物料)

ProductionOrder (生产订单)
  ├── MaterialDemand (物料需求)
  └── Plant (工厂)

Server (服务器) ←→ Workstation (工作站)  (Burn-in 测试)
Server (服务器) ←→ Event (事件)          (Burn-in 失败事件)
Workstation (工作站) ←→ Event (事件)    (Pass rate 事件)
```

## 使用方式

```typescript
import {
  objectTypes,
  objectInstances,
  linkTypes,
  linkInstances,
  getObjectTypeById,
  getObjectInstanceById
} from '@/mock'
```
