# LawDraw

Legal entity diagramming tool for M&A attorneys and corporate structure charts.

**Status:** 🟡 Phase 1 - Foundation Complete, Implementation Ready
**Sprint:** Week 1 of 6
**Last Updated:** 2025-11-10

> **Quick Start:** `npm install && npm run dev`
> **Status:** See [STATUS.md](STATUS.md) for detailed progress
> **Hive Mind:** See [.hive-mind/COLLECTIVE_MEMORY.md](.hive-mind/COLLECTIVE_MEMORY.md) for swarm intelligence

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env.local` and add your API keys:
```bash
cp .env.example .env.local
```

3. Add your API keys to `.env.local`:
- Get Anthropic API key from: https://console.anthropic.com/
- Get PostHog key from: https://posthog.com/

4. Start development server:
```bash
npm run dev
```

## Tech Stack

- React 18 + TypeScript
- Vite for build tooling
- React Flow for canvas
- Zustand for state management
- Tailwind CSS for styling
- Anthropic Claude API for AI generation
- PostHog for analytics
- Dagre for auto-layout

## Project Structure

```
src/
├── components/
│   ├── Canvas/       # React Flow canvas components
│   ├── AI/           # AI generation UI
│   ├── Export/       # PDF/PNG export
│   └── Analytics/    # PostHog tracking
├── services/         # API clients (Claude, storage)
├── hooks/            # React hooks (state, autosave, analytics)
├── constants/        # Legal defaults, prompts
└── types/            # TypeScript definitions
```

## Development

- `npm run dev` - Start dev server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm test` - Run tests (Vitest)
- `npm run test:e2e` - End-to-end tests (Playwright)

## Project Status

**Phase 1 Progress:** 10% (scaffolding complete, implementation not started)

| Component | Status | Target |
|-----------|--------|--------|
| Project Setup | ✅ Complete | Week 1 |
| React Flow Canvas | 🔴 Not Started | Week 1 |
| Entity Types | 🔴 Not Started | Week 1 |
| Auto-Layout | 🔴 Not Started | Week 2 |
| PostHog Tracking | 🔴 Not Started | Week 2 |

**See [STATUS.md](STATUS.md) for detailed progress tracking.**

## Documentation

- [PRD.md](PRD.md) - Product requirements and technical specifications
- [CLAUDE.md](CLAUDE.md) - Project configuration and development patterns
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - File organization and architecture
- [STATUS.md](STATUS.md) - Current project status and metrics
- [.hive-mind/COLLECTIVE_MEMORY.md](.hive-mind/COLLECTIVE_MEMORY.md) - Swarm intelligence and shared knowledge

## Environment Variables

- `VITE_ANTHROPIC_API_KEY` - Claude API key (required for AI features)
- `VITE_POSTHOG_KEY` - PostHog project key (required for analytics)
- `VITE_POSTHOG_HOST` - PostHog host (optional, defaults to app.posthog.com)
