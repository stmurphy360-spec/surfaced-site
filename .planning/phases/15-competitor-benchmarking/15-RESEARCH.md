# Phase 15: Competitor Benchmarking - Research

**Researched:** 2026-03-08
**Domain:** Python / pandas DataFrame aggregation, wide-format pivoting, HTML report extension
**Confidence:** HIGH

## Summary

Phase 15 extends `src/reporter.py` with three new compute functions and corresponding rendering/export logic. All data needed for the three metrics already exists on disk in `ExtractionRecord.competitor_mentions` — no pipeline changes, no schema changes, no new dependencies. The work is confined to a single file plus the addition of three CSV files to the download bundle.

The two primary analytical challenges are: (1) building wide-format DataFrames where competitors become columns rather than rows, and (2) handling the "applicable competitor" problem — not every competitor appears in every product line, so cells for non-configured competitor/product-line combinations must be rendered as `—` (the `na_rep` value already in use). The existing display-copy transform pipeline from Phase 14 (`COLUMN_LABELS`, `INTENT_LABELS`, `product_line_labels`, `na_rep="—"`) applies unchanged to all three new DataFrames.

The `execute_report()` function is the single integration point: it loads competitors config once, calls three new `compute_*` functions, and threads results into extended `render_html()` and `write_csvs()` signatures. Adding parameters to those two functions is the only breaking change — tests must be updated to pass the new parameters (or provide defaults).

**Primary recommendation:** Implement `compute_share_of_voice()`, `compute_rank_comparison()`, and `compute_co_mention_rate()` following the groupby-then-pivot pattern used in `compute_visibility()`. Load `config/competitors.yaml` once at the top of `execute_report()` via `extractor.load_competitors()` and thread the result into all compute functions.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Report Layout**
- New section appears after all existing JGW tables (Visibility Rate, Rank Distribution, Ideal Content Rate)
- Section opened with an h2 heading: "Competitor Benchmarking"
- 3 subsections under it, each as an h3 heading with its own table:
  1. Share of Voice
  2. Rank Comparison
  3. Co-Mention Rate
- All 3 metrics also exported to CSV (3 new files added to the download bundle alongside visibility.csv and ideal_content.csv)

**Share of Voice Table**
- Metric: % of responses mentioning each brand, per product line x intent
- Structure: Wide format — rows are `(product_line, intent)` pairs; columns are JGW + each configured competitor
- Intent split: Yes — rows show Branded and Non-Branded separately (same split as Visibility Rate)
- Multi-product-line competitors: All competitors appear as columns across the full table; cells are N/A where a competitor is not configured for that product line
- Denominator: All responses for that product line x intent segment

**Rank Comparison Table**
- Metric: Average rank position per brand, per product line (among responses where THAT brand was mentioned)
- Structure: Rows are product lines; columns are JGW avg rank + one column per competitor avg rank
- Scope: Average computed only from responses where that specific brand was mentioned (not all responses)
- No intent split — collapsed to overall per product line

**Co-Mention Rate Table**
- Metric: % of responses (for that product line x intent) where BOTH JGW AND the competitor appear together
- Denominator: All responses for that product line x intent (not just JGW-mentioning)
- Structure: Wide format — rows are `(product_line, intent)` pairs; columns are one per competitor
- Intent split: Yes — Branded and Non-Branded shown separately
- Non-applicable cells: N/A where competitor is not configured for that product line

**Labels**
- All new column headers and section headings follow Phase 14 label patterns (COLUMN_LABELS dict, h3 headings in sentence case matching existing style)
- Product line values use same `product_line_labels` lookup from settings.yaml
- Intent values use same INTENT_LABELS ("Branded" / "Non-Branded")
- Competitor name columns use the display name exactly as written in competitors.yaml (already human-readable: "Peachtree Financial", "Freedom Debt Relief", etc.)

