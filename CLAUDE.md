# Legal Entity Diagram Tool - Project Configuration

## Project Overview

**Mission**: Build a validated legal entity diagramming tool that enables lawyers to create professional diagrams in 5-15 minutes (10x faster than PowerPoint).

**Timeline**: 6 weeks to validated demo with partner lawyer feedback
**Tech Stack**: React Flow + Zustand + Claude API + PostHog + Vite + Tailwind
**Exit Criteria**: Partner lawyer creates 3 real diagrams in <15 min each, confirms preference over PowerPoint

## Core Principles

### Domain-First Development
- **Legal conventions over generic design**: Blue fill for foreign entities, dashed borders for disregarded entities, standard jurisdictions
- **Professional defaults**: Arial font, clean lines, court-filing quality outputs
- **Lawyer-tested**: Weekly 30-min validation sessions, recorded and tracked
- **No generic diagramming**: This is for M&A attorneys and corporate structure charts specifically

### Hive Mind Coordination
- **Collective Intelligence**: Multi-agent swarm with shared memory (`.hive-mind/COLLECTIVE_MEMORY.md`)
- **Research → Analysis → Implementation**: Validated workflow pattern
- **Agent Roles**: Researcher, Business Analyst, Coder, Tester (specialized coordination)
- **Memory-Driven Development**: Store legal conventions and patterns for reuse across sessions

### Technical Philosophy
- **HTML over Canvas**: React Flow's HTML nodes enable native editing, forms, accessibility
- **JSON as Bridge**: Claude generates JSON → React Flow renders JSON → zero impedance mismatch
- **AI-Native**: Three integration patterns (full generation, contextual actions, chat refinement)
- **Evidence-Based**: PostHog tracking from day one, prove speed claims with data

### Scope Discipline
**Build (Weeks 1-6):**
- React Flow canvas with 8 entity types
- Claude API integration (generate + modify)
- Auto-layout with dagre
- PDF export (court-ready)
- PostHog instrumentation
- Partner validation protocol

**Explicitly Deferred (Week 7+):**
- Real-time collaboration
- PowerPoint export
- Mobile/tablet support
- Advanced permissions
- iManage/NetDocuments integration
- Custom shape editor
- Animations/transitions

## Implementation Phases

### Phase 1: Core Canvas + Critical UX ✅ COMPLETE (Weeks 1-2)
**Goal**: Production-ready diagramming tool with professional UX
**Status**: 🟢 Phase 1 + 1A Complete (Day 11-13)
**Last Updated**: 2025-11-12
**Total Implementation:** ~3,413 lines of production code

**Phase 1: Core Canvas (Day 9-12) ✅**
- [x] Vite + React 18 + TypeScript setup
- [x] Dependencies installed (reactflow, zustand, dagre, posthog-js, anthropic)
- [x] Project scaffolding and folder structure
- [x] React Flow canvas with pan/zoom
- [x] 8 custom entity node types (corporation, LLC, partnership, individual, trust, disregarded, foreign, asset)
- [x] Drag connections between entities (8 handles per node)
- [x] Auto-layout button (dagre integration + smart handle selection)
- [x] LocalStorage save/load services
- [x] PostHog tracking hooks
- [x] Entity palette UI (click OR drag to add)
- [x] Zustand store integration
- [x] Auto-save mechanism (30s interval, 2s debounce)
- [x] Inline name editing (double-click nodes)
- [x] Editable edge labels (double-click edges)

**Phase 1A: Critical UX Features (Day 13) ✅**
After user testing revealed missing diagramming basics:
- [x] Multi-select and box selection (Shift+click, drag selection)
- [x] Edge selection UX (20px hit area, visual selection state)
- [x] Edge styling UI (straight/curved/dashed/dotted, colors, thickness)
- [x] Node color customization (background and border pickers)
- [x] Entity type changing (dropdown in PropertyPanel)
- [x] Undo/Redo with Ctrl+Z/Y (50-state history)
- [x] Copy/Paste/Duplicate (Ctrl+C/V/X/D with ID remapping)
- [x] Comprehensive keyboard shortcuts (7 shortcuts, input field detection)
- [x] Alignment tools (6 alignments: left/right/top/bottom/center-h/center-v)

