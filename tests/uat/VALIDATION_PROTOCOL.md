# User Acceptance Testing Protocol

## Partner Lawyer Validation - 6 Week Program

### Overview

This protocol guides weekly 30-minute validation sessions with partner lawyer over 6 weeks. Each session builds toward the exit criteria: lawyer creates 3 real diagrams in <15 minutes each, confirms preference over PowerPoint.

---

## Pre-Session Setup

### Before Each Session

1. **Technical Preparation**
   - [ ] Application running locally on lawyer's machine
   - [ ] PostHog tracking enabled and verified
   - [ ] Screen recording software ready (with permission)
   - [ ] Backup of previous session's data
   - [ ] Test API key configured

2. **Session Recording**
   - [ ] Start screen recording
   - [ ] Begin PostHog session recording
   - [ ] Note session date/time in tracking spreadsheet
   - [ ] Prepare stopwatch for timing tasks

3. **Materials Ready**
   - [ ] Real case files from lawyer's current work
   - [ ] PowerPoint templates for comparison
   - [ ] Feedback form printed/ready
   - [ ] Bug reporting template

---

## Week 1-2: Smoke Test

**Goal:** Can lawyer use basic features without breaking?

### Session Structure (30 minutes)

**Timing:**
- Setup: 5 minutes
- Tasks: 20 minutes
- Feedback: 5 minutes

### Tasks

1. **Installation Verification (5 min)**
   - [ ] Lawyer opens application
   - [ ] Canvas loads successfully
   - [ ] No console errors visible
   - [ ] PostHog tracking shows session start

2. **Manual Entity Creation (5 min)**
   ```
   Task: Create a simple holding company
   - Add 1 Delaware corporation (HoldCo)
   - Add 2 LLC subsidiaries
   - Connect with ownership lines
   - Label all entities
   ```

   **Success Criteria:**
   - [ ] All 3 entities created
   - [ ] Connections drawn
   - [ ] Labels readable
   - [ ] No crashes

   **Metrics to Track:**
   - Time to complete
   - Number of clicks
   - Any confusion points

3. **AI Generation Test (5 min)**
   ```
   Task: Generate a startup equity structure
   Prompt: "Delaware C-Corp with two founders (60/40 split)
           and Series A investor with 20%"
   ```

   **Success Criteria:**
   - [ ] Diagram generates in <5 seconds
   - [ ] Structure is logically correct
   - [ ] All entities properly labeled
   - [ ] Ownership percentages sum to 100%

   **Metrics to Track:**
   - Generation time
   - Number of entities created
   - Accuracy of structure
   - Any errors in JSON parsing

4. **Save/Load Test (5 min)**
   ```
   Task: Verify diagram persistence
   - Create or modify a diagram
   - Close application
   - Reopen application
   - Verify diagram restored
   ```

   **Success Criteria:**
   - [ ] Diagram automatically saves
   - [ ] No data loss on reload
   - [ ] All labels preserved
   - [ ] Positions maintained

### Week 1-2 Feedback Questions

**Usability:**
1. On a scale of 1-10, how intuitive was the interface?
2. What was the most confusing part?
3. Did anything break or behave unexpectedly?

**Speed:**
4. Did the application feel responsive?
5. How did generation speed meet your expectations?

**Blockers:**
6. What would prevent you from using this today?
7. Are there critical features missing?

**Comparison:**
8. How does this compare to your current PowerPoint workflow?
9. What does PowerPoint do better?
10. What does this tool do better?

### Success Criteria - Week 1-2

Must Achieve:
- [ ] Zero crashes during session
- [ ] Lawyer can create basic structure independently
- [ ] AI generation works 100% of attempts
- [ ] Save/load preserves all data
- [ ] Lawyer says "I could see using this"

Red Flags:
- [ ] Installation fails
- [ ] Multiple crashes
- [ ] AI generation fails >50% of time
- [ ] Data loss incidents
- [ ] Lawyer says "I'd never use this"

---

## Week 3-4: Speed Test

**Goal:** Are we hitting the <15 minute target?

### Session Structure (30 minutes)

**Timing:**
- Briefing: 3 minutes
- Timed Tasks: 22 minutes (2 diagrams)
- Feedback: 5 minutes

### Baseline Measurement

**Before Session:**
Lawyer creates same 2 structures in PowerPoint and times themselves:
1. Simple holding company (3 entities)
2. Complex startup equity (7+ entities)

Record PowerPoint baseline times.

### Timed Tasks

**Task 1: Simple Structure (Target: <5 minutes)**
```
Create a real estate holding structure:
- Property Holdings LLC (Texas)
- Management Company LLC (Texas)
- Commercial Building asset
- Show ownership and management relationships
```

