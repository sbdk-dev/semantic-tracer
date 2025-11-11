# Legal Entity Diagram Tool - Critical Path PRD
**Goal**: Validated demo in 6 weeks with partner lawyer feedback, PostHog tracking, and AI generation

**Target**: Get to "lawyer can create a legal entity diagram in 5-15 minutes" proof point

---

## Week 1-2: Core Canvas with React Flow

### Technology Stack Decision
```javascript
// Final stack (non-negotiable for speed)
{
  "canvas": "React Flow v11+",
  "state": "Zustand",
  "ai": "Anthropic Claude API (direct)",
  "analytics": "PostHog",
  "styling": "Tailwind CSS",
  "framework": "Vite + React 18"
}
```

**Why React Flow wins:**
- HTML-based nodes (no canvas pixel manipulation)
- Custom node types are ~50 lines each
- Built-in dagre layout via `getLayoutedElements`
- Handles connections, selection, zoom/pan automatically
- Active community (40k+ GitHub stars, regular updates)

### Entity Node Implementation

**8 Entity Types as Custom React Flow Nodes:**

```typescript
// Entity type definitions
type EntityType = 
  | 'corporation'    // Rectangle
  | 'llc'           // Rounded rectangle  
  | 'partnership'   // Triangle (CSS transform)
  | 'individual'    // Ellipse (border-radius: 50%)
  | 'trust'         // Diamond (CSS transform)
  | 'disregarded'   // Dashed border rectangle
  | 'foreign'       // Any shape + light blue fill
  | 'asset'         // Hexagon (clip-path)

// Each entity is a React Flow node with HTML rendering
interface LegalEntityNode extends Node {
  type: EntityType;
  data: {
    label: string;
    jurisdiction?: string;
    taxStatus?: 'us' | 'foreign' | 'passthrough';
    ownershipPercentage?: number;
  };
}
```

**Custom Node Component Pattern:**
```jsx
// EntityNode.tsx - single component handles all types
function EntityNode({ data, type }) {
  return (
    <div className={getShapeClass(type)}>
      <Handle type="target" position="top" />
      <div className="entity-content">
        <h3>{data.label}</h3>
        {data.jurisdiction && <span>{data.jurisdiction}</span>}
      </div>
      <Handle type="source" position="bottom" />
    </div>
  );
}

// Register custom nodes
const nodeTypes = {
  corporation: EntityNode,
  llc: EntityNode,
  // ... React Flow handles the rest
};
```

### Auto-Layout Integration

```javascript
// Use dagre with React Flow (15 lines total)
import dagre from 'dagre';
import { useNodesState, useEdgesState } from 'reactflow';

function getLayoutedElements(nodes, edges) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 150 });
  
  nodes.forEach(node => g.setNode(node.id, { width: 150, height: 80 }));
  edges.forEach(edge => g.setEdge(edge.source, edge.target));
  
  dagre.layout(g);
  
  return {
    nodes: nodes.map(node => ({
      ...node,
      position: { x: g.node(node.id).x, y: g.node(node.id).y }
    })),
    edges
  };
}
```

### Week 1-2 Deliverables
- [ ] React Flow canvas with pan/zoom
- [ ] 8 custom entity node types rendering as HTML
- [ ] Click to add entity from palette
- [ ] Drag connections between entities
- [ ] Auto-layout button that reorganizes diagram
- [ ] Basic save/load to localStorage
- [ ] PostHog installed and tracking canvas interactions

---

## Week 3-4: AI Generation Layer

### Claude API Integration Pattern

**Direct Anthropic API (no wrapper):**
```javascript
// services/claude.js
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY
});

export async function generateDiagram(description) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: `You are a legal entity structure expert. Generate diagrams as JSON.
    
Output format (ONLY valid JSON, no markdown):
{
  "nodes": [
    { "id": "1", "type": "corporation", "data": { "label": "HoldCo", "jurisdiction": "Delaware" } }
  ],
  "edges": [
    { "id": "e1", "source": "1", "target": "2", "label": "100%" }
  ]
}