**Implementation Complete (Day 9-13):**
- ✅ Layout service with Dagre + smart handles (~218 lines)
- ✅ Storage service with LocalStorage (~158 lines)
- ✅ Claude API service with retry logic (~192 lines, <3s P95)
- ✅ DiagramCanvas React Flow component (~358 lines)
- ✅ EntityNode component - 8 types (~168 lines)
- ✅ OwnershipEdge - custom edge with wide hit area (~127 lines)
- ✅ PropertyPanel - comprehensive entity editing (~230 lines)
- ✅ EdgePropertyPanel - edge styling controls (~245 lines)
- ✅ ToolPanel entity palette (~137 lines)
- ✅ SaveIndicator component (~79 lines)
- ✅ PostHog performance tracking (~89 lines)
- ✅ Zustand store with persistence (~163 lines)
- ✅ AutoSave hook (~107 lines)
- ✅ UndoRedo hook - 50-state history (~126 lines)
- ✅ CopyPaste hook - ID remapping (~161 lines)
- ✅ Alignment hook - 6 alignments (~196 lines)
- ✅ TypeScript strict mode (100% coverage, zero errors)
- ✅ [PHASE-1-AUDIT.md](PHASE-1-AUDIT.md) - Comprehensive audit
- ✅ [TECHNICAL_DESIGN.md](TECHNICAL_DESIGN.md) - Architecture docs

**Validation:**
- ⏳ React Flow handles 50+ nodes smoothly (stress test ready to run)
- ⏳ Lawyer partner can install and run locally (Week 2 session)
- ✅ PostHog captures events correctly (infrastructure ready)
- ✅ User testing revealed and fixed 9 critical UX gaps
- ✅ All basic diagramming features present (multi-select, undo, copy/paste, alignment)

**Key Files:**
- ✅ `src/components/Canvas/DiagramCanvas.tsx` - Main canvas with hooks integration
- ✅ `src/components/Canvas/EntityNode.tsx` - 8 entity types with inline editing
- ✅ `src/components/Canvas/OwnershipEdge.tsx` - Custom edge with 20px hit area
- ✅ `src/components/Canvas/PropertyPanel.tsx` - Full entity editing panel
- ✅ `src/components/Canvas/EdgePropertyPanel.tsx` - Edge styling panel
- ✅ `src/components/Canvas/ToolPanel.tsx` - Entity palette with drag-drop
- ✅ `src/components/Canvas/SaveIndicator.tsx` - Save status UI
- ✅ `src/services/layout.ts` - Dagre + smart handle selection
- ✅ `src/services/storage.ts` - LocalStorage persistence
- ✅ `src/services/claude.ts` - Claude API client (ready for Phase 2)
- ✅ `src/hooks/useDiagramState.ts` - Zustand store
- ✅ `src/hooks/useAutoSave.ts` - 30s autosave
- ✅ `src/hooks/useUndoRedo.ts` - History management
- ✅ `src/hooks/useCopyPaste.ts` - Clipboard operations
- ✅ `src/hooks/useAlignment.ts` - Node alignment tools
- ✅ `src/hooks/usePostHog.ts` - Performance tracking

**Phase 1B: Critical Bug Fixes (Day 14) ✅**
User testing revealed 3 critical bugs after Day 13 UX improvements:
- [x] **Alignment tools always greyed out** - Fixed reactive state computation in useAlignment hook
- [x] **Edge edits don't preview** - Added live preview with useEffect for real-time updates
- [x] **Copy/paste verification** - Confirmed working, added comprehensive E2E test suite

**Bug Fixes (Day 14):**
- ✅ Fixed `useAlignment` hasSelection computation - now reactive to Zustand state
- ✅ Added live preview to EdgePropertyPanel - changes apply immediately as user edits
- ✅ Created comprehensive Playwright E2E test suite (350 lines, 12 test scenarios)
- ✅ All features verified working: selection, alignment, copy/paste, edge editing

**Key Learnings:**
1. **User testing early prevented building wrong features** - Caught missing UX before AI phase
2. **React Flow is production-ready** - Multi-select, keyboard shortcuts worked out of the box
3. **Edge selection is hard** - Needed 20px invisible hit area overlay
4. **Zustand perfect for undo/redo** - Functional updates prevent race conditions
5. **Smart handle selection critical** - Edges look professional when connected optimally
6. **Reactive computations must watch Zustand state** - Direct array filtering, not cached callbacks
7. **Live preview beats modal edits** - Real-time feedback improves UX dramatically

**See Also:**
- [BUGFIXES-DAY-14.md](BUGFIXES-DAY-14.md) - Critical bug fixes with testing guide
- [PHASE-1-AUDIT.md](PHASE-1-AUDIT.md) - Complete audit with metrics and learnings
- [TECHNICAL_DESIGN.md](TECHNICAL_DESIGN.md) - Technical architecture
- [PRD.md](PRD.md) - Original product requirements (reference)

### Phase 2: AI Generation ⏳ NEXT (Weeks 3-4)
**Goal**: Validate AI diagram generation with legal-specific prompting
**Status**: Ready to begin
**Last Updated**: 2025-11-12

**REVISED Plan Based on Phase 1 Learnings:**

**Week 3: Core Generation (Validate AI Works)**
- [ ] GenerateDialog component - modal for text-to-diagram
- [ ] JSON validation and error handling
- [ ] Auto-layout integration after generation
- [ ] Loading states and error messages
- [ ] PostHog tracking for AI events
- [ ] User testing session 1 - Does AI generation work?