### Claude's Discretion
- Exact column name for JGW in wide tables (e.g. "JGW" vs. "JG Wentworth")
- How N/A is rendered (pandas na_rep="—" already in use — extend to competitor columns)
- Whether to sort competitors alphabetically or by config order in column headers
- CSV filenames for the 3 new exports

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RPT-02 | Report includes a competitor share-of-voice section showing % of responses mentioning JGW vs. each competitor per product line | `compute_share_of_voice()` groupby pattern; wide pivot with NaN for non-configured competitors; display-copy transform with na_rep="—" |
| RPT-03 | Report includes a competitor rank comparison showing where competitors appear (1st, 2nd, 3rd) relative to JGW across the same responses | `compute_rank_comparison()` conditional-mean pattern; wide pivot on competitor names; no intent split; avg rank among mentioning-only responses |
| RPT-04 | Report includes a co-mention rate showing how often JGW and each competitor appear in the same response | `compute_co_mention_rate()` boolean intersection pattern; wide pivot; denominator = all responses for segment (not just JGW-mentioning) |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pandas | >=2.2 (already installed) | groupby, pivot, wide-format DataFrame construction | Already project dependency; `pivot_table` and `reindex` handle wide format and N/A fill in one call |
| pyyaml | >=6.0 (already installed) | Load competitors.yaml | Already used by `extractor.load_competitors()` — no new loading code needed |

No new dependencies. This phase adds zero packages.

### Existing Project Functions to Reuse
| Function | Location | Reuse Pattern |
|----------|----------|---------------|
| `load_competitors()` | `src/extractor.py` | Call once in `execute_report()`, pass result dict to all compute functions |
| `_merge_segment_labels()` | `src/reporter.py` | Call at the top of each new compute function — identical to existing pattern |
| `COLUMN_LABELS` | `src/reporter.py` module level | Extend with any new internal column names; not needed for competitor name columns (already display-ready) |
| `INTENT_LABELS` | `src/reporter.py` module level | Apply to display copies of share-of-voice and co-mention DataFrames |
| `na_rep="—"` | `render_html()` in `reporter.py` | Pass same kwarg in `to_html()` calls for new tables |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `pivot_table` for wide format | Manual column-per-competitor loop | pivot_table handles missing cells as NaN automatically; loop is more verbose and error-prone |
| `extractor.load_competitors()` | Re-reading YAML inline in reporter.py | load_competitors already tested and anchored to correct path; no reason to duplicate |

**Installation:**
```bash
# No new packages required
```

## Architecture Patterns

### Recommended Project Structure
No new files. All additions are in `src/reporter.py`.

```
src/reporter.py
├── compute_share_of_voice()    # NEW — RPT-02
├── compute_rank_comparison()   # NEW — RPT-03
├── compute_co_mention_rate()   # NEW — RPT-04
├── write_csvs()                # EXTEND — 3 new DataFrame params + 3 new paths
├── render_html()               # EXTEND — 3 new DataFrame params + h2/h3 block
└── execute_report()            # EXTEND — load competitors, call 3 new computes
```

### Pattern 1: Wide-Format DataFrame via pivot_table (Share of Voice and Co-Mention)

**What:** Convert a long-format grouped DataFrame into wide format where competitors become columns.
**When to use:** Any metric requiring side-by-side competitor columns with NaN for non-applicable cells.