**Timing Points:**
- Start: Click to begin
- Milestone 1: First entity created (target: <30s)
- Milestone 2: All entities created (target: <3 min)
- Milestone 3: Connections drawn (target: <4 min)
- End: Export PDF ready (target: <5 min)

**Success Criteria:**
- [ ] Completed in <5 minutes
- [ ] All entities correct
- [ ] Ownership relationships accurate
- [ ] Output is court-filing quality

**Task 2: Complex Structure (Target: <12 minutes)**
```
Create a real M&A structure from lawyer's recent case:
- Multi-tier holding company
- 5-7 operating entities
- Foreign entities if applicable
- Ownership percentages
- Compliance notes
```

**Timing Points:**
- Start: Click to begin
- Milestone 1: AI generation complete (target: <1 min)
- Milestone 2: First modification applied (target: <3 min)
- Milestone 3: Manual refinements done (target: <8 min)
- Milestone 4: Layout applied (target: <10 min)
- End: PDF exported (target: <12 min)

**Success Criteria:**
- [ ] Completed in <12 minutes
- [ ] Factually accurate structure
- [ ] Client-presentable quality
- [ ] All required details included

### Performance Tracking

Create a comparison table:

| Metric | PowerPoint | LawDraw | Improvement |
|--------|-----------|---------|-------------|
| Simple structure | [X] min | [Y] min | [Z]x faster |
| Complex structure | [X] min | [Y] min | [Z]x faster |
| Click count | [X] | [Y] | [Z]% reduction |
| Error corrections | [X] | [Y] | [Z]% reduction |

### Week 3-4 Feedback Questions

**Speed:**
1. Did you feel rushed or was the pace comfortable?
2. Where did you spend the most time?
3. What slowed you down unnecessarily?

**AI Assistance:**
4. How helpful was AI generation vs. manual creation?
5. Did AI generate what you expected?
6. How many iterations did you need?

**Quality:**
7. Is the output professional enough for clients?
8. What quality issues did you notice?
9. Would you feel confident filing this with a court?

**Workflow:**
10. How does this fit into your current process?
11. What integrations would make this seamless?

### Success Criteria - Week 3-4

Must Achieve:
- [ ] Simple structure: <5 minutes
- [ ] Complex structure: <15 minutes
- [ ] At least 5x faster than PowerPoint baseline
- [ ] Zero data loss
- [ ] Lawyer says "This is significantly faster"

Red Flags:
- [ ] Taking longer than PowerPoint
- [ ] Spending >50% time fixing AI errors
- [ ] Quality not acceptable for clients
- [ ] Lawyer frustrated with speed

---

## Week 5-6: Quality Test

**Goal:** Is output court-filing ready?

### Session Structure (30 minutes)

**Timing:**
- Create 3 production diagrams: 25 minutes
- Quality review: 5 minutes

### Production Diagram Tasks

**Diagram 1: Client Deliverable**
```
Create a diagram for an actual client matter (redacted):
- Use real structure from current case
- Include all relevant details
- Apply professional styling
- Export as PDF
```

**Quality Checklist:**
- [ ] All entity names accurate
- [ ] Jurisdictions specified
- [ ] Ownership percentages correct (sum to 100%)
- [ ] Professional appearance (no Comic Sans!)
- [ ] Appropriate detail level (not too much/little)
- [ ] Layout is clear and hierarchical
- [ ] PDF exports cleanly
- [ ] Text is readable when printed
- [ ] No typos or errors

**Diagram 2: Court Filing**
```
Create a diagram suitable for court submission:
- Multi-party structure
- Clear ownership chain
- Compliance notes included
- Court-appropriate formatting
```

**Quality Checklist:**
- [ ] Meets court formatting standards
- [ ] Professional black/white styling
- [ ] Clear labels (readable by judge)
- [ ] Proper legal terminology
- [ ] No unnecessary decorations
- [ ] Page size appropriate (legal/tabloid)
- [ ] Headers/footers if needed
- [ ] Citation-ready

**Diagram 3: Internal Analysis**
```
Create a working diagram for internal team review:
- Complex structure with notes
- Highlighting tax considerations
- Identifying potential issues
```

**Quality Checklist:**
- [ ] Team can understand without explanation
- [ ] Key issues highlighted
- [ ] Notes are clear and actionable
- [ ] Color coding makes sense
- [ ] Can be easily updated later
- [ ] Collaboration-ready format

### Comparative Analysis

Print all 3 diagrams and compare side-by-side with:
1. Lawyer's previous PowerPoint versions
2. Industry standard examples
3. Court filing examples

