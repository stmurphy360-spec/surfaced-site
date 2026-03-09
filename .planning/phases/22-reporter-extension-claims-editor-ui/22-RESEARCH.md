# Phase 22: Reporter Extension + Claims Editor UI - Research

**Researched:** 2026-03-08
**Domain:** Python reporter extension (sentiment section in HTML report) + Next.js dashboard UI (claims editor per product line)
**Confidence:** HIGH

## Summary

Phase 22 has two distinct work streams that touch different codebases. The Python backend (`llm-visibility-tracker`) needs a new `compute_sentiment_distribution()` function in `reporter.py` and a new HTML section added to `render_html()`. The Next.js frontend (`surfaced-site`) needs a claims editor wired into the existing `ConfigPanel` component and a new `/api/config/claims` API proxy route.

The data infrastructure for both streams already exists. `SentimentRecord` is defined in `src/schemas.py`, `write_sentiment`/`read_sentiments` are implemented in `src/storage.py`, and `claims` is already a top-level key in `web_config.json` with the correct shape (`dict[str, list[str]]`). The Python `/config` API endpoint does NOT currently read or write the `claims` key — `ConfigPayload` only accepts `brand_name` and `competitors`. The Next.js `/api/config` proxy mirrors that gap. Both need extending.

The primary architectural risk is the `ConfigPayload` schema gap in `api/main.py`. If the planner misses that the POST handler only handles `brand_name` and `competitors`, the claims editor will appear to save but will silently discard claims. Every other integration point is already in place.

**Primary recommendation:** Extend `ConfigPayload` + GET `/config` to include `claims` in the FastAPI layer, then build the claims editor in `ConfigPanel` to POST the full config including claims. For the report, follow the exact `compute_visibility()` + `render_html()` extension pattern from Phase 15.

---

## Standard Stack

### Core (Python backend — `llm-visibility-tracker`)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pandas | >=2.2 | DataFrame aggregation for sentiment distribution | Already used for all compute_* functions |
| pydantic | >=2.0 | `SentimentRecord` schema (already exists) | All schemas use pydantic v2 |
| fastapi | >=0.115 | API endpoint extension | Existing API framework |
| yaml / json | stdlib | Config loading | Pattern already established |

### Core (Next.js frontend — `surfaced-site`)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router, API routes | Project framework |
| React | 19.2.3 | UI components | Project framework |
| TypeScript | ^5 | Type safety | Project standard |
| Tailwind CSS | ^4 | Styling | Project standard (existing component classes) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pytest | >=8.0 | Python test runner | All Python backend tests |
| pytest-asyncio | >=0.23 | Async test support | Scorer async tests |

### No new dependencies required for either stream.

---

## Architecture Patterns

### Recommended Project Structure (additions only)

**Python backend:**
```
src/
├── reporter.py          # Add: compute_sentiment_distribution(), extend render_html()
│                        # Extend: write_csvs() for sentiment CSV
api/
├── main.py              # Extend: ConfigPayload + GET /config + POST /config for claims
```

**Next.js frontend:**
```
app/api/config/
├── route.ts             # Extend: pass claims through GET and POST
components/
├── ConfigPanel.tsx      # Extend: add ClaimsEditor section per product line
```

### Pattern 1: compute_* function style (Python)

**What:** Stateless function, takes `list[dict]` inputs, returns `pd.DataFrame` with clean columns. Follows the pattern of `compute_visibility()`, `compute_share_of_voice()`.

**When to use:** For any new report metric aggregation.

