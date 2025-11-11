# LawDraw Project Structure

**Last Updated:** 2025-11-10
**Status:** Foundation Complete, Implementation Ready

## Overview
Complete scaffolding for the legal entity diagram platform using React + TypeScript + Vite.

**Phase 1 Foundation:** ✅ Complete
- All dependencies installed and configured
- TypeScript types system ready
- Legal domain constants defined
- Test infrastructure established
- Hive mind coordination active

**Implementation Status:** 🔴 Not Started (0% of Phase 1 features)

## Root Files
- `package.json` - All dependencies installed (reactflow, anthropic, posthog, zustand, dagre, tailwind)
- `tsconfig.json` - Strict TypeScript configuration
- `vite.config.ts` - Vite build configuration with path aliases
- `tailwind.config.js` - Tailwind CSS with legal-specific colors
- `eslint.config.js` - ESLint configuration for code quality
- `.env.example` - Template for API keys
- `.gitignore` - Git ignore rules

## Source Structure (`src/`)

### Entry Points
- `main.tsx` - Application entry point
- `App.tsx` - Root component with ReactFlow provider
- `index.css` - Global styles and Tailwind directives
- `vite-env.d.ts` - TypeScript environment definitions

### Types (`src/types/`)
- `entities.ts` - Core entity types:
  - `EntityType` - 8 entity types (corporation, llc, partnership, individual, trust, disregarded, foreign, asset)
  - `EntityData` - Node data structure
  - `OwnershipData` - Edge data structure
  - `DiagramStructure` - Complete diagram format
  - `ENTITY_STYLES` - Visual styles for each entity type
  - `DiagramMetadata` - Tracking and analytics data
- `index.ts` - Type exports

### Constants (`src/constants/`)
- `legalDefaults.ts` - Legal domain knowledge:
  - Default jurisdictions per entity type
  - Default tax status per entity type
  - Entity type labels
  - Common jurisdictions
  - FinCEN threshold (25%)
  - Layout spacing constants
- `prompts.ts` - Claude API prompts:
  - `LEGAL_SYSTEM_PROMPT` - Main legal conventions prompt
  - `MODIFICATION_PROMPT_PREFIX` - For diagram modifications
  - `CHAT_SYSTEM_PROMPT` - For chat assistant
- `index.ts` - Constant exports

### Components (`src/components/`)
Organized by feature area:
- `Canvas/` - React Flow canvas components (to be implemented)
- `AI/` - AI generation UI (to be implemented)
- `Export/` - PDF/PNG export (to be implemented)
- `Analytics/` - PostHog tracking (to be implemented)

### Services (`src/services/`)
- (to be implemented) - Claude API client, storage, layout

### Hooks (`src/hooks/`)
- (to be implemented) - Zustand state, autosave, analytics

## Public Assets (`public/`)
- `vite.svg` - Vite logo icon

## Testing Infrastructure
Pre-configured test files exist in `tests/` with:
- Vitest configuration
- React Testing Library
- Playwright for E2E
- Test fixtures for legal entities and Claude responses
- Test coverage for storage, layout, and Claude services

## Build Verification
✅ TypeScript compilation successful
✅ Vite build successful (dist/ created)
✅ ESLint passes with no errors
✅ All dependencies installed

## Hive Mind Intelligence

### Memory Structure
```
.hive-mind/
├── COLLECTIVE_MEMORY.md          # Shared swarm knowledge
├── memory/
│   ├── researcher/
│   │   ├── technical-research-report.md
│   │   └── quick-reference.md
│   ├── business-analyst/
│   │   ├── comprehensive-status-report.md
│   │   ├── phase-1-acceptance-criteria.md
│   │   ├── risk-register.md
│   │   └── summary.json
│   └── coordinator/
│       └── decisions.json
└── patterns/                     # ReasoningBank-style patterns
    ├── legal_conventions/
    ├── react_flow_patterns/
    └── claude_api_patterns/
```

### Agent Roles
- **Researcher:** Technical architecture validation ✅ Complete
- **Business Analyst:** Requirements and risk analysis ✅ Complete
- **Frontend Developer:** Phase 1 implementation ⏸️ Pending assignment
- **QA Engineer:** Test execution ⏸️ Pending testable features

### Collective Knowledge
- Technical patterns validated (React Flow v12, Zustand, Dagre)
- Business requirements traced (11 acceptance criteria)
- Risk register established (3 critical risks)
- Performance targets defined (>30 FPS @ 50 nodes)

## Next Steps (Phase 1)

### Immediate (Days 1-3)
1. **Day 1:** Create DiagramFlow.tsx (React Flow canvas)
2. **Day 2:** Implement EntityNode.tsx (1 entity type: Corporation)
3. **Day 3:** Build ToolPanel.tsx (entity palette)

### Week 2 (Days 4-10)
4. Complete remaining 7 entity types
5. Implement auto-layout with dagre
6. Add localStorage persistence
7. Integrate PostHog tracking
8. Execute partner lawyer smoke test

**See:** [STATUS.md](STATUS.md) for detailed task breakdown

## Development Commands
- `npm run dev` - Start development server (port 5173)
- `npm run build` - Production build
- `npm run lint` - Lint code
- `npm run preview` - Preview production build
- `npm test` - Run unit/integration tests
- `npm run test:e2e` - Run end-to-end tests

## Key Resources
- [COLLECTIVE_MEMORY.md](.hive-mind/COLLECTIVE_MEMORY.md) - Swarm intelligence
- [Technical Research](.hive-mind/memory/researcher/technical-research-report.md)
- [Business Analysis](.hive-mind/memory/business-analyst/comprehensive-status-report.md)
- [Risk Register](.hive-mind/memory/business-analyst/risk-register.md)
