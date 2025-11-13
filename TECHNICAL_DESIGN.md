# LawDraw Technical Design Document

## Overview

LawDraw is a validated legal entity diagramming tool built with React Flow, Zustand, Claude API, and PostHog. This document outlines the technical architecture and implementation details.

**Last Updated:** 2025-11-12
**Version:** 0.1.0 (Phase 1)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                      (React + Tailwind)                      │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Flow Canvas                         │
│         (DiagramCanvas + EntityNode Components)              │
└───────┬────────────────────────────────┬────────────────────┘
        │                                │
        ▼                                ▼
┌──────────────────┐            ┌───────────────────┐
│   Service Layer  │            │  Hooks & State    │
│                  │            │                   │
│ • Layout         │            │ • usePostHog      │
│ • Storage        │            │ • (Zustand TBD)   │
│ • Claude API     │            │                   │
└────┬─────┬───────┘            └───────────────────┘
     │     │
     │     ▼
     │  ┌───────────────────┐
     │  │   External APIs   │
     │  │                   │
     │  │ • Anthropic API   │
     │  │ • PostHog         │
     │  └───────────────────┘
     │
     ▼
┌───────────────────┐
│  Local Storage    │
│                   │
│ • Diagram Data    │
│ • Metadata        │
└───────────────────┘
```

---

## Core Services

### 1. Layout Service

**File:** `src/services/layout.ts`

**Responsibility:** Automatic hierarchical layout using Dagre algorithm

**Algorithm:** Dagre (Directed Acyclic Graph layout)

**Key Functions:**

```typescript
getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  options?: LayoutOptions
): { nodes: Node[]; edges: Edge[] }

calculateBoundingBox(nodes: Node[]): BoundingBox

hasCircularReferences(edges: Edge[]): boolean
```

**Layout Options:**
- `direction`: 'TB' | 'LR' | 'BT' | 'RL' (default: 'TB')
- `nodeWidth`: number (default: 250px)
- `nodeHeight`: number (default: 100px)
- `rankSep`: number (default: 100px)
- `nodeSep`: number (default: 150px)

**Performance:**
- Handles 50 nodes in <500ms
- Handles 100+ nodes without crashes
- Memory efficient (O(n) complexity)

**Edge Cases Handled:**
- Empty node array → returns empty
- Single node → centers at (0, 0)
- Circular references → detected and reported

---

### 2. Storage Service

**File:** `src/services/storage.ts`

**Responsibility:** Diagram persistence to browser localStorage

**Data Model:**

```typescript
interface DiagramData {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  metadata: DiagramMetadata;
}

interface DiagramMetadata {
  createdAt: string;
  updatedAt: string;
  version: string;
  author?: string;
  description?: string;
}
```

**Key Functions:**

```typescript
saveDiagram(id, name, nodes, edges, metadata?): DiagramData
loadDiagram(id): DiagramData | null
deleteDiagram(id): void
listDiagrams(): DiagramInfo[]
exportDiagram(data): string
importDiagram(json): DiagramData
checkStorageAvailability(): StorageInfo
```

**Storage Format:**
- Key: `lawdraw_diagram_{id}`
- Value: JSON.stringify(DiagramData)
- Estimated size: ~10KB per 50-node diagram

**Error Handling:**
- QuotaExceededError → Throw descriptive error
- Corrupted data → Throw parsing error
- Missing data → Return null

**Versioning:**
- Current version: 1.0.0
- Forward compatibility planned
- Migration strategy TBD

---

### 3. Claude API Service

**File:** `src/services/claude.ts`

**Responsibility:** AI-powered diagram generation

**Model:** Claude Sonnet 4.5 (`claude-sonnet-4-20250514`)

**Key Functions:**

```typescript
generateDiagram(description: string): Promise<DiagramStructure>
generateDiagramModification(params): Promise<DiagramStructure>
chatModifyDiagram(message, context): Promise<DiagramStructure>
parseClaudeResponse(text): DiagramStructure
validateDiagramStructure(diagram): ValidationResult
```

**System Prompt Strategy:**
- Legal domain-specific instructions
- Output format specification (JSON only)
- Common structure recognition patterns
- Compliance considerations

**Legal Conventions:**
1. Delaware default for C-Corps
2. Ownership must sum to 100%
3. Foreign entity styling (blue background)
4. Disregarded entity styling (dashed border)
5. FinCEN >25% beneficial ownership flagging
6. Voting vs economic interest separation
7. Liquidation preference notes

**Error Handling:**
- Timeout (10s) → Abort + retry
- Network error → Retry up to 2 times
- Auth error → No retry, throw immediately
- Parse error → Try multiple formats

**Response Parsing:**
1. Try direct JSON.parse()
2. Try markdown code block extraction
3. Try regex {...} extraction
4. Throw if all fail

**Performance:**
- Target: <3s for simple diagrams (P95)
- Target: <5s for complex diagrams (P95)
- Timeout: 10s hard limit

---

## Component Architecture

### DiagramCanvas Component

**File:** `src/components/Canvas/DiagramCanvas.tsx`

**Type:** Container Component

**Props:**
```typescript
interface DiagramCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
}
```

**State Management:**
- Uses React Flow's `useNodesState` and `useEdgesState` hooks
- Provides callbacks for parent components
- Manages connection creation

**Features:**
- Pan/zoom controls
- MiniMap for navigation
- Background grid
- Auto-layout button
- Connection handling (drag to connect)

**Performance Optimizations:**
- Memoized callbacks
- React Flow's built-in virtualization
- Lazy rendering of off-screen nodes

---

### EntityNode Component

**File:** `src/components/Canvas/EntityNode.tsx`

**Type:** Custom Node Component

**Props:**
```typescript
interface NodeProps {
  id: string;
  type: string;
  data: EntityNodeData;
}

