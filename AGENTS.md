请使用 Vue 3 + Vite + TypeScript 实现一个类似 Palantir Graph / Vertex 详情页的 Web 页面原型。

重点目标：
- 页面整体像一个企业级图谱编辑器 / vertex 详情页。
- 使用 Vue 3 Composition API + TypeScript。
- 使用 Vite 作为构建工具。
- 第一版优先保证 UI 布局高保真。
- 画布第一版可以使用 DOM/CSS 实现静态节点。
- 请预留 GraphCanvas 组件结构，后续可以替换为 Cytoscape.js。
- 不需要真实后端，所有数据写死即可。

请参考以下整体布局 ASCII 图：

+------------------------------------------------------------------------------------------------------+
| TopBar                                                                                               |
| New graph*   ...                                                                                     |
+------------------------------------------------------------------------------------------------------+
| SheetBar                                                                                             |
| [ Sheet 1 ] [ Sheet 2 ] [ + ]                                      Canvas: Graph View ▾              |
+------------------------------------------------------------------------------------------------------+
| GraphCanvas / full remaining viewport                                                               |
|                                                                                                      |
|  +----------------------------------+   +--------------------------------------------------------+   |
|  | Floating LeftSelectionPanel       |   | Floating MainToolbar                                  |   |
|  |----------------------------------|   |--------------------------------------------------------|   |
|  | Layers | Selection | Search | << |   | Selection ▾ | Search Around ▾ | Group ▾ | Layout ▾     |   |
|  |                                  |   | Annotate ▾ | Delete | Undo | Redo | ?                 |   |
|  | +------+ [SFO] San Francisco...  |   +--------------------------------------------------------+   |
|  | | pin  | [Example Data] Airport  |                                                   +--------+  |
|  | +------+                         |                                                   | Model  |  |
|  |                                  |                                                   | Config |  |
|  | Properties | Series | Events 0   |                                                   | Simu-  |  |
|  | [ Filter...                  ]   |                                                   | lation |  |
|  |                                  |                                                   +--------+  |
|  | Airport                  SFO     |                                                               |
|  | Airport Country ISO Code US      |                                                               |
|  | Airport Country Name     United  |                                                               |
|  | Airport Location         37.61.. |                                                               |
|  | Airport Start Date       Fri...  |                                                               |
|  | ...                              |                                                               |
|  |                              (+) |                                                               |
|  +----------------------------------+                                                               |
|                                                                                                      |
|                                              +------------------------------+                        |
|                                              | Selected node background     |                        |
|                                              |           +------+           |                        |
|                                              |           | pin  |           |                        |
|                                              |           +------+           |                        |
|                                              | [SFO] San Francisco I...     |                        |
|                                              +------------------------------+                        |
|                                                                                                      |
|  +----+                                                                                              |
|  |fit |                                                                                              |
|  +----+                                                                                       +------+
|  +----+                                                                                       |Series|
|  | +  |                                                                                       +------+
|  | -  |                                                                                              |
|  +----+                                                                                              |
+------------------------------------------------------------------------------------------------------+

关键布局说明：
- TopBar 固定在页面顶部，高度约 30px。
- SheetBar 固定在 TopBar 下方，高度约 36px。
- GraphCanvas 从 SheetBar 下方开始，占满剩余视口。
- GraphCanvas 是底层画布，不被任何面板挤压。
- LeftSelectionPanel、MainToolbar、RightVerticalPanel、FloatingControls、Series 按钮都悬浮在 GraphCanvas 之上。
- 所有悬浮元素都应使用 position: absolute，并放在 GraphCanvas 内部。
- GraphCanvas 使用 position: relative。

推荐目录结构：
src/
  main.ts
  App.vue
  components/
    TopBar.vue
    SheetBar.vue
    GraphCanvas.vue
    GraphNode.vue
    LeftSelectionPanel.vue
    MainToolbar.vue
    FloatingControls.vue
    RightVerticalPanel.vue
    PropertyList.vue
  styles/
    global.css

技术要求：
- Vue 3
- Vite
- TypeScript
- 可以使用普通 CSS，也可以使用 Tailwind CSS
- 图标可以使用 lucide-vue-next
- 页面需要适配浏览器全屏
- 使用浅色企业级 SaaS 风格
- 不要过度设计，不要添加截图中没有的复杂功能

1. 顶部标题栏 TopBar
- 固定在页面最顶部
- 高度约 30px
- 宽度 100%
- 背景色 #f4f6f8
- 下方有 1px 浅灰边框
- 左侧显示：
  - “New graph*”
  - 一个 “...” 更多按钮