```python
# Source: existing src/reporter.py pattern
def compute_sentiment_distribution(
    sentiments: list[dict],
    responses: list[dict],
) -> pd.DataFrame:
    """Compute sentiment distribution % by product_line x intent x sentiment.

    Returns DataFrame with columns [product_line, intent, sentiment, pct].
    pct = (count of that sentiment / total for segment) * 100, rounded to 1 decimal.
    Returns empty DataFrame with correct columns if sentiments is empty.
    """
    if not sentiments:
        return pd.DataFrame(columns=["product_line", "intent", "sentiment", "pct"])

    sentiments_df = pd.DataFrame(sentiments)
    responses_df = pd.DataFrame(responses)
    responses_labels = (
        responses_df[["prompt_id", "model_id", "product_line", "intent"]]
        .drop_duplicates(subset=["prompt_id", "model_id"])
    )
    merged = sentiments_df.merge(responses_labels, on=["prompt_id", "model_id"], how="left")
    # groupby product_line x intent, compute % per sentiment value
    ...
```

**Key constraint:** `SentimentRecord.sentiment` is `Literal["positive", "neutral", "negative"]`. The distribution should cover all three values even if count is 0.

### Pattern 2: render_html() extension (Python)

**What:** Add optional DataFrame parameter with a guard `if sentiment_df is not None and not sentiment_df.empty:` before building the HTML section. Append new section after Competitor Benchmarking.

```python
# Source: existing src/reporter.py render_html() — competitor_section_html pattern
def render_html(
    run_meta: dict,
    visibility_df: pd.DataFrame,
    rank_df: pd.DataFrame,
    ideal_df: pd.DataFrame,
    product_line_labels: dict | None = None,
    share_of_voice_df: pd.DataFrame | None = None,
    rank_comparison_df: pd.DataFrame | None = None,
    co_mention_rate_df: pd.DataFrame | None = None,
    sentiment_df: pd.DataFrame | None = None,   # NEW
    summary: str = "",
    brand_name: str = "JG Wentworth",
) -> str:
    ...
    sentiment_section_html = ""
    if sentiment_df is not None and not sentiment_df.empty:
        # format % cols, apply labels, to_html()
        sentiment_section_html = f"""
<h2>Sentiment Distribution</h2>
{sent_html}"""
```

### Pattern 3: ConfigPanel claims editor (Next.js)

**What:** Mirror the existing competitor list-edit UX exactly. Per product line: show current claims as a list with remove buttons, add-new input + Enter/button. Save triggers the same handleSave flow.

**Critical:** The `ConfigData` type in `ConfigPanel.tsx` must gain a `claims` field. The GET `/api/config` must return it. The POST body must include it. The FastAPI `ConfigPayload` must accept it.

```typescript
// Source: existing components/ConfigPanel.tsx pattern
type ConfigData = {
  brand_name: string
  competitors: Record<string, string[]>
  claims: Record<string, string[]>  // NEW
}
```

### Pattern 4: FastAPI config extension

**What:** Add `claims: Optional[dict[str, list[str]]] = None` to `ConfigPayload`. Extend GET `/config` to read and return `claims` from `web_config.json`. Extend POST `/config` to merge `claims` key like `competitors`.

```python
# Source: existing api/main.py ConfigPayload + post_config pattern
class ConfigPayload(BaseModel):
    brand_name: Optional[str] = None
    competitors: Optional[dict[str, list[str]]] = None
    claims: Optional[dict[str, list[str]]] = None   # NEW

@app.post("/config", dependencies=[Depends(verify_token)])
async def post_config(payload: ConfigPayload):
    current = _read_web_config()
    if payload.brand_name is not None:
        current["brand_name"] = payload.brand_name
    if payload.competitors is not None:
        current["competitors"] = payload.competitors
    if payload.claims is not None:          # NEW
        current["claims"] = payload.claims  # NEW
    _write_web_config(current)
    return {"status": "saved"}

@app.get("/config", dependencies=[Depends(verify_token)])
async def get_config():
    web = _read_web_config()
    base_competitors = _load_base_competitors()
    return {
        "brand_name": web.get("brand_name", "JG Wentworth"),
        "competitors": web.get("competitors", base_competitors),
        "claims": web.get("claims", {}),   # NEW
    }
```

