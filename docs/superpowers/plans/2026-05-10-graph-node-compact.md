# Graph Node Compact UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Shrink graph node cards and remove the Metrics and Badges sections from node rendering.

**Architecture:** Keep the existing `GraphNode` component but simplify its template to render only the header content. Adjust node sizing via existing global CSS selectors to reduce width/height/padding/icon size and keep selection halo aligned.

**Tech Stack:** Vue 3 (Composition API), Vite, TypeScript, CSS (global stylesheet)

---

## File Structure

- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/components/GraphNode.vue` — remove metrics and badges DOM blocks.
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/styles/global.css` — shrink node card, header, icon, and selection halo.
- Verify: Vite dev server hot reload + click interactions on canvas/nodes.

### Task 1: Remove Metrics/Badges DOM from GraphNode

**Files:**
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/components/GraphNode.vue`

- [ ] **Step 1: Update template to only render header**

Replace the `<template>` with:

```vue
<template>
  <button
    class="graph-node"
    :class="[
      `graph-node--${nodeType ?? 'airport'}`,
      {
        'graph-node--object-type': nodeKind === 'objectType',
        'graph-node--object-instance': nodeKind !== 'objectType',
        'graph-node--selected': isSelected,
        'graph-node--dragging': isDragging
      }
    ]"
    type="button"
    :aria-label="displayData.title"
    :style="{ '--node-accent': displayData.accentColor }"
  >
    <span class="graph-node__selection-bg" aria-hidden="true"></span>

    <span class="graph-node__surface">
      <span class="graph-node__header">
        <span class="graph-node__icon">
          <Box v-if="nodeKind === 'objectType'" :size="23" stroke-width="2.2" />
          <Route v-else-if="displayData.icon === 'flight' || nodeType === 'flight'" :size="23" stroke-width="2.2" />
          <AlertTriangle v-else-if="displayData.icon === 'event' || nodeType === 'event'" :size="23" stroke-width="2.2" />
          <MapPin v-else :size="23" stroke-width="2.2" />
          <span v-if="hasEventBadge" class="graph-node__event-badge" :title="`Events: ${eventCount}`">
            {{ eventCount }}
          </span>
        </span>
        <span class="graph-node__copy">
          <span class="graph-node__title" :title="displayData.title">{{ displayData.title }}</span>
          <span class="graph-node__subtitle" :title="displayData.subtitle">{{ displayData.subtitle }}</span>
        </span>
      </span>
    </span>
  </button>
</template>
```

- [ ] **Step 2: Run the dev server and verify**

Open `http://127.0.0.1:5173/` and confirm:
- No “Schema / Records / Links” section appears on any node.
- No badge pills appear at the bottom of nodes.
- Clicking a node/canvas still logs and selection still shows.

### Task 2: Shrink Node Card Sizing in CSS

**Files:**
- Modify: `/Users/vicwong/go/src/github.com/Archer1A/vertex/src/styles/global.css`

- [ ] **Step 1: Adjust selection halo to match smaller card**

Update these selectors (target values are starting points and may be tuned visually):

```css
.graph-node__selection-bg {
  inset: -8px;
  border-radius: 12px;
}
```

- [ ] **Step 2: Shrink surface + header + icon**

Update:

```css
.graph-node__surface {
  width: 196px;
  min-height: 84px;
}

.graph-node--object-instance .graph-node__surface {
  width: 182px;
  min-height: 80px;
}

.graph-node--object-type .graph-node__surface {
  width: 186px;
  min-height: 82px;
}

.graph-node__header {
  gap: 8px;
  padding: 9px;
}

.graph-node--object-type .graph-node__header {
  padding: 9px 9px 9px 12px;
}

.graph-node__icon {
  width: 46px;
  height: 46px;
  border-radius: 9px;
}

.graph-node--object-instance .graph-node__icon {
  width: 42px;
  height: 42px;
  border-radius: 8px;
}

.graph-node--object-type .graph-node__icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}
```

- [ ] **Step 3: Remove dead CSS blocks (optional cleanup)**

If desired, remove the now-unused blocks:
- `.graph-node__metrics`, `.graph-node__metric*`
- `.graph-node__badges`, `.graph-node__badge*`

Only do this if `GraphNode.vue` no longer references these classes.

- [ ] **Step 4: Verify visually in browser**

In `http://127.0.0.1:5173/`:
- Node cards are noticeably smaller.
- Title/subtitle truncation still works.
- Selection halo still hugs the card without looking oversized.

### Task 3: Quick Build Confidence

**Files:**
- Verify only

- [ ] **Step 1: Typecheck (if available)**

Run: `npm run typecheck` (or the repo’s equivalent)  
Expected: exit code 0

- [ ] **Step 2: Commit (optional)**

Only stage intended files:

```bash
git add /Users/vicwong/go/src/github.com/Archer1A/vertex/src/components/GraphNode.vue \
        /Users/vicwong/go/src/github.com/Archer1A/vertex/src/styles/global.css
git commit -m "ui: compact graph node cards"
```

---

## Self-Review Checklist

- [ ] Metrics and badges are not rendered anywhere.
- [ ] CSS changes don’t break selection halo alignment.
- [ ] No console errors when clicking canvas/nodes.
- [ ] Only intended files changed (or cleanup is explicitly intentional).