Rules:
- Use standard entity types: corporation, llc, partnership, individual, trust
- Include jurisdiction (e.g., Delaware, Nevada, Cayman Islands)
- Ownership percentages on edges
- Logical hierarchy (parent entities own subsidiaries)`,
    messages: [{
      role: "user",
      content: `Generate a legal entity diagram: ${description}`
    }]
  });
  
  return JSON.parse(message.content[0].text);
}
```

### AI Integration Points (3 modes)

**1. Full Generation (blank canvas start):**
```jsx
function GenerateDialog() {
  const [description, setDescription] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  async function handleGenerate() {
    const result = await generateDiagram(description);
    const layouted = getLayoutedElements(result.nodes, result.edges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }
  
  return (
    <Dialog>
      <textarea 
        placeholder="Describe your structure: Delaware holding company with two subsidiaries..."
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <button onClick={handleGenerate}>Generate</button>
    </Dialog>
  );
}
```

**2. Contextual Actions (selected node editing):**
```jsx
// Right-click menu on nodes
const contextActions = {
  'Add shareholders': async (nodeId) => {
    const prompt = `Add typical shareholders to ${getNode(nodeId).data.label}`;
    const result = await generateDiagram(prompt);
    // Merge new nodes into existing diagram
  },
  'Show ownership chain': async (nodeId) => {
    // Generate visualization of ownership path
  },
  'Add compliance notes': async (nodeId) => {
    const notes = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      messages: [{
        role: "user",
        content: `What compliance requirements for ${getNode(nodeId).data.label}?`
      }]
    });
    updateNodeData(nodeId, { notes: notes.content[0].text });
  }
};
```

**3. Chat Interface (iterative refinement):**
```jsx
// Sidebar chat for diagram modifications
function DiagramChat({ nodes, edges, onUpdate }) {
  const [messages, setMessages] = useState([]);
  
  async function handleMessage(userMessage) {
    const context = `Current diagram: ${JSON.stringify({ nodes, edges })}`;
    
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      messages: [
        { role: "user", content: context },
        { role: "user", content: userMessage }
      ]
    });
    
    const updatedDiagram = JSON.parse(response.content[0].text);
    onUpdate(updatedDiagram);
  }
}
```

### Avoiding Generic Design Trap

**Professional Legal Defaults (not generic):**
```javascript
// legalDefaults.js - domain-specific styling
const LEGAL_ENTITY_STYLES = {
  corporation: {
    shape: 'rectangle',
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
    font: 'Arial, sans-serif', // Professional, not handdrawn
    fontSize: 12,
  },
  foreign: {
    fill: '#E3F2FD', // Light blue for foreign entities (legal standard)
  },
  disregarded: {
    strokeDasharray: '5,5', // Dashed for disregarded entities
  }
};

// Jurisdiction-specific conventions
const JURISDICTION_PATTERNS = {
  'Delaware': { abbreviation: 'DE', commonFor: ['C-Corp', 'LLC'] },
  'Nevada': { abbreviation: 'NV', commonFor: ['Holding Company'] },
  'Cayman Islands': { abbreviation: 'KY', commonFor: ['Offshore', 'Fund'] }
};

// Legal naming conventions
function suggestEntityName(type, role) {
  const suffixes = {
    corporation: 'Inc.',
    llc: 'LLC',
    partnership: 'LP',
  };
  
  const roleNames = {
    holding: 'HoldCo',
    operating: 'OpCo',
    special_purpose: 'SPV',
  };
  
  return `${roleNames[role] || 'Entity'} ${suffixes[type] || ''}`;
}
```

**Lawyer-Specific Prompting:**
```javascript
// Give Claude legal context, not generic instructions
const LEGAL_SYSTEM_PROMPT = `You are an M&A attorney's assistant specializing in corporate structures.