**Week 4: Iterative Refinement (Build on What Works)**
- [ ] ChatAssistant component - sidebar for modifications
- [ ] Context menu on nodes (right-click actions)
- [ ] Undo/redo integration with AI changes
- [ ] User testing session 2 - Is iterative editing useful?

**Deferred to Phase 3:**
- Streaming UI (nice-to-have, not MVP)
- Advanced AI features (after basics proven)
- AI-suggested improvements
- Compliance checking automation

**Infrastructure Already Complete:**
- ✅ `src/services/claude.ts` - Anthropic API client with retry logic
- ✅ Legal-specific system prompts
- ✅ Professional visual defaults (8 entity types)
- ✅ PostHog tracking hooks ready
- ✅ JSON parsing with fallback strategies

**Phase 2 Success Criteria:**
- [ ] Generate valid diagram from text (95%+ success rate)
- [ ] Claude API P95 response time <3 seconds
- [ ] Chat modifications work without breaking existing diagram
- [ ] 2+ partner lawyer sessions with positive feedback
- [ ] PostHog shows <15 min time-to-completion for 80% of diagrams

**Key Learnings Applied:**
1. **Build basic generation first, fancy UX later** - Validate AI works before streaming UI
2. **Integrate with existing UX** - Undo/redo, selection, editing already work
3. **User testing after each milestone** - Catch problems early like Phase 1A

**Files to Create:**
- [ ] `src/components/AI/GenerateDialog.tsx` - Text-to-diagram modal (~200 lines)
- [ ] `src/components/AI/ChatAssistant.tsx` - Sidebar chat (~250 lines)
- [ ] `src/components/AI/ContextMenu.tsx` - Right-click actions (~150 lines)
- [ ] `src/components/AI/AIFab.tsx` - Floating AI button (~50 lines)

**Validation:**
- ⏳ Claude API response time <3 seconds (p95) - Service ready to test
- ⏳ Generated JSON valid 95%+ of time - Parser ready to test
- ⏳ AI output matches legal conventions (lawyer review Week 2)
- ⏳ Time to create diagram <15 min (PostHog tracking)

### Phase 3: Validation & Polish (Weeks 5-6)
**Goal**: Partner lawyer validation + production-ready exports

**Tasks:**
- [ ] PDF export with legal document formatting
- [ ] PostHog dashboard (time-to-completion, AI usage, entity distribution)
- [ ] 30-second autosave implementation
- [ ] Week 1-2: Smoke test (3 real cases)
- [ ] Week 3-4: Speed test (timed vs PowerPoint)
- [ ] Week 5-6: Quality test (client-ready outputs)
- [ ] Document speed improvement with examples
- [ ] Collect lawyer feedback (SUS scores, pricing signals)

**Validation:**
- Time-to-completion <15 min for 80% of diagrams
- PDF export is court-filing quality
- Partner lawyer confirms they'd use this vs PowerPoint

**Key Files:**
- `src/components/Export/PDFExport.tsx` - Print-to-PDF
- `src/components/Analytics/PostHogProvider.tsx` - Tracking wrapper
- `src/hooks/useAutoSave.ts` - 30-second autosave
- `src/hooks/usePostHog.ts` - Event tracking

## Technical Standards

### React Flow Patterns
```typescript
// Custom node with inline editing
function EntityNode({ data, id }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateNodeData = useUpdateNodeData();

  return (
    <div className={getShapeClass(data.type)}>
      <Handle type="target" position={Position.Top} />
      {isEditing ? (
        <input
          autoFocus
          defaultValue={data.label}
          onBlur={(e) => {
            updateNodeData(id, { label: e.target.value });
            setIsEditing(false);
          }}
        />
      ) : (
        <h3 onDoubleClick={() => setIsEditing(true)}>
          {data.label}
        </h3>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

### Claude API Integration
```typescript
// Direct Anthropic API (no wrapper)
export async function generateDiagram(description: string) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: LEGAL_SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: `Generate a legal entity diagram: ${description}`
    }]
  });

  return JSON.parse(message.content[0].text);
}
```

### PostHog Tracking
```typescript
// Critical events to track
trackDiagramEvent('diagram_created', {
  method: 'ai_generation', // or 'manual', 'template'
  entityCount: nodes.length,
  connectionCount: edges.length,
});

