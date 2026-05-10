# Expand ObjectType Instances (Filter-Aware Refresh) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Right-click an `objectType` node and choose “Expand Instances” to refresh-expand all filtered `objectInstance` nodes with dashed `instanceOf` edges pointing to the `objectType`.

**Architecture:** Keep context menu and graph mutation in `GraphCanvas.vue`. Use existing `instanceFilters` + `getFilteredObjectInstances(objectTypeId)` to respect filters. Track which nodes/edges were created by expansion so refresh can remove stale nodes/edges deterministically.

**Tech Stack:** Vue 3 (Composition API) + TypeScript + Vite.

---

### Task 1: Add “Expand Instances” to node context menu

**Files:**
- Modify: `src/components/GraphCanvas.vue`

- [ ] **Step 1: Add computed helpers for current context node**

```ts
const contextNode = computed(() => graphNodes.find(n => n.id === nodeTool.nodeId) ?? null)
const contextNodeIsObjectType = computed(() => contextNode.value?.nodeKind === 'objectType')
```

- [ ] **Step 2: Update context menu template**

```vue
<button v-if="contextNodeIsObjectType" type="button" @click="expandObjectTypeInstances">Expand Instances</button>
```

- [ ] **Step 3: Verify right-click still selects the node**

Manual: right-click any node and see selection updates.

### Task 2: Implement filter-aware refresh expansion

**Files:**
- Modify: `src/components/GraphCanvas.vue`

- [ ] **Step 1: Add expansion bookkeeping map**

```ts
const expandedByObjectType = reactive<Record<string, Set<string>>>({})
```

- [ ] **Step 2: Implement `expandObjectTypeInstances()`**

Core behavior:
- Resolve `objectTypeId` from context node
- Compute `nextInstanceIds` from `getFilteredObjectInstances(objectTypeId)`
- Remove stale expanded nodes: `prev - next`
- Add missing nodes around anchor and add `instanceOf` edges `instance -> objectType`
- Update bookkeeping set

- [ ] **Step 3: Ensure expansion edges are de-duplicated**

Use `addEdgeIfMissing` and stable edge id: `${instanceId}-instanceOf-${objectTypeNodeId}`.

### Task 3: Style dashed instanceOf edges

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/components/GraphCanvas.vue`

- [ ] **Step 1: Add class binding for dashed edges**

```vue
<line :class="['graph-edge', { 'graph-edge--dashed': edge.linkTypeId === 'instanceOf' }]" ... />
```

- [ ] **Step 2: Add CSS**

```css
.graph-edge--dashed { stroke-dasharray: 4 4; }
```

### Task 4: Verification

**Files:**
- Modify: none

- [ ] **Step 1: Typecheck/build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 2: Manual behavior**

- Apply an instance filter for an objectType, then right-click its objectType node → Expand Instances
- Change filter to match fewer instances → Expand Instances again and observe stale expanded nodes disappear
