# Phase 15: Competitor Benchmarking - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a "Competitor Benchmarking" section to the HTML report (and corresponding CSVs) showing share of voice, rank comparison, and co-mention rate for each configured competitor vs. JGW. Uses competitor data already captured in ExtractionRecord.competitor_mentions — no changes to the extraction pipeline or data model. Changes are confined to reporter.py (new compute functions + render_html + write_csvs) and no other files.

</domain>

<decisions>
## Implementation Decisions

### Report Layout
- New section appears **after** all existing JGW tables (Visibility Rate, Rank Distribution, Ideal Content Rate)
- Section opened with an **h2 heading: "Competitor Benchmarking"**
- 3 subsections under it, each as an **h3 heading with its own table**:
  1. Share of Voice
  2. Rank Comparison
  3. Co-Mention Rate
- All 3 metrics also exported to **CSV** (3 new files added to the download bundle alongside visibility.csv and ideal_content.csv)

### Share of Voice Table
- **Metric**: % of responses mentioning each brand, per product line x intent
- **Structure**: Wide format — rows are `(product_line, intent)` pairs; columns are JGW + each configured competitor
- **Intent split**: Yes — rows show Branded and Non-Branded separately (same split as Visibility Rate)
- **Multi-product-line competitors**: All competitors appear as columns across the full table; cells are N/A where a competitor is not configured for that product line
- **Denominator**: All responses for that product line x intent segment

### Rank Comparison Table
- **Metric**: Average rank position per brand, per product line (among responses where THAT brand was mentioned)
- **Structure**: Rows are product lines; columns are JGW avg rank + one column per competitor avg rank
- **Scope**: Average computed only from responses where that specific brand was mentioned (not all responses)
- **No intent split** — collapsed to overall per product line

### Co-Mention Rate Table
- **Metric**: % of responses (for that product line x intent) where BOTH JGW AND the competitor appear together
- **Denominator**: All responses for that product line x intent (not just JGW-mentioning)
- **Structure**: Wide format — rows are `(product_line, intent)` pairs; columns are one per competitor
- **Intent split**: Yes — Branded and Non-Branded shown separately
- **Non-applicable cells**: N/A where competitor is not configured for that product line

### Labels
- All new column headers and section headings follow Phase 14 label patterns (COLUMN_LABELS dict, h3 headings in sentence case matching existing style)
- Product line values use same `product_line_labels` lookup from settings.yaml
- Intent values use same INTENT_LABELS ("Branded" / "Non-Branded")
- Competitor name columns use the display name exactly as written in competitors.yaml (already human-readable: "Peachtree Financial", "Freedom Debt Relief", etc.)

### Claude's Discretion
- Exact column name for JGW in wide tables (e.g. "JGW" vs. "JG Wentworth")
- How N/A is rendered (pandas na_rep="—" already in use — extend to competitor columns)
- Whether to sort competitors alphabetically or by config order in column headers
- CSV filenames for the 3 new exports

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ExtractionRecord.competitor_mentions: list[str]` — already populated per response; contains exact display names from competitors.yaml (e.g. "Peachtree Financial")
- `extractor.load_competitors()` — loads competitors.yaml; returns `{"product_lines": {"structured_settlements": {"competitors": [...]}, ...}}`
- `reporter._merge_segment_labels()` — existing helper that joins extractions to product_line/intent from responses; reuse for new compute functions
- `reporter.compute_visibility()` — pattern for groupby aggregation with zero-fill; adapt for share-of-voice
- `reporter.write_csvs()` — extend to accept and write 3 additional DataFrames
- `reporter.render_html()` — extend to accept and render 3 additional DataFrames with h2/h3 structure
- `COLUMN_LABELS`, `INTENT_LABELS` dicts from Phase 14 — apply same pattern to new column names

### Established Patterns
- Display copy pattern: `vis_display = visibility_df.copy()` → apply labels → `to_html()` — repeat for each new DataFrame
- `na_rep="—"` in all `to_html()` calls — competitor N/A cells follow same convention
- All DataFrames passed as parameters into `render_html()` and `write_csvs()` — add 3 new params

### Integration Points
- `reporter.execute_report()`: load competitors config here, compute 3 new DataFrames, pass into `render_html()` and `write_csvs()`
- `config/competitors.yaml`: source of competitor lists by product_line — read once in execute_report, thread to compute functions
- New compute functions: `compute_share_of_voice()`, `compute_rank_comparison()`, `compute_co_mention_rate()` — all in reporter.py, same module as existing compute_* functions

</code_context>

<specifics>
## Specific Ideas

- Wide format (columns per competitor) makes all 3 tables easy to scan side-by-side — consistent choice across share of voice, rank comparison, and co-mention
- Intent split on share of voice and co-mention (not rank comparison) — intentional asymmetry: rank is less meaningful split by intent

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-competitor-benchmarking*
*Context gathered: 2026-03-08*