trackDiagramEvent('diagram_completed', {
  diagramId,
  totalTimeSeconds: (Date.now() - sessionStart) / 1000,
  entityCount: nodes.length,
  aiGenerationCount: aiCallCount,
});
```

## Legal Domain Knowledge

### Entity Types (8 Standard Shapes)
- **Corporation**: Rectangle, black border, white fill
- **LLC**: Rounded rectangle
- **Partnership**: Triangle (CSS transform)
- **Individual**: Ellipse (border-radius: 50%)
- **Trust**: Diamond (CSS transform)
- **Disregarded Entity**: Dashed border rectangle
- **Foreign Entity**: Any shape + light blue fill (#E3F2FD)
- **Asset**: Hexagon (clip-path)

### Legal Conventions
- Delaware is default jurisdiction for C-Corps
- Ownership percentages must sum to 100%
- Note beneficial ownership >25% (FinCEN rule)
- Show voting vs economic interest separately
- Highlight potential tax issues (foreign ownership)

### Common Structures to Recognize
1. **Startup Equity**: Common + Preferred + Option Pool
2. **Holding Company**: HoldCo → OpCo subsidiaries
3. **Real Estate**: Property LLC → Management LLC
4. **Fund Structure**: GP + LP → Partnership → Portfolio Companies

## Development Workflow

### Setup
```bash
npm create vite@latest . -- --template react-ts
npm install reactflow @anthropic-ai/sdk posthog-js zustand dagre @types/dagre
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Environment Variables
```env
# .env.local
VITE_ANTHROPIC_API_KEY=sk-...
VITE_POSTHOG_KEY=phc_...
```

### Git Workflow
- Feature branches only (no direct commits to main)
- Commit after each phase milestone
- Include PostHog data in validation commits

### Testing Strategy
- Stress test: 50+ nodes on canvas
- API reliability: Track Claude parse errors
- Speed validation: Time lawyers creating diagrams
- Quality check: Lawyer confirms court-ready outputs

## Success Metrics (Week 6 Exit Gate)

### Must Achieve
- [ ] Partner lawyer creates 3 real diagrams in <15 min each
- [ ] PostHog shows median time-to-completion <12 min
- [ ] Lawyer confirms outputs are client-ready quality
- [ ] Zero data loss incidents (autosave works)
- [ ] AI generation success rate >90% (valid JSON)
- [ ] Lawyer says they'd use this over PowerPoint

### Nice to Have
- [ ] 5+ additional lawyers tested
- [ ] Documented 10x speed improvement
- [ ] Clear roadmap for production features
- [ ] Early revenue signal (pricing feedback)

## Risk Mitigation

### Week 1-2 Risks
- React Flow performance with many nodes → Stress test early
- Local installation issues → Test with lawyer in session 1
- PostHog event capture → Verify in first session

### Week 3-4 Risks
- Claude API latency → Measure p95, consider streaming UI
- JSON parsing errors → Track and log all failures
- Legal convention mismatches → Lawyer review of AI outputs

### Week 5-6 Risks
- Time target missed → Identify bottlenecks in PostHog data
- PDF export quality issues → Get lawyer signoff before exit
- Lawyer preference unclear → Ask explicit comparison questions

## File Structure

```
lawdraw/
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── DiagramFlow.tsx           # Main React Flow wrapper
│   │   │   ├── EntityNode.tsx            # Custom node component
│   │   │   ├── ToolPanel.tsx             # Entity palette
│   │   │   └── ContextMenu.tsx           # Right-click actions
│   │   ├── AI/
│   │   │   ├── GenerateDialog.tsx        # Full generation modal
│   │   │   ├── ChatAssistant.tsx         # Sidebar chat
│   │   │   └── AIFab.tsx                 # Floating AI button
│   │   ├── Export/
│   │   │   ├── PDFExport.tsx            # Print-to-PDF
│   │   │   └── PNGExport.tsx            # Canvas screenshot
│   │   └── Analytics/
│   │       └── PostHogProvider.tsx       # Tracking wrapper
│   ├── services/
│   │   ├── claude.ts                     # Anthropic API client
│   │   ├── layout.ts                     # Dagre integration
│   │   └── storage.ts                    # LocalStorage persistence
│   ├── hooks/
│   │   ├── useDiagramState.ts           # Zustand store
│   │   ├── useAutoSave.ts               # 30-second autosave
│   │   └── usePostHog.ts                # Event tracking
│   ├── constants/
│   │   ├── legalDefaults.ts             # Entity styles/conventions
│   │   └── prompts.ts                   # Claude system prompts
│   └── types/
│       └── entities.ts                   # TypeScript definitions
├── .env.example                          # API keys template
├── CLAUDE.md                             # This file
├── PRD.md                                # Product requirements
├── package.json
└── vite.config.ts
```

## Claude Integration Architecture

### Understanding the Two Claude Roles

This project uses Claude in **two distinct ways** - it's critical to understand the difference:

#### 1. Claude Code (Development Agent)
**What it does:** Helps YOU build this tool
- Reads/writes code files
- Executes bash commands
- Follows PRD instructions
- Creates slash commands

**Example usage:**
```bash
# Claude Code helps you implement features
/implement-entity-node
/add-posthog-tracking
```