- 字号约 13px
- 文本颜色偏灰
- z-index 高于画布

2. 次级标题栏 SheetBar
TopBar 下方新增一个次级标题栏，用于新增 sheet 页和切换画布。

要求：
- 固定在 TopBar 下方
- 高度约 36px
- 宽度 100%
- 背景色 #ffffff 或 #f8fafc
- 下方有 1px 浅灰边框
- 左侧显示 sheet tabs：
  - “Sheet 1”，当前选中
  - “Sheet 2”
- tabs 右侧有一个 “+” 按钮，用于新增 sheet
- 右侧可以显示：
  - “Canvas: Graph View”
  - 或一个下拉按钮 “Graph View ▾”
- 当前选中的 sheet tab：
  - 白色背景
  - 蓝色底部强调线
  - 文本颜色 #1f2933
- 未选中的 sheet tab：
  - 透明或浅灰背景
  - 文本颜色 #6b7280
- 点击 tab 可以切换 activeSheet
- 点击 “+” 可以新增一个 sheet，例如 Sheet 3、Sheet 4

3. 主画布 GraphCanvas
- 从 SheetBar 下方开始，占满剩余页面
- 画布是底层容器，所有面板和工具栏都悬浮在画布之上
- 不要让 Selection 面板、MainToolbar、右侧垂直按钮挤压画布
- 背景色 #f6f7f9
- position: relative
- overflow: hidden
- 高度为 calc(100vh - 66px)，其中 TopBar 30px，SheetBar 36px

画布中间显示一个静态图谱节点：
- 节点整体位于画布中间偏右位置
- 节点外层有浅灰色选中背景框
- 选中背景框大小约 150px x 100px
- 节点图标是紫色正方形，约 52px x 52px
- 图标内部是白色定位 pin 图标
- 下方有浅色标签：
  “[SFO] San Francisco I...”
- 节点可以用 DOM/CSS 实现，不需要真实图谱引擎

4. 悬浮 Selection 面板 LeftSelectionPanel
Selection 面板应悬浮在画布左上角，不参与主布局。

位置要求：
- 放在 GraphCanvas 内部
- position: absolute
- top: 8px
- left: 8px
- width: 360px
- height: calc(100vh - 90px)
- z-index: 20
- 白色背景
- 1px 浅灰边框
- 圆角
- 轻微 box-shadow

面板顶部 tabs：
- Layers
- Selection，高亮选中
- Search
- Histogram
- Info
- 最右侧有 “<<” 折叠图标
- Selection tab 使用浅蓝背景高亮
- tab 高度约 32px

对象头部：
- 左侧紫色方形图标，内部白色定位 pin
- 右侧主标题：
  “[SFO] San Francisco Internatio...”
- 右侧副标题：
  “[Example Data] Airport”
- 右侧有两个小按钮：
  - 设置齿轮
  - 打开 / 跳转图标

二级 tabs：
- Properties，高亮选中
- Series
- Events
- Events 后面有灰色 badge，内容为 0
- Properties 使用蓝色文字和蓝色下划线

属性过滤框：
- input 占满面板宽度
- placeholder 为 “Filter...”
- 高度约 36px
- 边框浅灰
- 圆角

属性列表：
用两列 key-value 形式展示，左侧字段名，右侧字段值。