```python
# Source: pandas 2.2 docs — DataFrame.pivot_table
# Step 1: groupby to compute per (product_line, intent, competitor_name) values
# Step 2: pivot_table to make competitor_name the columns

def compute_share_of_voice(
    extractions: list[dict],
    responses: list[dict],
    competitors_config: dict,
) -> pd.DataFrame:
    """
    Returns wide DataFrame with rows=(product_line, intent) and
    columns = ["JGW"] + [all configured competitors, union across product lines].
    NaN where competitor is not configured for that product line.
    """
    merged = _merge_segment_labels(extractions, responses)
    if merged.empty:
        return pd.DataFrame()

    total_per_segment = (
        merged.groupby(["product_line", "intent"])
        .size()
        .reset_index(name="total")
    )

    # Collect all competitor names (union across all product lines)
    all_competitors = []
    for pl_data in competitors_config["product_lines"].values():
        all_competitors.extend(pl_data.get("competitors", []))
    all_competitors = list(dict.fromkeys(all_competitors))  # deduplicate, preserve order

    # Build JGW column: jgw_mentioned / total per (product_line, intent)
    jgw_rate = (
        merged.groupby(["product_line", "intent"])["jgw_mentioned"]
        .mean()
        .mul(100).round(1)
        .reset_index(name="JGW")
    )

    # Build competitor columns
    # Explode competitor_mentions to get one row per (prompt_id, model_id, competitor)
    # Then count distinct (prompt_id, model_id) pairs per (product_line, intent, competitor)
    records = []
    for _, row in merged.iterrows():
        pl = row["product_line"]
        intent = row["intent"]
        pl_competitors = competitors_config["product_lines"].get(pl, {}).get("competitors", [])
        for comp in pl_competitors:
            mentioned = comp in (row["competitor_mentions"] or [])
            records.append({
                "product_line": pl,
                "intent": intent,
                "competitor": comp,
                "mentioned": int(mentioned),
            })

    if records:
        comp_df = pd.DataFrame(records)
        comp_rate = (
            comp_df.groupby(["product_line", "intent", "competitor"])["mentioned"]
            .mean()
            .mul(100).round(1)
            .reset_index(name="rate")
        )
        # Pivot: rows = (product_line, intent), columns = competitor name
        comp_wide = comp_rate.pivot_table(
            index=["product_line", "intent"],
            columns="competitor",
            values="rate",
        ).reset_index()
        comp_wide.columns.name = None

        # Ensure all competitors appear as columns (even if not in data)
        for comp in all_competitors:
            if comp not in comp_wide.columns:
                comp_wide[comp] = float("nan")

        # Merge JGW column
        result = jgw_rate.merge(comp_wide, on=["product_line", "intent"], how="outer")
    else:
        result = jgw_rate.copy()
        for comp in all_competitors:
            result[comp] = float("nan")

    return result
```

### Pattern 2: Conditional-Mean for Rank Comparison (no intent split)

**What:** For each brand, compute average rank position only from rows where that brand was mentioned.
**When to use:** Metrics where the denominator varies by column (only mentioning responses).

```python
# Source: pandas 2.2 docs — direct code inspection of compute_rank_distribution() pattern
def compute_rank_comparison(
    extractions: list[dict],
    responses: list[dict],
    competitors_config: dict,
) -> pd.DataFrame:
    """
    Returns wide DataFrame with rows=product_line, columns=["JGW"] + competitors.
    Average rank computed among responses where THAT brand was mentioned.
    No intent split.
    """
    merged = _merge_segment_labels(extractions, responses)
    if merged.empty:
        return pd.DataFrame()

    # JGW avg rank: only from jgw_mentioned=True rows
    jgw_rank = (
        merged[merged["jgw_mentioned"] == True]
        .groupby("product_line")["jgw_rank"]
        .mean()
        .round(1)
        .reset_index(name="JGW")
    )

    # Competitor avg rank: need rank data per competitor
    # ExtractionRecord has competitor_mentions (list[str]) but NOT competitor rank
    # competitor rank is NOT in the data model — this is the key constraint
    # The CONTEXT.md definition says: "average rank position per brand, per product line
    # (among responses where THAT brand was mentioned)"
    # For competitors, jgw_rank is the JGW rank in that response, not the competitor rank.
    # The only available data is: was competitor mentioned? jgw_rank is JGW-specific.
    # Competitors do NOT have individual rank fields in ExtractionRecord.
    #
    # Resolution: Use jgw_rank value from responses where JGW AND the competitor are
    # both present — this gives "JGW rank in co-mention responses" not "competitor's rank".
    # Per CONTEXT.md: "showing where JGW and each competitor appear (1st, 2nd, 3rd)
    # across the same responses" — meaning JGW's rank within those co-mention responses.
    # This interpretation is consistent with the available data model.

    all_competitors = []
    for pl_data in competitors_config["product_lines"].values():
        all_competitors.extend(pl_data.get("competitors", []))
    all_competitors = list(dict.fromkeys(all_competitors))

    result = jgw_rank.copy()
    for comp in all_competitors:
        # For each product_line, avg rank in responses where this competitor is mentioned
        comp_rows = merged[merged["competitor_mentions"].apply(
            lambda lst: comp in (lst or [])
        )]
        if not comp_rows.empty:
            comp_rank = (
                comp_rows.groupby("product_line")["jgw_rank"]
                .mean()
                .round(1)
                .reset_index(name=comp)
            )
            result = result.merge(comp_rank, on="product_line", how="left")
        else:
            result[comp] = float("nan")

    return result
```

