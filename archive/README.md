# Archive

This folder contains outdated documentation and files that are no longer actively used but kept for reference.

## Archived on 2025-11-12

### Hive-Mind Documents (.hive-mind/)
- **SESSION_SUMMARY.md** - One-time artifact from Day 9-10 implementation session
- **quick-reference.md** - Quick reference redundant with CLAUDE.md
- **technical-research-report.md** - Research findings merged into CLAUDE.md and TECHNICAL_DESIGN.md

### Day Logs
- **DAY-9-10-PERFORMANCE-TESTING.md** - Day 9-10 implementation details (merged into PHASE-1-AUDIT.md)
- **STRESS_TEST_STATUS.md** - Outdated stress test planning (not yet run)

### Claude Commands (.claude-commands/)
- **speckit.*.md** - 8 speckit framework commands (unused framework)
  - These were part of an experimental specification management framework
  - Not actively used in the project
  - Kept for reference in case framework becomes relevant later

## Active Documentation

See the project root for active documentation:
- **PHASE-1-AUDIT.md** - Comprehensive Phase 1 audit
- **CLAUDE.md** - Project configuration and patterns
- **README.md** - Getting started guide
- **PRD.md** - Product requirements (reference)
- **TECHNICAL_DESIGN.md** - Architecture documentation
- **.hive-mind/COLLECTIVE_MEMORY.md** - Active project memory

## Restoration

If you need to restore any of these files:
```bash
# Copy back to root
cp archive/[filename] ./

# Copy back to .hive-mind
cp archive/.hive-mind/[filename] .hive-mind/

# Copy back to .claude/commands
cp archive/.claude-commands/[filename] .claude/commands/
```