**Rate each on scale of 1-10:**
- Professional appearance
- Clarity of information
- Legal accuracy
- Court-filing suitability
- Client-presentable quality

### Week 5-6 Feedback Questions

**Quality:**
1. Would you submit these to a client without revision?
2. Would you file these with a court?
3. How do these compare to your best PowerPoint work?

**Practical Use:**
4. What's missing for production use?
5. What would you change about the visual style?
6. Are the legal conventions correct?

**Adoption:**
7. Would you use this for your next real case?
8. What would convince your partners to use this?
9. What would you pay for this tool?

**Final Assessment:**
10. Do you prefer this over PowerPoint? Why/why not?
11. What's the #1 reason you would/wouldn't use this?
12. Who else at your firm should try this?

### Success Criteria - Week 5-6

Must Achieve:
- [ ] All 3 diagrams are court-filing quality
- [ ] Lawyer prefers output over PowerPoint equivalents
- [ ] Zero critical quality issues
- [ ] Lawyer says "I would use this for real cases"
- [ ] Clear pricing signal (willingness to pay)

Red Flags:
- [ ] Output requires extensive post-processing
- [ ] Quality inferior to PowerPoint
- [ ] Critical legal errors in output
- [ ] Lawyer says "Not ready for production"

---

## Exit Gate Evaluation (End of Week 6)

### Quantitative Criteria

Must achieve ALL of the following:

1. **Speed Target**
   - [ ] Median time-to-completion < 12 minutes (PostHog data)
   - [ ] P90 time-to-completion < 15 minutes
   - [ ] At least 5x faster than PowerPoint baseline

2. **Reliability**
   - [ ] Zero data loss incidents across all sessions
   - [ ] AI generation success rate > 90%
   - [ ] Zero crashes in final 2 sessions

3. **Quality**
   - [ ] All 3 final diagrams rated 8+/10 by lawyer
   - [ ] Lawyer confirms court-filing suitability
   - [ ] No critical legal errors

4. **Adoption Signal**
   - [ ] Lawyer creates 3 real diagrams in <15 min each
   - [ ] Lawyer explicitly prefers this over PowerPoint
   - [ ] Lawyer provides pricing feedback
   - [ ] Lawyer willing to introduce to colleagues

### Qualitative Assessment

**SUS (System Usability Scale) Score:**
Administer standard SUS questionnaire. Target: >70 (above average)

Questions (1-5 scale):
1. I think I would like to use this system frequently
2. I found the system unnecessarily complex
3. I thought the system was easy to use
4. I think I would need support to use this system
5. I found the various functions were well integrated
6. I thought there was too much inconsistency
7. I would imagine most people would learn this quickly
8. I found the system very cumbersome to use
9. I felt very confident using the system
10. I needed to learn a lot before I could get going

**Calculate SUS Score:**
- Odd questions: (score - 1)
- Even questions: (5 - score)
- Sum all, multiply by 2.5
- Result: 0-100 scale

### Decision Matrix

| Criteria | Weight | Score (1-10) | Weighted Score |
|----------|--------|--------------|----------------|
| Speed (<15 min) | 30% | | |
| Quality (court-ready) | 25% | | |
| Reliability (no data loss) | 20% | | |
| Usability (SUS >70) | 15% | | |
| Adoption intent | 10% | | |
| **Total** | **100%** | | |

**Go/No-Go Decision:**
- Total weighted score ≥ 80: **PROCEED** to expanded beta
- Total weighted score 60-79: **ITERATE** for 2 more weeks
- Total weighted score < 60: **PIVOT** or major redesign

---

## Tracking Spreadsheet Template

Create Google Sheet with tabs:

### Tab 1: Session Log
| Session | Date | Duration | Tasks Completed | Crashes | Data Loss | Notes |
|---------|------|----------|-----------------|---------|-----------|-------|
| Week 1 | | | | | | |
| Week 2 | | | | | | |
| ... | | | | | | |

### Tab 2: Performance Metrics
| Metric | Week 1 | Week 2 | Week 3 | Week 4 | Week 5 | Week 6 |
|--------|--------|--------|--------|--------|--------|--------|
| Time to create simple diagram | | | | | | |
| Time to create complex diagram | | | | | | |
| AI generation success rate | | | | | | |
| Number of bugs found | | | | | | |
| SUS score | | | | | | |

### Tab 3: Feature Requests
| Feature | Priority | Requested When | Rationale | Status |
|---------|----------|----------------|-----------|--------|
| | | | | |

### Tab 4: Bug Log
| Bug ID | Severity | Description | Reproduction Steps | Status | Fixed In |
|--------|----------|-------------|-------------------|--------|----------|
| | | | | | |