Key principles:
- Delaware is default jurisdiction for C-Corps
- LLC operating agreements typically show managing members
- Ownership chains show both direct and indirect percentages
- Highlight potential tax issues (e.g., foreign ownership > 25%)
- Note required regulatory filings (e.g., FinCEN beneficial owner disclosure)

Visual conventions:
- Foreign entities: light blue fill
- Disregarded entities: dashed border
- Preferred stock: note liquidation preference on edge label
- Voting vs economic interest: show both percentages

Common structures you should recognize:
1. Startup equity: Common + Preferred + Option Pool
2. Holding company: HoldCo → OpCo subsidiaries
3. Real estate: Property LLC → Management LLC
4. Fund structure: GP + LP → Partnership → Portfolio Companies`;
```

### Week 3-4 Deliverables
- [ ] Generate diagram from text description (Claude API)
- [ ] Chat interface for iterative modifications
- [ ] Context menu on nodes with AI actions
- [ ] Legal-specific prompt engineering
- [ ] Professional visual defaults (not generic)
- [ ] PostHog tracking AI generation events

---

## Week 5-6: Polish & Validation

### PostHog Instrumentation

**Critical Events to Track:**
```javascript
// posthog.js
import posthog from 'posthog-js';

posthog.init('YOUR_API_KEY', {
  api_host: 'https://app.posthog.com',
  capture_pageview: false, // Manual for SPA
  autocapture: false, // Track canvas explicitly
});

// Canvas interaction events
export function trackDiagramEvent(eventName, properties = {}) {
  posthog.capture(eventName, {
    ...properties,
    timestamp: Date.now(),
  });
}

// Example tracking
trackDiagramEvent('diagram_created', {
  method: 'ai_generation', // or 'manual', 'template'
  entityCount: nodes.length,
  connectionCount: edges.length,
});

trackDiagramEvent('entity_added', {
  entityType: 'corporation',
  addMethod: 'palette_click', // or 'ai_suggestion', 'duplicate'
});

trackDiagramEvent('layout_executed', {
  beforeEntityCount: nodes.length,
  layoutAlgorithm: 'dagre',
  executionTimeMs: performance.now() - startTime,
});

// Time-to-completion tracking
trackDiagramEvent('session_started', { diagramId });
// ... user works ...
trackDiagramEvent('diagram_completed', {
  diagramId,
  totalTimeSeconds: (Date.now() - sessionStart) / 1000,
  entityCount: nodes.length,
  aiGenerationCount: aiCallCount,
});
```

**Validation Dashboard (PostHog Insights):**
```javascript
// Create these as PostHog insights
const validationMetrics = [
  {
    name: 'Time to Completion',
    type: 'trend',
    events: ['diagram_completed'],
    breakdownBy: 'totalTimeSeconds',
    goal: 'p90 < 900 seconds (15 min)',
  },
  {
    name: 'AI Usage Rate',
    type: 'funnel',
    steps: [
      'diagram_created',
      'ai_generation_used',
      'diagram_completed',
    ],
    goal: '> 70% use AI at least once',
  },
  {
    name: 'Entity Type Distribution',
    type: 'pie',
    events: ['entity_added'],
    breakdownBy: 'entityType',
    goal: 'Validate template coverage',
  },
];
```

### Partner Lawyer Validation Protocol

**Weekly 30-min Sessions:**
```markdown
## Session Structure (Week 1-6)

Week 1-2: "Smoke test"
- Give lawyer 3 real cases from their files
- Can they create basic structures?
- What breaks? What's confusing?
- Goal: Identify blockers

Week 3-4: "Speed test"
- Time them creating 2 diagrams (complex + simple)
- Compare to PowerPoint baseline (they time themselves beforehand)
- Are we hitting 5-15 min target?
- Goal: Validate speed claim

Week 5-6: "Quality test"  
- Are outputs client-ready?
- Would they file these with a court?
- What's missing for professional use?
- Goal: Validate quality bar

## Feedback Collection
- Record sessions (with permission)
- PostHog replays for quantitative data
- Short survey after each session (SUS score)
- Written notes on what they'd pay for this
```