**Important note on rank data:** `ExtractionRecord` stores `jgw_rank: int | None` (JGW's rank position) and `competitor_mentions: list[str]` (names of competitors present). There is NO `competitor_rank` field. The Rank Comparison table will show JGW's average rank position in responses where a given competitor was mentioned — not the competitor's own rank. This is the only interpretation consistent with the data model. The planner should document this assumption clearly.

### Pattern 3: Co-Mention Rate (Boolean Intersection)

**What:** % of responses where BOTH JGW and a given competitor appear together.
**When to use:** Overlap/co-occurrence metric with all-responses denominator.

```python
# Source: direct code inspection — standard pandas boolean mask + groupby mean
def compute_co_mention_rate(
    extractions: list[dict],
    responses: list[dict],
    competitors_config: dict,
) -> pd.DataFrame:
    """
    Returns wide DataFrame with rows=(product_line, intent), columns=competitors.
    JGW NOT a column — this metric is about co-occurrence, not JGW solo presence.
    """
    merged = _merge_segment_labels(extractions, responses)
    if merged.empty:
        return pd.DataFrame()

    all_competitors = []
    for pl_data in competitors_config["product_lines"].values():
        all_competitors.extend(pl_data.get("competitors", []))
    all_competitors = list(dict.fromkeys(all_competitors))

    result = merged[["product_line", "intent"]].drop_duplicates()

    for comp in all_competitors:
        # co_mention = jgw_mentioned AND competitor is in competitor_mentions
        co_mention_col = merged["jgw_mentioned"] & merged["competitor_mentions"].apply(
            lambda lst: comp in (lst or [])
        )
        rate = (
            merged.assign(co_mention=co_mention_col.astype(int))
            .groupby(["product_line", "intent"])["co_mention"]
            .mean()
            .mul(100).round(1)
            .reset_index(name=comp)
        )
        result = result.merge(rate, on=["product_line", "intent"], how="left")

    # Mark non-configured competitor/product_line cells as NaN
    for pl, pl_data in competitors_config["product_lines"].items():
        pl_competitors = pl_data.get("competitors", [])
        for comp in all_competitors:
            if comp not in pl_competitors:
                mask = result["product_line"] == pl
                result.loc[mask, comp] = float("nan")

    return result
```

### Pattern 4: Extending write_csvs() and render_html()

**What:** Add 3 new DataFrame parameters and write/render 3 new outputs.
**When to use:** Every time a new metric is added to the report.

```python
# Updated signatures (extend, don't replace)
def write_csvs(
    run_id: str,
    visibility_df: pd.DataFrame,
    ideal_df: pd.DataFrame,
    product_line_labels: dict | None = None,
    share_of_voice_df: pd.DataFrame | None = None,
    rank_comparison_df: pd.DataFrame | None = None,
    co_mention_rate_df: pd.DataFrame | None = None,
) -> tuple[Path, ...]:
    ...

def render_html(
    run_meta: dict,
    visibility_df: pd.DataFrame,
    rank_df: pd.DataFrame,
    ideal_df: pd.DataFrame,
    product_line_labels: dict | None = None,
    share_of_voice_df: pd.DataFrame | None = None,
    rank_comparison_df: pd.DataFrame | None = None,
    co_mention_rate_df: pd.DataFrame | None = None,
) -> str:
    ...
```

Using `None` defaults means existing call sites (including existing tests) don't break — the new section is simply omitted when all three are None.

### HTML Structure Addition

```html
<h2>Competitor Benchmarking</h2>
<h3>Share of Voice</h3>
{share_of_voice_html}
<h3>Rank Comparison</h3>
{rank_comparison_html}
<h3>Co-Mention Rate</h3>
{co_mention_rate_html}
```

### Anti-Patterns to Avoid

- **Using `inplace=True` on wide DataFrames:** Never mutate the compute function output directly. Always `.copy()` before display transforms.
- **Hardcoding competitor names in reporter.py:** All competitor lists come from `competitors_config` loaded at runtime. No strings like `"Peachtree Financial"` should appear in reporter.py logic.
- **Using MultiIndex columns after pivot_table without flattening:** `pivot_table` with `columns=` creates a MultiIndex column header. Always call `.reset_index()` and set `comp_wide.columns.name = None` to get a flat column list.
- **Forgetting the `ambiguous` product line has no competitors:** `competitors_config["product_lines"]["ambiguous"]["competitors"]` is `[]`. All three compute functions must handle empty competitor lists gracefully without errors.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Wide-format pivot | Manual column assignment loop per competitor | `DataFrame.pivot_table(index=..., columns=competitor, values=rate)` | Handles missing combinations as NaN automatically; one line |
| Missing-cell NaN | Manual `if competitor not in pl_competitors` branching inline | `pivot_table` + `reindex(columns=all_competitors)` | pivot_table fills missing combinations with NaN by design |
| Competitor config loading | Re-read YAML in reporter.py | `extractor.load_competitors()` — already anchored, tested, used | Deduplication of YAML load logic; avoids two separate path-anchoring implementations |

**Key insight:** Wide-format with N/A cells is the core complexity. `pivot_table` solves it in one call. The alternative (manual loops building a dict of lists and constructing a DataFrame) is 3-5x the code and introduces more failure modes.

## Common Pitfalls

### Pitfall 1: MultiIndex columns after pivot_table
**What goes wrong:** `pivot_table(columns="competitor")` produces a MultiIndex column where level 0 is the value name and level 1 is the competitor. `to_html()` renders this as a two-row header that looks broken in the report.
**Why it happens:** pandas pivot_table returns MultiIndex columns when `values` is a single column.
**How to avoid:** After pivot, call `comp_wide.columns.name = None` and flatten if needed. If using a single `values=` arg, the columns are already 1D after `reset_index()` — verify with `isinstance(df.columns, pd.MultiIndex)` in tests.
**Warning signs:** Table header has a blank top row in HTML; column names show tuples when printed.

### Pitfall 2: competitor_mentions is stored as a list but loaded as JSON
**What goes wrong:** `row["competitor_mentions"]` returns a Python list when loaded from in-memory DataFrame, but could be a string `"[]"` or null if loaded incorrectly from JSON.
**Why it happens:** The existing test data in `_EXTRACTION_JGW` sets `competitor_mentions: []` (empty list). JSON serialization is correct, but pandas may coerce types.
**How to avoid:** Defensive check: `comp in (row.get("competitor_mentions") or [])` — handles None, empty list, and populated list safely. The existing code in `test_reporter.py` confirms the field is a Python list in all test fixtures.
**Warning signs:** `TypeError: argument of type 'float' is not iterable` — happens when NaN leaks into the competitor_mentions column.

### Pitfall 3: ambiguous product line breaks competitor loops
**What goes wrong:** `competitors_config["product_lines"]["ambiguous"]["competitors"]` is `[]`. A loop that does `for comp in pl_competitors` correctly skips it, but a loop that assumes at least one competitor per product line will either produce empty DataFrames or fail silently.
**Why it happens:** competitors.yaml explicitly has `ambiguous: competitors: []`.
**How to avoid:** Always use `pl_data.get("competitors", [])` and guard with `if pl_competitors:` where needed. Empty list iteration is safe in Python; the issue is usually with empty DataFrame operations after the loop.
**Warning signs:** Wide DataFrame has correct columns but missing rows for ambiguous product line; or merge errors.

### Pitfall 4: Rank comparison data model constraint
**What goes wrong:** The planner or implementer assumes `ExtractionRecord` has a `competitor_rank` field and tries to compute each competitor's own rank position. No such field exists.
**Why it happens:** The requirement says "rank comparison showing where JGW and each competitor appear (1st, 2nd, 3rd)" — this reads as if competitors have their own rank. In the data model, only `jgw_rank: int | None` is available.
**How to avoid:** The Rank Comparison table shows JGW's average rank in responses where a given competitor was present. This is the only computation the data supports. Document this explicitly in task descriptions.
**Warning signs:** Any code referencing `row["competitor_rank"]` or similar — field does not exist.

### Pitfall 5: write_csvs() return type change breaks existing tests
**What goes wrong:** Current `write_csvs()` returns `tuple[Path, Path]`. Extending to 5 paths changes the return type, which breaks `test_csv_export` which does `vis_path, ideal_path = write_csvs(...)`.
**Why it happens:** Unpacking a 5-tuple into 2 variables raises `ValueError: too many values to unpack`.
**How to avoid:** Either change the return to `tuple[Path, ...]` and update `test_csv_export` to unpack only the first two values, OR change the call site in `execute_report()` to handle the extended tuple. Update the test assertion accordingly.
**Warning signs:** `ValueError: too many values to unpack (expected 2)` in test_csv_export.

### Pitfall 6: Display transforms applied to wide DataFrames with non-standard column names
**What goes wrong:** `COLUMN_LABELS` rename dict only covers internal column names like `product_line`, `intent`, `model_id`. Wide-format DataFrames have competitor name strings as column names. Applying `rename(columns=COLUMN_LABELS)` to a wide DataFrame is safe (it's a no-op for unknown keys), but the `product_line` and `intent` columns still need renaming.
**Why it happens:** Wide DataFrames still have `product_line` and `intent` as row-index columns before the pivot is applied.
**How to avoid:** Apply `rename(columns=COLUMN_LABELS)` as the first transform — it handles `product_line` → `"Product Line"` and `intent` → `"Intent"` correctly. Competitor name columns pass through unchanged. Then apply INTENT_LABELS replace and product line label map using the post-rename column names `"Product Line"` and `"Intent"`.

## Code Examples

### Loading competitors config in execute_report()

```python
# Source: direct code read of src/extractor.py load_competitors()
from src import extractor

# In execute_report():
competitors_config = extractor.load_competitors()
# Returns: {"version": "v1", "product_lines": {"structured_settlements": {"competitors": [...]}, ...}}
```

### Defensive competitor_mentions access

```python
# Source: direct inspection — handles NaN and None safely
def _comp_in_mentions(mentions, comp_name: str) -> bool:
    """Safe check: comp_name in mentions list (handles None/NaN/empty)."""
    if not isinstance(mentions, list):
        return False
    return comp_name in mentions
```

### Display copy transform for wide DataFrames

```python
# Source: Phase 14 pattern — extended for wide format
sov_display = share_of_voice_df.copy()
# Format percentage columns — only numeric columns that aren't product_line/intent
pct_cols = [c for c in sov_display.columns if c not in ("product_line", "intent")]
for col in pct_cols:
    if pd.api.types.is_numeric_dtype(sov_display[col]):
        sov_display[col] = sov_display[col].map(lambda x: f"{x:.1f}%" if pd.notna(x) else x)

sov_display = sov_display.rename(columns=COLUMN_LABELS)
if not sov_display.empty and "Intent" in sov_display.columns:
    sov_display = sov_display.replace({"Intent": INTENT_LABELS})
if not sov_display.empty and "Product Line" in sov_display.columns:
    sov_display["Product Line"] = sov_display["Product Line"].map(
        lambda k: pl_labels.get(k, k.replace("_", " ").title())
    )

sov_html = sov_display.to_html(index=False, border=0, na_rep="—", classes="data-table")
```

### Collecting all competitor names (union across product lines)

```python
# Source: direct pattern from competitors.yaml structure
def _all_competitors(competitors_config: dict) -> list[str]:
    """Return deduplicated list of all competitor names, preserving config order."""
    seen = {}
    for pl_data in competitors_config["product_lines"].values():
        for name in pl_data.get("competitors", []):
            seen[name] = None  # dict preserves insertion order, deduplicates
    return list(seen)
```

### CSS for h3 headings (must be added to embedded <style>)

```html
<!-- Current reporter.py style block has h1 and h2 but NOT h3 -->
h3 { font-size: 1rem; margin-top: 1.5rem; margin-bottom: 0.25rem; }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No competitor data in report | 3 competitor sections (sov, rank, co-mention) | Phase 15 | Report covers competitive landscape, not just JGW in isolation |
| `render_html()` has 4 params | Extended to 7 params (+ 3 new DataFrames) | Phase 15 | Callers must update; defaults = None for backward compat |
| `write_csvs()` returns 2 paths | Returns 5 paths (+ 3 new CSVs) | Phase 15 | `test_csv_export` unpacking must be updated |

**Currently in reporter.py:**
- `h2` CSS defined (used for existing 3 section headings)
- `h3` CSS NOT defined — must add to the embedded `<style>` block for new subsection headings
- `na_rep="—"` already in all `to_html()` calls — extend to new tables, no new convention needed

## Open Questions

1. **Rank Comparison: what "rank" means for competitors**
   - What we know: `ExtractionRecord.jgw_rank` is JGW's rank position; no `competitor_rank` field exists
   - What's unclear: Does the user expect to see the competitor's position, or JGW's position in co-mention responses?
   - Recommendation: Implement as "JGW's avg rank in responses where that competitor was mentioned." This is useful (shows whether JGW ranks higher or lower when a competitor is also present) and is the only computation the data supports. The planner should add a comment in the task clarifying this interpretation.

2. **CSV filenames for 3 new exports**
   - What we know: Claude's discretion per CONTEXT.md
   - Recommendation: `share_of_voice.csv`, `rank_comparison.csv`, `co_mention_rate.csv` — consistent with existing `visibility.csv` and `ideal_content.csv` naming pattern (snake_case, descriptive)

3. **JGW column label in wide tables**
   - What we know: Claude's discretion per CONTEXT.md
   - Recommendation: `"JGW"` (short, consistent with brand shorthand used throughout the codebase, e.g. `jgw_mentioned`, `jgw_rank`)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest 8.x (uv-managed) |
| Config file | `pyproject.toml` → `[tool.pytest.ini_options]` |
| Quick run command | `cd /Users/smurph/llm-visibility-tracker && uv run pytest tests/test_reporter.py -x -q` |
| Full suite command | `cd /Users/smurph/llm-visibility-tracker && uv run pytest tests/ -x -q` |

**Current state:** 11 tests passing (confirmed by test run on 2026-03-08).

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RPT-02 | `compute_share_of_voice()` returns wide DataFrame with correct column structure | unit | `uv run pytest tests/test_reporter.py::test_share_of_voice -x` | Wave 0 |
| RPT-02 | Share of voice section appears in rendered HTML with h2/h3 headings | unit | `uv run pytest tests/test_reporter.py::test_competitor_section_html -x` | Wave 0 |
| RPT-02 | `share_of_voice.csv` written with correct headers | unit | `uv run pytest tests/test_reporter.py::test_competitor_csvs -x` | Wave 0 |
| RPT-03 | `compute_rank_comparison()` returns wide DataFrame with JGW + competitor avg ranks | unit | `uv run pytest tests/test_reporter.py::test_rank_comparison -x` | Wave 0 |
| RPT-04 | `compute_co_mention_rate()` returns wide DataFrame with co-occurrence % per segment | unit | `uv run pytest tests/test_reporter.py::test_co_mention_rate -x` | Wave 0 |
| RPT-02/03/04 | Non-configured competitor/product-line cells render as "—" | unit | included in test_competitor_section_html | Wave 0 |
| RPT-02/03/04 | `test_csv_export` updated for new write_csvs() return signature | unit | `uv run pytest tests/test_reporter.py::test_csv_export -x` | ✅ (needs update) |
| RPT-02/03/04 | `test_execute_report_integration` updated to verify new CSV files exist | unit | `uv run pytest tests/test_reporter.py::test_execute_report_integration -x` | ✅ (needs update) |

### Sampling Rate
- **Per task commit:** `uv run pytest tests/test_reporter.py -x -q`
- **Per wave merge:** `uv run pytest tests/ -x -q`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/test_reporter.py::test_share_of_voice` — covers RPT-02 compute function
- [ ] `tests/test_reporter.py::test_rank_comparison` — covers RPT-03 compute function
- [ ] `tests/test_reporter.py::test_co_mention_rate` — covers RPT-04 compute function
- [ ] `tests/test_reporter.py::test_competitor_section_html` — covers HTML rendering for all three sections + N/A rendering
- [ ] `tests/test_reporter.py::test_competitor_csvs` — covers 3 new CSV files

Existing tests that need updating (not new — modification of existing assertions):
- `test_csv_export`: unpacks `vis_path, ideal_path = write_csvs(...)` — must update for new 5-tuple return (or use starred unpacking)
- `test_execute_report_integration`: should assert `share_of_voice.csv`, `rank_comparison.csv`, `co_mention_rate.csv` exist in run directory

## Sources

### Primary (HIGH confidence)
- Direct code read of `/Users/smurph/llm-visibility-tracker/src/reporter.py` — current function signatures, display-copy pattern, to_html() calls, execute_report() integration point
- Direct code read of `/Users/smurph/llm-visibility-tracker/src/schemas.py` — confirmed ExtractionRecord fields: `jgw_rank: int | None`, `competitor_mentions: list[str]`, no competitor_rank field
- Direct code read of `/Users/smurph/llm-visibility-tracker/config/competitors.yaml` — confirmed structure: product_lines dict, competitors list per product line, ambiguous has empty list
- Direct code read of `/Users/smurph/llm-visibility-tracker/src/extractor.py` — load_competitors() signature and return structure
- Direct code read of `/Users/smurph/llm-visibility-tracker/tests/test_reporter.py` — existing assertions that need updating (write_csvs unpack, test_execute_report_integration)
- Test run confirmation: `uv run pytest tests/test_reporter.py -x -q` — 11 passed on 2026-03-08
- pandas 2.2 stdlib knowledge: pivot_table, groupby.mean(), reindex — stable APIs

### Secondary (MEDIUM confidence)
- None required — all findings grounded in direct code inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies; all patterns derived from existing reporter.py code
- Architecture: HIGH — three compute functions follow exact same pattern as existing compute_visibility(); wide format via pivot_table is standard pandas
- Pitfalls: HIGH — derived from direct inspection of ExtractionRecord schema (no competitor_rank field), existing test assertions that will break, and known pandas pivot_table MultiIndex behavior

**Research date:** 2026-03-08
**Valid until:** 2026-06-08 (stable domain — pandas pivot_table API stable across versions; competitors.yaml schema unlikely to change)