### Tab 5: Competitive Comparison
| Feature | PowerPoint | LawDraw | Winner | Notes |
|---------|-----------|---------|--------|-------|
| Time to create | X min | Y min | | |
| Quality | 1-10 | 1-10 | | |
| Ease of use | 1-10 | 1-10 | | |
| ... | | | | |

---

## PostHog Dashboard Setup

### Key Events to Track

**Session Events:**
- `uat_session_start` - When lawyer begins session
- `uat_session_end` - When lawyer ends session
- `uat_task_start` - When specific task begins
- `uat_task_complete` - When task completes

**Performance Events:**
- `diagram_time_to_first_entity` - Speed metric
- `diagram_time_to_complete` - End-to-end metric
- `ai_generation_duration` - AI performance
- `layout_execution_duration` - Layout performance

**Quality Events:**
- `export_pdf` - Track exports
- `validation_error` - Track errors caught
- `user_correction` - Track manual fixes

**Feedback Events:**
- `uat_feedback_submitted` - Feedback form completion
- `sus_score_submitted` - SUS questionnaire completion
- `feature_requested` - Feature requests
- `bug_reported` - Bug reports

### Dashboard Views

**View 1: Speed Metrics**
- Line chart: Time-to-completion over 6 weeks
- Bar chart: PowerPoint vs LawDraw comparison
- Gauge: Current vs target (<15 min)

**View 2: Reliability**
- Count: Crashes per session
- Count: Data loss incidents
- Percentage: AI success rate

**View 3: Usage Patterns**
- Funnel: Session flow
- Heatmap: Feature usage
- Timeline: Task completion order

**View 4: Quality Indicators**
- Count: Manual corrections made
- Count: Validation errors
- Distribution: SUS scores

---

## Sample Feedback Form

### Post-Session Feedback Form

**Session:** Week [X]
**Date:** [Date]
**Participant:** [Lawyer Name]

**Speed (1-5 scale, 5 = excellent):**
- How fast did the application feel? ___
- Did you experience any lag or slowness? Y/N
- Where did you spend the most time? ________________

**Usability (1-5 scale, 5 = excellent):**
- How easy was it to create a diagram? ___
- How intuitive was the interface? ___
- Did anything confuse you? ________________

**Quality (1-5 scale, 5 = excellent):**
- How professional is the output? ___
- Would you show this to a client? Y/N
- Would you file this with a court? Y/N

**AI Performance (1-5 scale, 5 = excellent):**
- How accurate was AI generation? ___
- How helpful was the AI assistant? ___
- How many iterations did you need? ___

**Overall:**
- Would you use this for a real case today? Y/N
- What's the #1 thing that would make this better? ________________
- What's the #1 thing you loved? ________________
- What's the #1 thing you hated? ________________

**Pricing Signal:**
- Would you pay for this tool? Y/N
- How much per month would be reasonable? $___
- Would your firm pay? Y/N

**Open Feedback:**
[Free text area]

---

## Risk Mitigation

### Common Issues and Solutions

**Issue:** Lawyer can't install application
- Solution: Pre-install before session, have backup browser version

**Issue:** AI generation fails during demo
- Solution: Have pre-generated examples ready, explain it's beta

**Issue:** Lawyer unfamiliar with keyboard shortcuts
- Solution: Provide one-page cheat sheet, emphasize mouse-only workflow

**Issue:** Session runs over 30 minutes
- Solution: Skip less critical tasks, schedule follow-up

**Issue:** Lawyer too busy for weekly sessions
- Solution: Offer flexible scheduling, async video walkthroughs

**Issue:** Technical difficulties during screen recording
- Solution: Have backup recording method, take detailed notes

---

## Final Deliverable

### Week 6 Summary Report

**Executive Summary**
- Did we hit exit criteria? Y/N
- Key achievements
- Critical gaps
- Recommendation: Go/No-Go/Iterate

**Quantitative Results**
- Speed metrics (table)
- Quality scores (table)
- Reliability stats (table)
- SUS score: ___/100

**Qualitative Insights**
- What worked well
- What needs improvement
- Unexpected findings
- Lawyer quotes (with permission)

**Comparison Analysis**
- LawDraw vs PowerPoint (table)
- Time savings achieved
- Quality differential
- Usability comparison

**Next Steps**
- Priority fixes (P0, P1, P2)
- Feature roadmap
- Expanded beta plan
- Production readiness timeline

**Appendix**
- Full session notes
- PostHog screenshots
- Screen recording links
- Feedback forms

---

**Protocol Version:** 1.0
**Last Updated:** 2025-11-09
**Owner:** Product/Engineering Team