### Anti-Patterns to Avoid

- **Overwriting rather than merging claims:** POST handler must merge `claims` into existing `web_config.json` dict, not replace the whole file. This is the established `_merge_web_config` pattern.
- **Mutating DataFrames before rendering:** Always use `df.copy()` before applying display labels. The existing reporter functions demonstrate this correctly.
- **Adding claims to `execute_analysis` sentiment pipeline:** Sentiment scoring is a separate pipeline stage — this phase only reads already-stored sentiment records. Do NOT attempt to run sentiment scoring in this phase if it isn't already running.
- **Adding intent split to sentiment if data model doesn't guarantee it:** `SentimentRecord` does not carry `intent` directly — it must be joined from `responses` via `prompt_id + model_id`, same as `_merge_segment_labels()`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sentiment label display in HTML | Custom string formatter | `pd.DataFrame.to_html(na_rep="—")` + `replace()` dict | Established pattern — see `INTENT_LABELS` in reporter.py |
| Config file read/write | New JSON file management | `_read_web_config()` / `_write_web_config()` in api/main.py | Already handles error cases; thread-safe enough for single-user |
| Product line list in claims editor | Hardcoded list | Read from `config.competitors` keys already returned by GET /config | Product lines are dynamically keyed from `web_config.json` |
| Auth in new API routes | Custom middleware | `Depends(verify_token)` — the existing auth dependency | Already in place for all protected routes |

**Key insight:** Every data structure this phase needs already exists. The work is wiring and rendering, not modeling.

---

## Common Pitfalls

### Pitfall 1: Claims data absent from GET /config response
**What goes wrong:** `ConfigPanel` receives no `claims` key, falls back to `undefined`, crashes on iteration.
**Why it happens:** GET `/config` in `api/main.py` currently returns only `brand_name` and `competitors` — it does not read `claims` from `web_config.json`.
**How to avoid:** Extend `get_config()` to include `claims: web.get("claims", {})` before writing the UI.
**Warning signs:** `ConfigData.claims` is `undefined` in browser devtools → GET /config is not returning claims.

### Pitfall 2: POST /config silently discards claims
**What goes wrong:** User saves claims, ConfigPanel POSTs successfully, but web_config.json only saves brand_name/competitors. Claims are gone on next read.
**Why it happens:** `ConfigPayload` does not include `claims` field; FastAPI ignores unknown keys in the JSON body.
**How to avoid:** Add `claims: Optional[dict[str, list[str]]] = None` to `ConfigPayload` before any UI testing.
**Warning signs:** Claims revert to empty list after page reload despite successful save response.

### Pitfall 3: Sentiment section renders when no sentiment data exists
**What goes wrong:** Empty sentiment table or error in report when no sentiment pipeline has run.
**Why it happens:** `read_sentiments(run_id)` returns `[]` if `/sentiments/` directory doesn't exist. If the reporter unconditionally calls `compute_sentiment_distribution`, it returns an empty DataFrame, and a guard-less render block shows an empty table.
**How to avoid:** Guard in `render_html()`: `if sentiment_df is not None and not sentiment_df.empty:`. In `execute_report()`, only pass `sentiment_df` when `sentiments` list is non-empty.
**Warning signs:** HTML report shows "Sentiment Distribution" heading with empty table body.

### Pitfall 4: Sentiment join fails because `SentimentRecord` lacks product_line/intent
**What goes wrong:** `compute_sentiment_distribution` cannot group by product_line without joining to responses. If the join is done incorrectly (wrong dedup logic), the same dedup issue that `_merge_segment_labels()` solved recurs.
**Why it happens:** `SentimentRecord` stores `prompt_id` + `model_id` but NOT `product_line` or `intent` directly. The mapping comes from `RawResponseRecord`.
**How to avoid:** Reuse `_merge_segment_labels()` pattern exactly: deduplicate `responses` on `["prompt_id", "model_id"]` before merging sentiments.
**Warning signs:** Sentiment % values inflated by 3x — caused by joining to all 3 run_number rows instead of deduplicated prompt+model rows.

