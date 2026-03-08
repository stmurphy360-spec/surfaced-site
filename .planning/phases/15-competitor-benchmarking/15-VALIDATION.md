---
phase: 15
slug: competitor-benchmarking
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x (uv-managed) |
| **Config file** | `pyproject.toml` → `[tool.pytest.ini_options]` |
| **Quick run command** | `cd /Users/smurph/llm-visibility-tracker && uv run pytest tests/test_reporter.py -x -q` |
| **Full suite command** | `cd /Users/smurph/llm-visibility-tracker && uv run pytest tests/ -x -q` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd /Users/smurph/llm-visibility-tracker && uv run pytest tests/test_reporter.py -x -q`
- **After every plan wave:** Run `cd /Users/smurph/llm-visibility-tracker && uv run pytest tests/ -x -q`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 0 | RPT-02/03/04 | unit | `uv run pytest tests/test_reporter.py::test_share_of_voice tests/test_reporter.py::test_rank_comparison tests/test_reporter.py::test_co_mention_rate tests/test_reporter.py::test_competitor_section_html tests/test_reporter.py::test_competitor_csvs -x -q` | ❌ W0 | ⬜ pending |
| 15-01-02 | 01 | 0 | RPT-02/03/04 | unit | `uv run pytest tests/test_reporter.py::test_csv_export tests/test_reporter.py::test_execute_report_integration -x -q` | ✅ (needs update) | ⬜ pending |
| 15-02-01 | 02 | 1 | RPT-02 | unit | `uv run pytest tests/test_reporter.py::test_share_of_voice -x -q` | ❌ W0 | ⬜ pending |
| 15-02-02 | 02 | 1 | RPT-03 | unit | `uv run pytest tests/test_reporter.py::test_rank_comparison -x -q` | ❌ W0 | ⬜ pending |
| 15-02-03 | 02 | 1 | RPT-04 | unit | `uv run pytest tests/test_reporter.py::test_co_mention_rate -x -q` | ❌ W0 | ⬜ pending |
| 15-03-01 | 03 | 2 | RPT-02/03/04 | unit | `uv run pytest tests/test_reporter.py::test_competitor_section_html tests/test_reporter.py::test_competitor_csvs -x -q` | ❌ W0 | ⬜ pending |
| 15-04-01 | 04 | 3 | RPT-02/03/04 | unit | `uv run pytest tests/test_reporter.py -x -q` | ✅ (existing) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/test_reporter.py::test_share_of_voice` — stubs for RPT-02 compute function
- [ ] `tests/test_reporter.py::test_rank_comparison` — stubs for RPT-03 compute function
- [ ] `tests/test_reporter.py::test_co_mention_rate` — stubs for RPT-04 compute function
- [ ] `tests/test_reporter.py::test_competitor_section_html` — stubs for HTML rendering + N/A cells
- [ ] `tests/test_reporter.py::test_competitor_csvs` — stubs for 3 new CSV files

Existing tests requiring updates (not new — modify existing assertions):
- `test_csv_export`: update unpacking for new 5-tuple return from `write_csvs()`
- `test_execute_report_integration`: add assertions for 3 new CSV files

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Report section visually renders correctly in browser | RPT-02/03/04 | HTML visual layout not covered by unit tests | Open generated HTML report in browser, verify h2 "Competitor Benchmarking" and h3 subsections appear after existing JGW tables |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