interface EntityNodeData {
  label: string;
  jurisdiction?: string;
  taxStatus?: 'us' | 'foreign' | 'passthrough';
  notes?: string;
}
```

**Entity Types (8):**

| Type | Shape | Border | Background | Use Case |
|------|-------|--------|------------|----------|
| corporation | Rectangle | Solid black | White | C-Corps, S-Corps |
| llc | Rounded rect | Solid blue | White | Limited Liability Companies |
| partnership | Rectangle | Solid green | White | General/Limited Partnerships |
| individual | Ellipse | Solid purple | White | Natural persons, shareholders |
| trust | Rectangle | Solid orange | White | Family trusts, estate planning |
| disregarded | Rectangle | Dashed gray | White | Single-member LLCs |
| foreign | Rectangle | Solid blue | Light blue | Non-US entities |
| asset | Rectangle | Solid teal | White | Real estate, IP, equipment |

**Features:**
- Inline editing (double-click)
- Keyboard support (Enter to save, Esc to cancel)
- Visual differentiation by type
- Jurisdiction display
- Tax status indicators
- Notes/compliance annotations

**Styling:**
- Font: System font stack (Arial-like)
- Border: 2px solid
- Shadow: md (0 4px 6px rgba(0,0,0,0.1))
- Min width: 200px
- Padding: 16px (x) 12px (y)

---

## Data Flow

### Diagram Creation Flow

```
User Action (Add Node)
  ↓
DiagramCanvas.addNode()
  ↓
React Flow State Update
  ↓
EntityNode Render
  ↓
PostHog Event (node_created)
```

### Auto-Layout Flow

```
User Click (Auto Layout Button)
  ↓
DiagramCanvas.handleAutoLayout()
  ↓
LayoutService.getLayoutedElements()
  ↓
Dagre Algorithm
  ↓
Updated Node Positions
  ↓
React Flow State Update
  ↓
Re-render with Animation
  ↓
PostHog Event (layout_applied)
```

### Save Flow

```
User Action (Save)
  ↓
Get Current State (nodes, edges)
  ↓
StorageService.saveDiagram()
  ↓
JSON.stringify(data)
  ↓
localStorage.setItem()
  ↓
Success/Error Callback
  ↓
PostHog Event (diagram_saved)
```

### AI Generation Flow

```
User Input (Description)
  ↓
ClaudeService.generateDiagram()
  ↓
Build System Prompt
  ↓
Anthropic API Call
  ↓
Response (JSON text)
  ↓
parseClaudeResponse()
  ↓
validateDiagramStructure()
  ↓
LayoutService.getLayoutedElements()
  ↓
Update React Flow State
  ↓
PostHog Event (ai_generation_completed)
```

---

## Performance Considerations

### React Flow Optimizations

1. **Virtualization**: React Flow only renders visible nodes
2. **Memoization**: Use React.memo for EntityNode
3. **Debouncing**: Debounce layout triggers (300ms)
4. **Lazy Loading**: Defer non-critical component loading

### Layout Optimizations

1. **Caching**: Cache layout results for unchanged graphs
2. **Incremental**: Only re-layout affected subgraphs
3. **Web Workers**: Consider moving Dagre to worker (future)

### Storage Optimizations

1. **Compression**: gzip diagram data before storing (future)
2. **Incremental**: Only save changed nodes/edges (future)
3. **IndexedDB**: Fallback for large diagrams >5MB (future)

### API Optimizations

1. **Request Caching**: Cache similar prompts (15min TTL)
2. **Streaming**: Stream responses for better UX (future)
3. **Batching**: Batch multiple modifications (future)

---

## Testing Strategy

### Unit Tests (70% of suite)

**Coverage:**
- ✅ Layout service (15 tests)
- ✅ Storage service (20 tests)
- ✅ Claude API service (25 tests)

**Tools:**
- Vitest (test runner)
- vi.fn() (mocking)

**Run:**
```bash
npm test
npm run test:coverage
```

### Integration Tests (25% of suite)

**Coverage:**
- ✅ DiagramCanvas rendering (25 tests)
- ✅ Node interactions
- ✅ Edge creation
- ✅ Auto-layout

**Tools:**
- Vitest + JSDOM
- @testing-library/react

**Run:**
```bash
npm test tests/integration
```

### E2E Tests (5% of suite)

**Coverage:**
- ✅ Complete user workflows (12 tests)
- ✅ AI generation
- ✅ Save/load
- ✅ Export

**Tools:**
- Playwright (multi-browser)

**Run:**
```bash
npm run test:e2e
npm run test:e2e:ui
```

### Stress Tests

**Scenarios:**
- 50 nodes - linear chain
- 100 nodes - tree structure
- 75 nodes - complex multi-tier
- 200 nodes - extreme stress

**Metrics:**
- Render time
- Layout time
- FPS
- Memory usage

**Run:**
```bash
npm run dev
npm run test:stress
```

---

## Security

### Current Implementation

1. ✅ Environment variables for API keys
2. ✅ Input validation on imports
3. ✅ JSON parsing error handling
4. ✅ Storage quota checks

### Future (Phase 2+)

1. ❌ Content Security Policy
2. ❌ XSS protection in labels
3. ❌ Rate limiting
4. ❌ Authentication
5. ❌ Encrypted storage

---

## Accessibility

### Current (Phase 1)

1. ✅ Keyboard navigation
2. ✅ ARIA labels
3. ✅ Focus management
4. ✅ High contrast support

### Future (Phase 2+)

1. ❌ Screen reader optimization
2. ❌ Keyboard shortcut docs
3. ❌ Color blind friendly palette
4. ❌ WCAG 2.1 AA audit

---

## Monitoring & Analytics

### PostHog Integration

**Events Tracked:**
```typescript
// Lifecycle
diagram_created
diagram_saved
diagram_loaded
diagram_exported