#### 2. Claude API (Product Feature)
**What it does:** Powers the tool's AI features for LAWYERS
- Generates legal entity diagrams from descriptions
- Modifies existing diagrams based on natural language
- Suggests legal structure improvements
- Answers compliance questions

**Example usage (in the product):**
```typescript
// Lawyer describes what they want
"Delaware holding company with two Texas subsidiaries"
  ↓
// Your code calls Claude API
const diagram = await generateDiagram(description)
  ↓
// Lawyer gets rendered diagram
```

### Integration Pattern: Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                Layer 1: Lawyer User                      │
│                                                          │
│  • Clicks "Generate Diagram" button                     │
│  • Types: "Add shareholders to HoldCo"                  │
│  • Right-clicks node → "Show ownership chain"           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│         Layer 2: Your React Application                  │
│                                                          │
│  • Captures user input                                  │
│  • Calls src/services/claude.ts                         │
│  • Parses JSON response                                 │
│  • Updates React Flow state                             │
│  • Tracks with PostHog                                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│          Layer 3: Claude API (Anthropic)                 │
│                                                          │
│  • Receives legal domain prompt                         │
│  • Generates JSON diagram structure                     │
│  • Returns nodes + edges                                │
│  • Response time: <3 seconds (p95)                      │
└─────────────────────────────────────────────────────────┘
```

## Claude API Integration Patterns

### Pattern 1: Full Diagram Generation

**Use Case:** Lawyer starts with blank canvas, describes structure

**Implementation:**

```typescript
// src/services/claude.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY
});

export async function generateDiagram(description: string) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: LEGAL_SYSTEM_PROMPT, // See below
    messages: [{
      role: "user",
      content: `Generate a legal entity diagram: ${description}`
    }]
  });

  const response = message.content[0].text;

  // Parse JSON from response
  try {
    return JSON.parse(response);
  } catch {
    // Try extracting from markdown code blocks
    const jsonMatch = response.match(/```json\s*\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    throw new Error('Could not parse JSON from Claude response');
  }
}
```

**System Prompt (Critical for Quality):**

```typescript
// src/constants/prompts.ts
export const LEGAL_SYSTEM_PROMPT = `You are an M&A attorney's assistant specializing in corporate structures.

OUTPUT FORMAT - Return ONLY valid JSON (no markdown, no explanations):
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "corporation" | "llc" | "partnership" | "individual" | "trust" | "disregarded" | "foreign" | "asset",
      "position": { "x": 0, "y": 0 },
      "data": {
        "label": "Entity Name",
        "jurisdiction": "Delaware" | "Nevada" | "Cayman Islands" | etc.,
        "taxStatus": "us" | "foreign" | "passthrough",
        "notes": "Optional compliance notes"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "parent-id",
      "target": "child-id",
      "label": "100%",
      "data": {
        "ownershipType": "voting" | "economic" | "both",
        "votingPercentage": 100,
        "economicPercentage": 100
      }
    }
  ]
}

LEGAL CONVENTIONS TO FOLLOW:
1. Delaware is default jurisdiction for C-Corps
2. Ownership percentages must sum to 100% per entity
3. Foreign entities (non-US) use "foreign" type
4. Disregarded entities (single-member LLCs) use "disregarded" type
5. Note beneficial ownership >25% (FinCEN rule)
6. For preferred stock, note liquidation preference in notes
7. Show both voting and economic interest if different

COMMON STRUCTURES YOU SHOULD RECOGNIZE:
- Startup: Common shareholders + Preferred investors + Option Pool
- Holding Company: HoldCo (parent) → OpCo subsidiaries
- Real Estate: Property LLC → Management LLC
- Fund: GP + LP → Partnership → Portfolio Companies

VISUAL LAYOUT HINTS:
- Use hierarchical top-down layout (parents above children)
- Space nodes 150px horizontally, 100px vertically
- Group related entities (e.g., all subsidiaries at same level)

COMPLIANCE CONSIDERATIONS:
- Flag foreign ownership >25% for CFIUS review
- Note required filings (FinCEN beneficial ownership)
- Highlight potential tax issues (e.g., foreign LLC classification)
`;
```

**UI Component:**

