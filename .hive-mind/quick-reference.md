# Quick Reference Guide - LawDraw Technical Stack

**Last Updated:** 2025-11-09

## Installation Commands

```bash
# Project setup
npm create vite@latest . -- --template react-ts
cd lawdraw

# Core dependencies
npm install @xyflow/react zustand @dagrejs/dagre @anthropic-ai/sdk posthog-js

# Export dependencies
npm install html-to-image@1.11.11 jspdf

# Dev dependencies
npm install -D @types/dagre tailwindcss postcss autoprefixer

# Tailwind init
npx tailwindcss init -p
```

## Critical Code Patterns

### React Flow Custom Node (TypeScript)
```typescript
import { memo } from 'react';
import { NodeProps, Handle, Position, useReactFlow } from '@xyflow/react';

export const EntityNode = memo(({ id, data }: NodeProps) => {
  const { updateNodeData } = useReactFlow();

  return (
    <div className="entity-node">
      <Handle type="target" position={Position.Top} />
      <h3 onDoubleClick={() => /* edit logic */}>{data.label}</h3>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
```

### Zustand Store with Persist
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useDiagramStore = create(
  persist(
    (set) => ({
      nodes: [],
      edges: [],
      addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
    }),
    {
      name: 'lawdraw-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
    }
  )
);
```

### Dagre Auto-Layout
```typescript
import dagre from '@dagrejs/dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export function getLayoutedElements(nodes, edges) {
  dagreGraph.setGraph({ rankdir: 'TB' });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.measured?.width || 172,
      height: node.measured?.height || 100
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const positioned = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: positioned.x - (node.measured?.width || 172) / 2,
          y: positioned.y - (node.measured?.height || 100) / 2,
        },
      };
    }),
    edges,
  };
}
```

### Claude API with Tool Calling
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

const diagramTool = {
  name: 'generate_legal_diagram',
  description: 'Generates legal entity diagram',
  input_schema: {
    type: 'object',
    properties: {
      nodes: { type: 'array', items: { /* schema */ } },
      edges: { type: 'array', items: { /* schema */ } },
    },
    required: ['nodes', 'edges'],
  },
};

export async function generateDiagram(description: string) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    tools: [diagramTool],
    tool_choice: { type: 'tool', name: 'generate_legal_diagram' },
    messages: [{ role: 'user', content: description }],
  });

  const toolUse = response.content.find(b => b.type === 'tool_use');
  return toolUse.input;
}
```

### PostHog Event Tracking
```typescript
import posthog from 'posthog-js';

// Initialize (in main.tsx)
posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: 'https://app.posthog.com',
  autocapture: false,
});

// Track events
export function trackDiagramEvent(name: string, properties?: Record<string, any>) {
  posthog.capture(name, {
    ...properties,
    timestamp: Date.now(),
  });
}

// Usage
trackDiagramEvent('diagram_created', { method: 'ai_generation' });
trackDiagramEvent('diagram_completed', {
  entity_count: nodes.length,
  time_seconds: 120
});
```

### PDF Export
```typescript
import { toPng } from 'html-to-image';
import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import jsPDF from 'jspdf';

export async function exportToPDF(reactFlowInstance) {
  const nodesBounds = getNodesBounds(reactFlowInstance.getNodes());
  const viewport = getViewportForBounds(nodesBounds, 1920, 1080, 0.5, 2);

  const viewportElement = document.querySelector('.react-flow__viewport');

  const dataUrl = await toPng(viewportElement, {
    backgroundColor: 'white',
    width: 1920,
    height: 1080,
    style: {
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
  });

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1920, 1080] });
  pdf.addImage(dataUrl, 'PNG', 0, 0, 1920, 1080);
  pdf.save('diagram.pdf');
}
```

## Performance Optimization Checklist

- [ ] Wrap all custom components in `React.memo()`
- [ ] Define `nodeTypes` outside component or use `useMemo()`
- [ ] Wrap all callbacks in `useCallback()`
- [ ] Wrap all object props in `useMemo()`
- [ ] Enable `snapToGrid={true}` and `snapGrid={[50, 50]}`
- [ ] Store selection state separately from nodes array
- [ ] Test with 50+ nodes at 60fps

## Common Pitfalls

### React Flow v12 Breaking Changes
```typescript
// ❌ OLD (v11)
const width = node.width;
const height = node.height;

// ✅ NEW (v12)
const width = node.measured?.width;
const height = node.measured?.height;
```

### Package Name Change
```typescript
// ❌ OLD
import ReactFlow from 'reactflow';

// ✅ NEW
import ReactFlow from '@xyflow/react';
```

### Input Fields in Custom Nodes
```typescript
// ❌ WRONG: Allows dragging input field
<input value={data.label} />

// ✅ CORRECT: Prevents dragging
<input value={data.label} className="nodrag" />
```

### Environment Variables
```typescript
// ❌ WRONG
const apiKey = process.env.ANTHROPIC_API_KEY;

// ✅ CORRECT (Vite)
const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
```

### html-to-image Version
```bash
# ❌ WRONG: Latest version has export issues
npm install html-to-image

# ✅ CORRECT: Lock to working version
npm install html-to-image@1.11.11
```

## Environment Setup

```env
# .env.local (create this file, add to .gitignore)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
VITE_POSTHOG_KEY=phc_...
```

```typescript
// vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_ANTHROPIC_API_KEY: string;
  readonly VITE_POSTHOG_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## Testing Commands

```bash
# Stress test with 50+ nodes
npm run dev
# Then add 50+ entities and check FPS

# Test Claude API connection
node scripts/test-claude-integration.js

# Build for production
npm run build

# Preview production build
npm run preview
```

## Key Metrics to Track

### Phase 1 (Weeks 1-2)
- Canvas FPS with 50+ nodes (target: 60fps)
- Load time for diagram with 30 entities (target: <1s)
- LocalStorage save time (target: <100ms)

### Phase 2 (Weeks 3-4)
- Claude API response time p95 (target: <3s)
- JSON parsing success rate (target: >90%)
- AI generation token cost per diagram (track actual)

### Phase 3 (Weeks 5-6)
- Time-to-completion median (target: <12 min)
- PDF export time (target: <2s)
- Lawyer completion rate (target: 80%+ finish diagrams)

## Decision Matrix

| Scenario | Recommended Approach |
|----------|---------------------|
| Need structured JSON from Claude | Use tool calling (most reliable) |
| Need real-time AI updates | Use streaming with `client.messages.stream()` |
| Performance issues with many nodes | Add `memo()`, `useCallback()`, snap-to-grid |
| Layout flickers on load | Use `useNodesInitialized()` hook |
| Need to update single node | Use `updateNodeData(id, data)` |
| Need to update many nodes | Use `setNodes()` with callback |
| LocalStorage quota exceeded | Use `partialize` in persist config |
| API rate limit errors | Implement exponential backoff retry |

## Resource Links

- Full technical report: `.hive-mind/technical-research-report.md`
- React Flow docs: https://reactflow.dev
- Zustand docs: https://zustand.docs.pmnd.rs
- Claude API docs: https://docs.anthropic.com
- PostHog docs: https://posthog.com/docs

## Emergency Contacts

- React Flow Discord: https://discord.gg/Bqt6xrs
- Anthropic Support: support@anthropic.com
- PostHog Support: https://posthog.com/support

---

**Last Updated:** 2025-11-09
**Next Review:** After Phase 1 completion (Week 2)
