// 定义单个节点的类型（递归）
export interface FlowNode {
  name: string;
  relationObjectType: string[];
  childrenFlow: FlowNode[];
}

// TypeScript 对象
export const flowData: FlowNode[] = [
  {
    name: "开始",
    relationObjectType: [],
    childrenFlow: [],
  },
  {
    name: "新增项目订单",
    relationObjectType: ["object_type_project", "object_type_project_line_item"],
    childrenFlow: [
      {
        name: "确定服务器种类数量",
        relationObjectType: [],
        childrenFlow: [],
      },
    ],
  },
  {
    name: "生成物料需求单",
    relationObjectType: ["object_type_material", "object_type_project_line_item",'object_type_material_demand'],
    childrenFlow: [
      {
        name: "查询BOM",
        relationObjectType: [],
        childrenFlow: [],
      },
      {
        name: "生成物料需求单",
        relationObjectType: [],
        childrenFlow: [],
      },
    ],
  },
  {
    name: "生成生产计划",
    relationObjectType: ["object_type_production_order","object_type_project"],
    childrenFlow: [
      {
        name: "查询交付时间",
        relationObjectType: [],
        childrenFlow: [],
      },
      {
        name: "生成生产计划",
        relationObjectType: [],
        childrenFlow: [],
      },
    ],
  },
  {
    name: "采购",
    relationObjectType: ["object_type_material",],
    childrenFlow: [
      {
        name: "查询生产计划",
        relationObjectType: [],
        childrenFlow: [],
      },
      {
        name: "识别物料风险",
        relationObjectType: [],
        childrenFlow: [],
      },
      {
        name: "采购流程",
        relationObjectType: [],
        childrenFlow: [],
      },
    ],
  },
  {
    name: "执行生产计划",
    relationObjectType: ["object_type_production_order",],
    childrenFlow: [
      {
        name: "更新每日实际生产",
        relationObjectType: [],
        childrenFlow: [],
      },
    ],
  },
  {
    name: "结束",
    relationObjectType: ["tempor sunt consectetur", "irure", "dolore eu Ut dolor non"],
    childrenFlow: [],
  },
];