### Pitfall 5: Claims editor product line tabs don't match actual config keys
**What goes wrong:** UI shows "structured_settlements" when it should show "Structured Settlements".
**Why it happens:** `humanizeKey()` already exists in ConfigPanel.tsx — but claims product line keys must go through the same transform.
**How to avoid:** Reuse `humanizeKey(productLine)` for the section label in the claims editor section, same as for competitors.
**Warning signs:** Claims section labels show raw snake_case while competitors section shows title-case.

---

## Code Examples

### Sentiment sentiment storage round-trip (verified from source)
```python
# Source: src/storage.py
def write_sentiment(run_id: str, record: SentimentRecord) -> Path:
    target = run_dir(run_id) / "sentiments"
    target.mkdir(exist_ok=True)
    filename = f"{record.prompt_id}__{record.model_id}.json"
    path = target / filename
    path.write_text(record.model_dump_json(indent=2))
    return path

def read_sentiments(run_id: str) -> list[dict]:
    target = run_dir(run_id) / "sentiments"
    if not target.exists():
        return []
    return [json.loads(f.read_text()) for f in sorted(target.glob("*.json"))]
```

### SentimentRecord schema (verified from source)
```python
# Source: src/schemas.py
class SentimentRecord(BaseRecord):
    sentiment_prompt_version: str   # required
    sentiment: Literal["positive", "neutral", "negative"]
    judge_model_id: str
    # Inherits: run_id, prompt_id, model_id, timestamp from BaseRecord
    # Does NOT carry product_line or intent — must join from responses
```

### web_config.json claims structure (verified from source)
```json
{
  "brand_name": "JG Wentworth, JGW",
  "competitors": { "structured_settlements": [...], ... },
  "claims": {
    "structured_settlements": [],
    "debt_resolution": [],
    "home_equity": [],
    "ambiguous": []
  }
}
```

### ConfigPanel add/remove pattern (verified from source)
```typescript
// Source: components/ConfigPanel.tsx — competitors pattern, adapt for claims
function addClaim(productLine: string, text: string) {
  const trimmed = text.trim()
  if (!trimmed || !config) return
  const next = {
    ...config,
    claims: {
      ...config.claims,
      [productLine]: [...(config.claims[productLine] ?? []), trimmed],
    },
  }
  configRef.current = next
  setConfig(next)
}

function removeClaim(productLine: string, index: number) {
  if (!config) return
  const next = {
    ...config,
    claims: {
      ...config.claims,
      [productLine]: config.claims[productLine].filter((_, i) => i !== index),
    },
  }
  configRef.current = next
  setConfig(next)
}
```

