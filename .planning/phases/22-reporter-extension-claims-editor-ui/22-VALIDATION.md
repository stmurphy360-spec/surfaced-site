---
phase: 22
slug: reporter-extension-claims-editor-ui
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 22 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 7.x |
| **Config file** | pyproject.toml |
| **Quick run command** | `cd /Users/smurph/surfaced-site && python -m pytest tests/ -x -q 2>&1 | tail -20` |
| **Full suite command** | `cd /Users/smurph/surfaced-site && python -m pytest tests/ -v 2>&1 | tail -40` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd /Users/smurph/surfaced-site && python -m pytest tests/ -x -q 2>&1 | tail -20`
- **After every plan wave:** Run `cd /Users/smurph/surfaced-site && python -m pytest tests/ -v 2>&1 | tail -40`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 22-01-01 | 01 | 1 | SENT-03 | unit | `pytest tests/test_reporter.py::test_sentiment_section -xq` | ❌ W0 | ⬜ pending |
| 22-01-02 | 01 | 1 | SENT-03 | unit | `pytest tests/test_reporter.py::test_no_claims_message -xq` | ❌ W0 | ⬜ pending |
| 22-02-01 | 02 | 1 | MSGN-01 | unit | `pytest tests/test_reporter.py::test_messaging_alignment_section -xq` | ❌ W0 | ⬜ pending |
| 22-02-02 | 02 | 1 | MSGN-01 | unit | `pytest tests/test_reporter.py::test_no_claims_configured -xq` | ❌ W0 | ⬜ pending |
| 22-03-01 | 03 | 2 | MSGN-05 | unit | `pytest tests/test_api.py::test_config_get_includes_claims -xq` | ❌ W0 | ⬜ pending |
| 22-03-02 | 03 | 2 | MSGN-05 | unit | `pytest tests/test_api.py::test_config_post_saves_claims -xq` | ❌ W0 | ⬜ pending |
| 22-04-01 | 04 | 2 | MSGN-06 | manual | See manual verifications | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/test_reporter.py` — stubs for SENT-03, MSGN-01 (sentiment section, messaging alignment section, no-claims handling)
- [ ] `tests/test_api.py` — stubs for MSGN-05 (GET/POST config includes claims)

*Existing test infrastructure (pytest) detected — only new test files needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Claims editor UI — add/remove claims per product line | MSGN-06 | Browser UI interaction required | Open ConfigPanel, add a claim, save, verify persisted in web_config.json, re-run analysis and confirm claim appears in report |
| Claims saved from UI are used in next run | MSGN-06 | Requires full run cycle | Add claim via UI, trigger run, verify claim appears in HTML report messaging alignment section |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