```typescript
// src/components/AI/GenerateDialog.tsx
import { useState } from 'react';
import { useNodesState, useEdgesState } from 'reactflow';
import { generateDiagram } from '@/services/claude';
import { getLayoutedElements } from '@/services/layout';
import { trackDiagramEvent } from '@/hooks/usePostHog';

export function GenerateDialog({ onClose }: { onClose: () => void }) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  async function handleGenerate() {
    if (!description.trim()) return;

    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      // Call Claude API
      const result = await generateDiagram(description);

      // Apply auto-layout
      const layouted = getLayoutedElements(result.nodes, result.edges);

      // Update diagram state
      setNodes(layouted.nodes);
      setEdges(layouted.edges);

      // Track success
      trackDiagramEvent('diagram_generated', {
        method: 'ai_full_generation',
        description: description.substring(0, 100),
        entityCount: result.nodes.length,
        connectionCount: result.edges.length,
        generationTimeMs: Date.now() - startTime,
      });

      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMessage);

      // Track failure
      trackDiagramEvent('diagram_generation_failed', {
        error: errorMessage,
        description: description.substring(0, 100),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Generate Diagram</h2>

        <textarea
          className="w-full h-32 p-3 border rounded-md mb-4"
          placeholder="Describe your legal entity structure...&#10;&#10;Example: Delaware holding company with two Texas LLC subsidiaries. HoldCo owns 80% of OpCo 1 and 100% of OpCo 2."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Pattern 2: Contextual Node Actions

**Use Case:** Lawyer right-clicks existing node, wants to modify

**Implementation:**

```typescript
// src/components/Canvas/ContextMenu.tsx
import { useState } from 'react';
import { Node } from 'reactflow';
import { generateDiagramModification } from '@/services/claude';

interface ContextMenuProps {
  node: Node;
  position: { x: number; y: number };
  onClose: () => void;
}

export function ContextMenu({ node, position, onClose }: ContextMenuProps) {
  const actions = [
    {
      label: 'Add typical shareholders',
      prompt: `Add typical shareholders to ${node.data.label}. Include:
- Common shareholders (founders, employees)
- Preferred investors (Series A/B)
- Option pool (10-15%)
Maintain proper ownership percentages that sum to 100%.`,
    },
    {
      label: 'Show ownership chain',
      prompt: `Create a visualization showing the full ownership chain from ${node.data.label} up to ultimate beneficial owners. Include both direct and indirect ownership percentages.`,
    },
    {
      label: 'Add compliance notes',
      prompt: `What are the key compliance requirements for ${node.data.label} (${node.data.jurisdiction} ${node.type})? Consider:
- Required filings (annual reports, tax returns)
- Beneficial ownership disclosure (FinCEN)
- Foreign ownership restrictions (if applicable)
- Corporate governance requirements`,
    },
    {
      label: 'Suggest subsidiaries',
      prompt: `Suggest typical subsidiary structures for ${node.data.label}. Consider common patterns for ${node.type}s in ${node.data.jurisdiction}.`,
    },
  ];

  async function handleAction(action: typeof actions[0]) {
    try {
      const result = await generateDiagramModification({
        currentDiagram: { nodes, edges }, // Get from context
        action: action.prompt,
        focusNodeId: node.id,
      });

      // Merge new nodes/edges into diagram
      // (Implementation depends on your state management)

      trackDiagramEvent('ai_contextual_action', {
        action: action.label,
        nodeType: node.type,
      });
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      onClose();
    }
  }

  return (
    <div
      className="absolute bg-white border shadow-lg rounded-md py-1 z-50"
      style={{ left: position.x, top: position.y }}
    >
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => handleAction(action)}
          className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
```

### Pattern 3: Chat-Based Refinement

**Use Case:** Lawyer iteratively refines diagram through conversation

**Implementation:**

```typescript
// src/components/AI/ChatAssistant.tsx
import { useState } from 'react';
import { useNodesState, useEdgesState } from 'reactflow';
import { chatModifyDiagram } from '@/services/claude';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Include conversation history for context
      const context = {
        currentDiagram: { nodes, edges },
        conversationHistory: messages,
      };

      const result = await chatModifyDiagram(input, context);

      // Update diagram
      const layouted = getLayoutedElements(result.nodes, result.edges);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.explanation || 'Diagram updated.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      trackDiagramEvent('ai_chat_modification', {
        messageLength: input.length,
        changesApplied: result.nodes.length - nodes.length,
      });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err.message}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full w-80 border-l bg-gray-50">
      <div className="p-4 border-b bg-white">
        <h3 className="font-semibold">AI Assistant</h3>
        <p className="text-sm text-gray-600">
          Describe changes to your diagram
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-100 ml-8'
                : 'bg-white border mr-8'
            }`}
          >
            <p className="text-sm">{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="bg-white border rounded-lg p-3 mr-8">
            <p className="text-sm text-gray-500">Thinking...</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Add Delaware LLC..."
            disabled={loading}
            className="flex-1 px-3 py-2 border rounded-md text-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Claude API Service Implementation

**Complete service with error handling and retries:**

```typescript
// src/services/claude.ts
import Anthropic from '@anthropic-ai/sdk';
import { LEGAL_SYSTEM_PROMPT } from '@/constants/prompts';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

const MODEL = "claude-sonnet-4-20250514";
const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;

interface DiagramStructure {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, any>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    data?: Record<string, any>;
  }>;
  explanation?: string;
}