### execute_report() sentiment integration point (verified from source)
```python
# Source: src/reporter.py execute_report() — extend this function
def execute_report(run_id: str) -> None:
    responses = storage.read_responses(run_id)
    extractions = storage.read_extractions(run_id)
    scores = storage.read_scores(run_id)
    sentiments = storage.read_sentiments(run_id)  # NEW — already available

    # ... existing compute calls ...

    # NEW — compute sentiment distribution only if data exists
    sentiment_df = compute_sentiment_distribution(sentiments, responses) if sentiments else None

    html = render_html(
        run_meta, visibility_df, rank_df, ideal_df, product_line_labels,
        share_of_voice_df=share_of_voice_df,
        rank_comparison_df=rank_comparison_df,
        co_mention_rate_df=co_mention_rate_df,
        sentiment_df=sentiment_df,   # NEW
        summary=summary,
        brand_name=display_brand_name,
    )
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static rubric YAML for claims | User-configurable claims in web_config.json | Phase 20 | Claims are now `list[str]` per product line, not weighted dicts |
| No sentiment storage | `SentimentRecord` + `write_sentiment`/`read_sentiments` implemented | Earlier phase | Sentiment data is available on disk; just not reported yet |
| Config only covers brand_name + competitors | Same — claims exist in web_config.json but not in API payload | Now | THIS phase must close the gap |

**Deprecated/outdated:**
- `load_rubric()` and `compute_weighted_score()` in scorer.py: Retired in Phase 20. Claims are now `list[str]` with equal weights. Do not reference rubric YAML files.
- `RubricClaim` schema: Defined in schemas.py but not used in scoring anymore. Claims are plain strings.

---

## Open Questions

1. **Has the sentiment pipeline stage actually run on any production data?**
   - What we know: `write_sentiment`/`read_sentiments` and `SentimentRecord` are implemented. The `execute_analysis()` pipeline in `run.py` does NOT include a sentiment scoring stage — there is no `mode=sentiment` or sentiment judge call.
   - What's unclear: If sentiment data doesn't exist for any run, the HTML sentiment section will never render regardless of this phase's work. The phase description says "users can see sentiment distribution in the HTML report" — but if no sentiment records exist, this is a no-op for existing runs.
   - Recommendation: The planner should include a task to verify whether sentiment records exist in at least one run directory. If not, note this as a deferred dependency — the reporter extension can still be built against the schema, but the report will show the section only when sentiment data is present.

2. **Should the claims editor show all product lines from `web_config.json` or only those with competitors configured?**
   - What we know: `web_config.json` has a `claims` key with keys matching product lines (`structured_settlements`, `debt_resolution`, `home_equity`, `ambiguous`). The GET /config response currently does NOT return claims, so the UI has no source for the claims-eligible product line list.
   - What's unclear: Whether "ambiguous" should be claimable or excluded.
   - Recommendation: Drive the claims editor product line list from `Object.keys(config.claims)` (returned by extended GET /config), not from `Object.keys(config.competitors)`. This gives maximum flexibility and matches the web_config.json structure.

3. **SENT-03 requirement ID — is this "sentiment section in HTML report" or something else?**
   - What we know: The phase description says "sentiment distribution... in the HTML report". `SentimentRecord` exists. `read_sentiments()` exists. The reporter does not currently call it.
   - What's unclear: Whether SENT-03 also requires a CSV export for sentiment.
   - Recommendation: Mirror the Phase 15 pattern — if sentiment data exists, add both an HTML section AND a CSV file (`sentiment_distribution.csv`). This is consistent with every other metric. If planner disagrees, drop the CSV and keep only HTML.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest 8.x + pytest-asyncio 0.23 |
| Config file | `/Users/smurph/llm-visibility-tracker/pyproject.toml` (`[tool.pytest.ini_options]`) |
| Quick run command | `cd /Users/smurph/llm-visibility-tracker && uv run pytest tests/test_reporter.py -x -q` |
| Full suite command | `cd /Users/smurph/llm-visibility-tracker && uv run pytest tests/ -q` |

Note: Next.js side has Playwright configured (`playwright.config.ts`) but no existing tests for the dashboard. New claims editor tests would be Playwright e2e or manual verification — no unit test framework on the Next.js side.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SENT-03 | `compute_sentiment_distribution()` returns correct pct by product_line x intent | unit | `uv run pytest tests/test_reporter.py::test_sentiment_distribution -x` | ❌ Wave 0 |
| SENT-03 | `render_html()` includes Sentiment Distribution section when df provided | unit | `uv run pytest tests/test_reporter.py::test_sentiment_section_html -x` | ❌ Wave 0 |
| SENT-03 | `render_html()` omits Sentiment Distribution when df is None/empty | unit | `uv run pytest tests/test_reporter.py::test_no_sentiment_section -x` | ❌ Wave 0 |
| MSGN-01 | GET /config returns `claims` key | unit | `uv run pytest tests/test_api.py::test_get_config_returns_claims -x` | ❌ Wave 0 |
| MSGN-05 | POST /config with claims updates web_config.json | unit | `uv run pytest tests/test_api.py::test_post_config_saves_claims -x` | ❌ Wave 0 |
| MSGN-06 | Claims editor UI — add/remove claim per product line | manual | Manual browser verification at /dashboard | ✅ (no test needed) |

### Sampling Rate
- **Per task commit:** `cd /Users/smurph/llm-visibility-tracker && uv run pytest tests/test_reporter.py tests/test_api.py -x -q`
- **Per wave merge:** `cd /Users/smurph/llm-visibility-tracker && uv run pytest tests/ -q`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/test_reporter.py` — add `test_sentiment_distribution()`, `test_sentiment_section_html()`, `test_no_sentiment_section()` — covers SENT-03
- [ ] `tests/test_api.py` — add `test_get_config_returns_claims()`, `test_post_config_saves_claims()` — covers MSGN-01, MSGN-05