字段数据：
Airport: SFO
Airport Country ISO Code: US
Airport Country Name: United States
Airport Location: 37.61888889,-122.37555556
Airport Start Date: Fri, Dec 1, 2017, 24:00:00 GMT
Airport State Code: CA
Airport State Name: California
Display Airport City Name Full: San Francisco, CA
Display Airport Name: San Francisco International
Display City Market Name Full: San Francisco, CA (Metropolita
Display Name: [SFO] San Francisco Internatio
Latitude: 37.61888889
Longitude: -122.37555556
Mapbox Feature Id v3: 332521

属性列表样式：
- 字号 13px
- 行高约 30px
- 左列宽度约 170px
- 右列文本过长时截断显示
- 不换行
- 列表区域可滚动
- 面板底部右侧有一个小圆形 “+” 按钮

5. 悬浮顶部主工具栏 MainToolbar
MainToolbar 也悬浮在画布之上，不参与文档流。

位置要求：
- 放在 GraphCanvas 内部
- position: absolute
- top: 8px
- left: 380px
- right: 120px
- height: 44px
- z-index: 30
- display: flex
- gap: 8px

工具栏分组：
第一组白色卡片包含：
- “Selection” 下拉
- “Search Around” 下拉
- “Group” 下拉，置灰禁用
- “Layout” 下拉
- “Annotate” 下拉
- “Delete”

第二组白色卡片包含：
- “Undo”
- “Redo”，置灰禁用

第三组白色卡片按钮：
- “?” 帮助按钮

样式要求：
- 白色背景
- 圆角
- 1px 浅灰边框
- 轻微 box-shadow
- 按钮高度约 42px
- 按钮之间可以有分隔线或间距
- hover 时浅灰背景
- 每个按钮左侧可以放 lucide-vue-next 图标
- disabled 状态 opacity 降低，cursor: not-allowed
- 点击按钮 console.log 对应动作即可

6. 右侧垂直折叠按钮 RightVerticalPanel
右侧按钮悬浮在画布右侧，不影响画布布局。

位置要求：
- 放在 GraphCanvas 内部
- position: absolute
- top: 8px
- right: 8px
- z-index: 30
- width: 32px
- height: 150px
- 白色背景
- 圆角
- 1px 浅灰边框
- 轻微 box-shadow

内容：
- 竖排文本：
  Model Config
  Simulation
- 使用 CSS writing-mode: vertical-rl
- 字号 12px
- 文本颜色 #64748b

7. 左下角画布控件 FloatingControls
悬浮在画布左下角。

位置要求：
- 放在 GraphCanvas 内部
- position: absolute
- left: 8px
- bottom: 12px
- z-index: 30

控件组：
第一组：
- fit / fullscreen 图标按钮

第二组：
- 放大按钮
- 缩小按钮

样式：
- 每个按钮 36px x 36px
- 白色背景
- 浅灰边框
- 轻微阴影
- 圆角
- 两个控件组之间间隔 8px
- 点击按钮 console.log 即可

8. 右下角 Series 按钮
- 放在 GraphCanvas 内部
- position: absolute
- right: 12px
- bottom: 12px
- z-index: 30
- 白色按钮
- 文本为 “Series”
- 圆角
- 浅灰边框
- 轻微 box-shadow
- 高度约 36px
- padding: 0 14px
- 点击 console.log 即可

9. 视觉风格
请尽量还原参考截图的感觉：
- 企业级 SaaS 后台风格
- 主色蓝色用于选中态
- 节点图标使用紫色
- 画布背景浅灰
- 卡片和面板白色
- 边框颜色 #d9dde3
- 主文本颜色 #1f2933
- 次级文本颜色 #6b7280
- 工具栏和面板都有轻微阴影
- 字体使用系统字体：Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

10. 状态和交互
需要实现的简单状态：
- activeSheet：当前选中的 sheet
- sheets：sheet 列表，初始为 Sheet 1、Sheet 2
- filterText：Selection 面板的过滤输入内容
- selectedObject：写死为 SFO Airport 节点

交互：
- 点击 Sheet tab 切换 activeSheet
- 点击 “+” 新增 sheet
- Filter 输入框可以输入，但不需要真正过滤
- 工具栏按钮点击 console.log
- 节点点击 console.log selected node
- 空白画布点击 console.log canvas clicked
- 缩放按钮点击 console.log

11. 组件拆分
请至少拆分以下组件：
- App.vue
- TopBar.vue
- SheetBar.vue
- GraphCanvas.vue
- GraphNode.vue
- LeftSelectionPanel.vue
- MainToolbar.vue
- FloatingControls.vue
- RightVerticalPanel.vue
- PropertyList.vue

12. 关于 Cytoscape.js 的预留
第一版不需要真的安装 Cytoscape.js，但请在 GraphCanvas.vue 中用注释预留：

// Future enhancement:
// import cytoscape from 'cytoscape'
// onMounted(() => {
//   // initialize cytoscape here when graph interactions are needed
// })

不要实际引入 Cytoscape.js，避免增加复杂度。

13. 输出要求
请输出完整可运行代码，包括：
- package.json
- index.html
- src/main.ts
- src/App.vue
- 所有 components/*.vue
- src/styles/global.css 或 App.vue 内样式

请保证复制到一个新的 Vue + Vite + TypeScript 项目后可以直接运行。

最终效果要求：
- 顶部有 TopBar
- TopBar 下方有 SheetBar
- SheetBar 可以新增和切换 sheet
- 画布铺满剩余区域
- Selection 面板悬浮在画布左上方
- MainToolbar 悬浮在画布顶部
- 右侧竖向按钮悬浮在画布右侧
- 左下角缩放控件悬浮
- 右下角 Series 按钮悬浮
- 中央有一个 SFO Airport 节点