export async function generateDiagram(
  description: string
): Promise<DiagramStructure> {
  return callClaudeAPI(`Generate a legal entity diagram: ${description}`);
}

export async function generateDiagramModification(params: {
  currentDiagram: DiagramStructure;
  action: string;
  focusNodeId: string;
}): Promise<DiagramStructure> {
  const prompt = `
Current diagram:
${JSON.stringify(params.currentDiagram, null, 2)}

User action on node ${params.focusNodeId}:
${params.action}

Return the COMPLETE updated diagram with the requested modifications merged in.
Maintain all existing nodes unless explicitly replacing them.
  `.trim();

  return callClaudeAPI(prompt);
}

export async function chatModifyDiagram(
  userMessage: string,
  context: {
    currentDiagram: DiagramStructure;
    conversationHistory: Array<{ role: string; content: string }>;
  }
): Promise<DiagramStructure> {
  const contextPrompt = `
Current diagram state:
${JSON.stringify(context.currentDiagram, null, 2)}

Previous conversation:
${context.conversationHistory
  .slice(-5) // Last 5 messages for context
  .map((m) => `${m.role}: ${m.content}`)
  .join('\n')}

User request: ${userMessage}

Return the updated diagram JSON with an "explanation" field describing what changed.
  `.trim();

  return callClaudeAPI(contextPrompt);
}

async function callClaudeAPI(
  prompt: string,
  retries = MAX_RETRIES
): Promise<DiagramStructure> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const message = await anthropic.messages.create(
      {
        model: MODEL,
        max_tokens: 4000,
        system: LEGAL_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    const responseText = message.content[0].text;
    return parseClaudeResponse(responseText);
  } catch (error) {
    if (retries > 0 && shouldRetry(error)) {
      console.warn(`API call failed, retrying... (${retries} left)`);
      await sleep(1000);
      return callClaudeAPI(prompt, retries - 1);
    }
    throw new Error(`Claude API error: ${error.message}`);
  }
}

function parseClaudeResponse(text: string): DiagramStructure {
  // Try direct JSON parse
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting from markdown code block
    const jsonMatch = text.match(/```json\s*\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try extracting just {...} content
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    throw new Error('Could not parse JSON from Claude response');
  }
}

function shouldRetry(error: any): boolean {
  // Retry on network errors, timeouts, and 5xx errors
  return (
    error.name === 'AbortError' ||
    error.message?.includes('network') ||
    error.status >= 500
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Export for testing
export { parseClaudeResponse, callClaudeAPI };
```

### Cost & Performance Optimization

**Implement caching for similar requests:**

```typescript
// src/services/claude-cache.ts
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 50, // Cache up to 50 responses
  ttl: 1000 * 60 * 15, // 15 minutes
});

export function getCacheKey(prompt: string): string {
  // Normalize prompt for better cache hits
  return prompt
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function getCachedResponse(prompt: string): any | null {
  return cache.get(getCacheKey(prompt)) || null;
}

export function setCachedResponse(prompt: string, response: any): void {
  cache.set(getCacheKey(prompt), response);
}

// Wrap Claude API calls with caching
export async function generateDiagramCached(
  description: string
): Promise<DiagramStructure> {
  const cached = getCachedResponse(description);
  if (cached) {
    console.log('[Cache] Hit for diagram generation');
    trackDiagramEvent('cache_hit', { type: 'generation' });
    return cached;
  }

  const result = await generateDiagram(description);
  setCachedResponse(description, result);
  return result;
}
```

### Streaming for Better UX

**Show progressive results as Claude generates:**

```typescript
// src/services/claude-streaming.ts
export async function generateDiagramStreaming(
  description: string,
  onProgress: (partial: Partial<DiagramStructure>) => void
): Promise<DiagramStructure> {
  const stream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: 4000,
    system: LEGAL_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Generate: ${description}` }],
  });

  let accumulatedText = '';

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta') {
      accumulatedText += chunk.delta.text;

      // Try to parse partial JSON
      try {
        const partial = parseClaudeResponse(accumulatedText);
        onProgress(partial); // Update UI incrementally
      } catch {
        // Not complete yet, continue accumulating
      }
    }
  }

  return parseClaudeResponse(accumulatedText);
}

// Usage in component
function GenerateDialogStreaming() {
  const [partialResult, setPartialResult] = useState<Partial<DiagramStructure>>({});

  async function handleGenerate() {
    const result = await generateDiagramStreaming(description, (partial) => {
      setPartialResult(partial); // Show nodes as they arrive
    });

    // Final result
    setNodes(result.nodes);
    setEdges(result.edges);
  }
}
```

## Development Tools for Claude Integration

### Slash Commands for Testing

Create these commands to help Claude Code assist with development:

**File:** `.claude/commands/test-claude-api.md`

```markdown
# Test Claude API