### Export Quality

**PDF Export (production-ready):**
```javascript
// Use react-to-print for high-quality output
import { useReactToPrint } from 'react-to-print';

function ExportDialog() {
  const diagramRef = useRef();
  
  const handlePrint = useReactToPrint({
    content: () => diagramRef.current,
    documentTitle: `Entity-Structure-${Date.now()}`,
    pageStyle: `
      @page {
        size: 11in 17in; /* Legal tabloid */
        margin: 0.5in;
      }
      @media print {
        .react-flow__background { display: none; }
        .react-flow__controls { display: none; }
      }
    `,
  });
  
  return (
    <div>
      <div ref={diagramRef}>
        <ReactFlow nodes={nodes} edges={edges} />
      </div>
      <button onClick={handlePrint}>Export PDF</button>
    </div>
  );
}
```

### Week 5-6 Deliverables
- [ ] PostHog tracking all critical interactions
- [ ] Time-to-completion dashboard showing p50/p90/p95
- [ ] PDF export with legal document formatting
- [ ] 3+ partner lawyer validation sessions completed
- [ ] Documented speed improvement vs PowerPoint baseline
- [ ] List of must-fix issues before expanding beta

---

## Technical Implementation Details

### React Flow + HTML Editing

**Why HTML-based nodes are perfect for legal entities:**

```jsx
// EntityNode.tsx - full HTML editing capabilities
function CorporationNode({ data, id }) {
  const [isEditing, setIsEditing] = useState(false);
  const updateNodeData = useUpdateNodeData();
  
  return (
    <div className="entity-node corporation">
      <Handle type="target" position={Position.Top} />
      
      {/* Inline HTML editing */}
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
      
      {/* Rich metadata display */}
      <div className="entity-details">
        <select 
          value={data.jurisdiction}
          onChange={e => updateNodeData(id, { jurisdiction: e.target.value })}
        >
          <option>Delaware</option>
          <option>Nevada</option>
          <option>Cayman Islands</option>
        </select>
        
        <textarea
          placeholder="Notes..."
          value={data.notes}
          onChange={e => updateNodeData(id, { notes: e.target.value })}
        />
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

**Benefits over canvas-based tools:**
- Real HTML forms, dropdowns, textareas
- Native browser editing (no custom text input logic)
- CSS styling (Tailwind, styled-components, whatever)
- Accessibility (screen readers work)
- Copy/paste works automatically

### Embedding AI Natively

**Three-layer AI integration architecture:**

```javascript
// 1. Background generation (non-blocking)
async function generateInBackground(description) {
  // Use Web Worker to avoid blocking UI
  const worker = new Worker('/ai-worker.js');
  
  worker.postMessage({ description, currentDiagram: { nodes, edges } });
  
  worker.onmessage = (event) => {
    const { nodes: newNodes, edges: newEdges } = event.data;
    // Smoothly merge into existing diagram
    setNodes(existingNodes => [...existingNodes, ...newNodes]);
    setEdges(existingEdges => [...existingEdges, ...newEdges]);
  };
}

// 2. Streaming UI (show progress)
async function generateWithStreaming(description) {
  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    messages: [{ role: "user", content: description }],
  });
  
  let partialJson = '';
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta') {
      partialJson += chunk.delta.text;
      // Try to parse incrementally
      try {
        const parsed = JSON.parse(partialJson);
        // Update UI with partial results
        setNodes(parsed.nodes || []);
      } catch {
        // Not complete JSON yet, continue
      }
    }
  }
}

