---
phase: 15-competitor-benchmarking
plan: "02"
subsystem: reporting
tags: [pandas, dataframe, competitor-benchmarking, share-of-voice, rank-comparison, co-mention]

# Dependency graph
requires:
  - phase: 15-01
    provides: "Wave 0 RED test stubs for compute_share_of_voice, compute_rank_comparison, compute_co_mention_rate"
provides:
  - "compute_share_of_voice() — wide DataFrame of JGW + competitor mention % by product_line x intent"
  - "compute_rank_comparison() — wide DataFrame of avg JGW rank by product_line (no intent split)"
  - "compute_co_mention_rate() — wide DataFrame of co-occurrence % by product_line x intent"
  - "_all_competitors() and _comp_in_mentions() private helpers"
  - "write_csvs() extended to accept and write 3 competitor CSVs (returns 5-tuple)"
affects: [15-03, 15-04, 16-ai-run-summary]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Wide DataFrame pivot pattern: build per-competitor records list, pivot_table, set columns.name=None, ensure all competitor columns present"
    - "NaN masking pass: iterate pl_config after join/merge, set non-configured (product_line, competitor) cells to NaN"
    - "Safe competitor access via _comp_in_mentions() handles None/NaN/non-list without TypeError"

key-files:
  created: []
  modified:
    - /Users/smurph/llm-visibility-tracker/src/reporter.py

key-decisions:
  - "All three compute functions call _merge_segment_labels() as first step, following established compute_* pattern"
  - "NaN masking applied as a post-merge correction pass — cleaner than pre-filtering"
  - "write_csvs() returns 2-tuple when no competitor DataFrames provided, 5-tuple when all three provided — backward compatible"
  - "compute_rank_comparison() data model note in docstring: competitor column = JGW rank in co-mention responses, not competitor's own rank (ExtractionRecord has no competitor_rank field)"

patterns-established:
  - "Pattern: _all_competitors(competitors_config) deduplicated union of all competitors across product_lines, preserving config order"
  - "Pattern: _comp_in_mentions(mentions, comp_name) safe boolean check for competitor presence in any mention field"

requirements-completed: [RPT-02, RPT-03, RPT-04]

# Metrics
duration: 8min
completed: 2026-03-08
---

# Phase 15 Plan 02: Competitor Benchmarking Compute Functions Summary

**Three competitor benchmarking compute functions (share of voice, rank comparison, co-mention rate) implemented in reporter.py using wide DataFrame pivot pattern with NaN masking for non-configured product_line/competitor pairs.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-08T21:40:00Z
- **Completed:** 2026-03-08T21:48:22Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- `compute_share_of_voice()`: JGW + all-competitor mention % by product_line x intent, NaN for non-configured pairs
- `compute_rank_comparison()`: avg JGW rank by product_line (no intent split), per-competitor column = JGW rank in co-mention responses
- `compute_co_mention_rate()`: JGW+competitor co-occurrence % by product_line x intent, no JGW column
- `_all_competitors()` and `_comp_in_mentions()` helpers extracted for reuse
- `write_csvs()` extended to optionally write share_of_voice.csv, rank_comparison.csv, co_mention_rate.csv (5-tuple return)

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement compute_share_of_voice()** - `45622ce` (feat) — also includes Task 2 functions and write_csvs extension
2. **Task 2: Implement compute_rank_comparison() and compute_co_mention_rate()** — included in `45622ce`

**Plan metadata:** (pending final commit)

_Note: Both TDD tasks were implemented in a single atomic file edit and committed together since they operate on the same file._

## Files Created/Modified
- `/Users/smurph/llm-visibility-tracker/src/reporter.py` — Added _all_competitors(), _comp_in_mentions(), compute_share_of_voice(), compute_rank_comparison(), compute_co_mention_rate(); extended write_csvs() with optional competitor DataFrame parameters and 5-tuple return

## Decisions Made
- NaN masking applied as a post-merge correction pass rather than pre-filtering records — simpler and more robust for the wide pivot pattern
- `write_csvs()` extended with keyword-only optional parameters to remain backward compatible with existing call sites
- `compute_rank_comparison()` docstring explicitly notes data model constraint: no competitor_rank field exists, competitor columns show JGW's rank in co-mention responses only

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

`test_execute_report_integration` and `test_competitor_section_html` remain failing — pre-existing RED state from Plan 01. Both require Plan 03 (HTML render + execute_report wiring) per plan verification section. 14 tests pass as expected.

## Next Phase Readiness
- All three compute functions importable and tested GREEN
- Plan 03 can wire `execute_report()` to call the new functions and pass competitor DataFrames to `write_csvs()` and `render_html()`
- `render_html()` still needs `share_of_voice_df`, `rank_comparison_df`, `co_mention_rate_df` keyword params added (Plan 03 task)

---
*Phase: 15-competitor-benchmarking*
*Completed: 2026-03-08*