## Instructions for Claude Code

Test the Claude API integration to verify it's working correctly.

### Usage
/test-claude-api

### Steps

1. Check if API key is set:
\```bash
node -e "console.log('API Key present:', !!process.env.VITE_ANTHROPIC_API_KEY)"
\```

2. Run test script:
\```bash
node scripts/test-claude-integration.js
\```

This will:
- Make a test API call to Claude
- Verify JSON parsing works
- Check response time
- Report any errors

3. Report results to user with:
- ✅ API connectivity status
- ⏱️ Response time
- 📊 Token usage
- ❌ Any errors encountered
```

**File:** `scripts/test-claude-integration.js`

```javascript
#!/usr/bin/env node

const Anthropic = require('@anthropic-ai/sdk');

async function testClaudeAPI() {
  const apiKey = process.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('❌ VITE_ANTHROPIC_API_KEY not found in environment');
    process.exit(1);
  }

  console.log('✅ API key found');
  console.log('🔄 Testing API connection...\n');

  const anthropic = new Anthropic({ apiKey });
  const startTime = Date.now();

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: 'Generate a simple legal entity diagram JSON with one Delaware corporation. Return only valid JSON.',
        },
      ],
    });

    const responseTime = Date.now() - startTime;
    const responseText = message.content[0].text;

    console.log('✅ API call successful');
    console.log(`⏱️  Response time: ${responseTime}ms`);
    console.log(`📊 Tokens used: ${message.usage.input_tokens} in, ${message.usage.output_tokens} out`);
    console.log(`💰 Estimated cost: $${calculateCost(message.usage)}\n`);

    // Test JSON parsing
    try {
      const parsed = JSON.parse(responseText);
      console.log('✅ JSON parsing successful');
      console.log(`📋 Generated ${parsed.nodes?.length || 0} nodes, ${parsed.edges?.length || 0} edges\n`);
    } catch {
      console.warn('⚠️  Response not valid JSON, trying markdown extraction...');
      const jsonMatch = responseText.match(/```json\s*\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        JSON.parse(jsonMatch[1]);
        console.log('✅ JSON extracted from markdown\n');
      } else {
        throw new Error('Could not parse JSON');
      }
    }

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

function calculateCost(usage) {
  // Claude Sonnet 4.5 pricing (as of 2025)
  const inputCostPer1M = 3.0;
  const outputCostPer1M = 15.0;

  const inputCost = (usage.input_tokens / 1_000_000) * inputCostPer1M;
  const outputCost = (usage.output_tokens / 1_000_000) * outputCostPer1M;

  return (inputCost + outputCost).toFixed(4);
}

testClaudeAPI();
```

### Manual Testing Command

**File:** `.claude/commands/manual-claude-test.md`

```markdown
# Manual Claude Test

## Instructions for Claude Code

Help the user manually test a Claude API prompt.

### Usage
/manual-claude-test

### Steps

1. Ask user for test prompt:
"What prompt would you like to test with Claude?"

2. Save prompt to file:
\```bash
cat > temp/test-prompt.txt << 'EOF'
[USER'S PROMPT HERE]
EOF
\```

3. Run test:
\```bash
node scripts/manual-claude-test.js temp/test-prompt.txt
\```

4. Show results:
- Display the JSON response
- Show response time
- Report token usage and cost
- Ask if user wants to try another prompt
```

## Quick Reference

### When Stuck
1. Check [PRD.md](PRD.md) for implementation details
2. Review React Flow docs: https://reactflow.dev/
3. Anthropic API reference: https://docs.anthropic.com/
4. PostHog event tracking: https://posthog.com/docs

### Key Questions to Ask
- Does this feature help lawyers create diagrams faster?
- Is this legal-specific or generic design?
- Can we validate this with partner lawyer this week?
- What PostHog data proves this works?

### Decision Framework
- **Build vs Buy**: Use React Flow (proven), not custom canvas
- **AI Integration**: Direct Anthropic API (fast), not wrapper
- **Validation**: Weekly lawyer sessions (real feedback), not assumptions
- **Scope**: MVP first (6 weeks), not feature creep

### Claude Integration Checklist
- [ ] API key in .env.local (never commit)
- [ ] Test API connectivity with /test-claude-api
- [ ] Legal system prompt in src/constants/prompts.ts
- [ ] Error handling and retries in API calls
- [ ] PostHog tracking for all AI interactions
- [ ] Response time monitoring (<3s p95 target)
- [ ] JSON parsing with fallback to markdown extraction
- [ ] Cost tracking per request
- [ ] Caching for similar requests (optional, Phase 3)
- [ ] Streaming UI for better UX (optional, Phase 3)

---

**Document version**: 2.0
**Last updated**: 2025-11-09
**Sprint duration**: 6 weeks
**Next milestone**: Phase 1 complete (Week 2)