// 3. Contextual AI (floating button on canvas)
function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  
  return (
    <div className="ai-assistant-fab">
      <button onClick={() => setIsOpen(!isOpen)}>
        ✨ AI Assistant
      </button>
      
      {isOpen && (
        <div className="ai-prompt-box">
          <input
            placeholder="Add shareholders, show ownership chain, etc."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                handleAIAction(prompt);
                setPrompt('');
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
```

**Prompt engineering for legal context:**

```javascript
// Maintain conversation history for multi-turn interactions
const conversationHistory = [];

async function aiModifyDiagram(userPrompt) {
  const systemContext = `Current diagram state:
${JSON.stringify({ nodes, edges }, null, 2)}

User's edit history:
${conversationHistory.map(c => `- ${c}`).join('\n')}

Legal entity conventions to maintain:
- Ownership percentages must sum to 100%
- Foreign entities marked with light blue
- Note any beneficial ownership > 25% (FinCEN rule)`;

  conversationHistory.push(userPrompt);
  
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    system: LEGAL_SYSTEM_PROMPT, // From above
    messages: [
      { role: "assistant", content: systemContext },
      { role: "user", content: userPrompt }
    ]
  });
  
  return JSON.parse(response.content[0].text);
}
```

---

## Risk Mitigation

### Critical Assumptions to Validate

**Week 1-2:**
- [ ] React Flow handles 50+ nodes smoothly (create stress test)
- [ ] Lawyer partner can install and run locally (deployment blocker)
- [ ] PostHog captures canvas events correctly (verify in session 1)

**Week 3-4:**
- [ ] Claude API response time < 3 seconds (measure p95)
- [ ] Generated JSON is valid 95%+ of time (track parse errors)
- [ ] AI output matches legal conventions (lawyer review)

**Week 5-6:**
- [ ] Time-to-completion < 15 min for 80% of diagrams (PostHog data)
- [ ] PDF export is court-filing quality (lawyer signoff)
- [ ] Partner lawyer would use this vs PowerPoint (explicit question)

### What NOT to Build (Scope Creep)

Explicitly deferred (don't even start):
- Real-time collaboration (Week 7+)
- PowerPoint export (depends on user feedback)
- Mobile/tablet support (desktop-first)
- Advanced permissions (single-user MVP)
- Integration with iManage, NetDocuments, etc.
- Custom shape editor (use 8 fixed types)
- Animation or transitions (static diagrams only)

---

## Success Criteria (Week 6 Exit Gate)

Must achieve to proceed:
- [ ] Partner lawyer creates 3 real diagrams in < 15 min each
- [ ] PostHog shows median time-to-completion < 12 min
- [ ] Lawyer confirms outputs are client-ready quality
- [ ] Zero data loss incidents (autosave works)
- [ ] AI generation success rate > 90% (valid JSON output)
- [ ] Lawyer says they'd use this over PowerPoint

Nice to have:
- [ ] 5+ additional lawyers tested and provided feedback
- [ ] Documented 10x speed improvement with examples
- [ ] Clear roadmap of missing features for production
- [ ] Early revenue signal (would they pay? how much?)

---

## File Structure

```
legal-entity-diagram/
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
├── package.json
└── vite.config.ts
```

---

## Development Commands

```bash
# Setup (5 minutes)
npm create vite@latest legal-diagram -- --template react-ts
cd legal-diagram
npm install reactflow @anthropic-ai/sdk posthog-js zustand dagre

# Development
npm run dev         # Start at localhost:5173

# Environment variables (.env.local)
VITE_ANTHROPIC_API_KEY=sk-...
VITE_POSTHOG_KEY=phc_...

# Deployment (Week 6)
npm run build
# Deploy to Vercel/Netlify (< 5 min)
```

---

## Next Steps After Week 6

Based on validation results:
1. **If time < 15 min**: Expand beta to 10 lawyers, build waiting list
2. **If 15-30 min**: Identify bottlenecks (AI speed? Layout quality? UX friction?)
3. **If > 30 min**: Pivot focus to most painful steps

Post-MVP features (prioritize based on lawyer feedback):
- PowerPoint export
- Real-time collaboration
- Template library expansion
- iManage integration
- Firm branding customization

---

**Document version**: 2.0 (Critical Path)
**Last updated**: November 9, 2025
**Sprint duration**: 6 weeks
**Exit criteria**: Validated 10x speed improvement with partner lawyer