*(Existing test infrastructure is in place — only new test functions needed, no new files required)*

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `/Users/smurph/llm-visibility-tracker/src/reporter.py` — full reporter module
- Direct code inspection: `/Users/smurph/llm-visibility-tracker/src/schemas.py` — SentimentRecord, ScoreRecord
- Direct code inspection: `/Users/smurph/llm-visibility-tracker/src/storage.py` — read_sentiments, write_sentiment
- Direct code inspection: `/Users/smurph/llm-visibility-tracker/api/main.py` — ConfigPayload, GET/POST /config
- Direct code inspection: `/Users/smurph/llm-visibility-tracker/config/web_config.json` — claims structure
- Direct code inspection: `/Users/smurph/surfaced-site/components/ConfigPanel.tsx` — existing UI pattern
- Direct code inspection: `/Users/smurph/surfaced-site/app/api/config/route.ts` — Next.js config proxy
- Direct code inspection: `/Users/smurph/llm-visibility-tracker/tests/test_reporter.py` — test patterns
- Direct code inspection: `/Users/smurph/llm-visibility-tracker/run.py` — execute_analysis pipeline
- Direct code inspection: `/Users/smurph/llm-visibility-tracker/pyproject.toml` — dependency versions

### Secondary (MEDIUM confidence)
- Phase 15 CONTEXT.md — confirmed reporter extension pattern (shared code, same team)

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from pyproject.toml and package.json directly
- Architecture: HIGH — patterns verified from existing production code in reporter.py, ConfigPanel.tsx, api/main.py
- Pitfalls: HIGH — pitfalls 1 and 2 confirmed by direct reading of ConfigPayload source; pitfalls 3 and 4 confirmed from SentimentRecord schema and storage implementation
- Open questions: MEDIUM — SENT-03 scope uncertainty is genuine; sentiment pipeline existence unverified without running code

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable codebase — no fast-moving dependencies)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SENT-03 | Sentiment distribution visible in HTML report | `compute_sentiment_distribution()` function needed in reporter.py; `render_html()` needs new `sentiment_df` parameter; `execute_report()` must call `read_sentiments()` and pass results in; `SentimentRecord` + storage already exist |
| MSGN-01 | Claims visible in web dashboard config panel | GET `/config` in FastAPI must return `claims` from web_config.json; Next.js `/api/config` proxy must pass through; `ConfigData` type must include `claims` |
| MSGN-05 | Claims editable from dashboard (save persists) | `ConfigPayload` must add `claims` field; POST `/config` must merge claims into web_config.json; ConfigPanel `handleSave` already POSTs full config so it works once API is extended |
| MSGN-06 | Claims can be added/removed per product line from UI | ConfigPanel needs a per-product-line claims list section mirroring the competitors UX; `addClaim()`/`removeClaim()` functions follow exact competitor pattern in ConfigPanel.tsx |
</phase_requirements>