// AI
ai_generation_started
ai_generation_completed
ai_generation_failed

// Interactions
user_action_zoom
user_action_pan
user_action_select
user_action_edit

// Performance
performance_render
performance_layout
performance_interaction
```

**Metrics Collected:**
```typescript
{
  renderTime: number,
  layoutTime: number,
  generationTime: number,
  nodeCount: number,
  edgeCount: number,
  fps: number,
  memoryUsed: number
}
```

---

## Build & Deployment

### Build Process

```bash
# Development
npm run dev          # Starts Vite dev server (port 5173)

# Production
npm run build        # Compiles TypeScript + bundles with Vite
npm run preview      # Preview production build locally

# Testing
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm run test         # Vitest unit/integration tests
npm run test:e2e     # Playwright E2E tests
```

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── vendor-[hash].js
└── favicon.ico
```

**Estimated Sizes:**
- index.js: ~150KB gzipped
- vendor.js: ~300KB gzipped (React, React Flow, etc.)
- Total: ~450KB gzipped

### Environment Variables

**Required:**
```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

**Optional:**
```env
VITE_POSTHOG_KEY=phc_...
VITE_POSTHOG_HOST=https://app.posthog.com
```

---

## Future Enhancements

### Phase 2 (Weeks 3-4)

1. AI UI components
   - Generate dialog
   - Chat assistant
   - Context menu actions

2. Auto-save mechanism
   - 30-second interval
   - Debounced triggers
   - Draft recovery

3. PDF export
   - High-quality rendering
   - Court-filing ready
   - Custom page sizes

### Phase 3+ (Post-Launch)

1. Real-time collaboration
2. PowerPoint export
3. Mobile/tablet support
4. Advanced permissions
5. iManage/NetDocuments integration
6. Custom shape editor
7. Animations/transitions
8. Version history
9. Template library
10. Share links

---

## Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | DOM rendering |
| reactflow | ^11.11.4 | Canvas engine |
| @anthropic-ai/sdk | ^0.30.1 | Claude API |
| posthog-js | ^1.167.0 | Analytics |
| zustand | ^4.5.5 | State management |
| dagre | ^0.8.5 | Auto-layout |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ~5.6.2 | Type safety |
| vite | ^5.4.11 | Build tool |
| vitest | ^1.2.0 | Testing |
| @playwright/test | ^1.40.1 | E2E testing |
| tailwindcss | ^3.4.15 | Styling |
| eslint | ^9.15.0 | Linting |

---

## Troubleshooting

### Common Development Issues

**Issue: Module not found errors**
```bash
npm install
npm run dev
```

**Issue: TypeScript errors**
```bash
npm run typecheck
# Fix errors, then retry
```

**Issue: Tests failing**
```bash
# Check test setup
cat tests/setup.ts

# Run specific test
npm test tests/unit/services/layout.test.ts
```

**Issue: Playwright can't find browsers**
```bash
npx playwright install --with-deps
```

---

## Contributing

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Functional components
- Hooks over classes
- Tailwind for styling

### Commit Messages

```
type(scope): description

Examples:
feat(layout): add circular reference detection
fix(claude): handle markdown-wrapped JSON
test(storage): add quota exceeded test
docs(readme): update installation steps
```

### Pull Request Process

1. Create feature branch
2. Implement changes
3. Add tests (aim for 80% coverage)
4. Run `npm run typecheck`
5. Run `npm test`
6. Submit PR with description

---

## License

Proprietary - All Rights Reserved

---

## Contact

For questions or issues:
1. Check documentation in `/tests/`
2. Review CLAUDE.md for project config
3. Contact project maintainers

---

**Document Version:** 1.0
**Last Updated:** 2025-11-12
**Next Review:** After Phase 1 completion
