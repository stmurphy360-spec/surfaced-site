#!/usr/bin/env bash
set -euo pipefail

OPENAPI_URL="${OPENAPI_URL:-http://localhost:8000/openapi.json}"
SPEC_FILE="lib/openapi-spec.json"

if [ ! -f "$SPEC_FILE" ]; then
  echo "No committed spec at $SPEC_FILE — run 'npm run generate-api-types' first." >&2
  exit 1
fi

LIVE_SPEC=$(curl -sf "$OPENAPI_URL") || {
  echo "Could not reach $OPENAPI_URL — skipping spec check." >&2
  exit 0
}

# Compare ignoring whitespace differences
if ! echo "$LIVE_SPEC" | python3 -c "
import json, sys
live = json.load(sys.stdin)
with open('$SPEC_FILE') as f:
    committed = json.load(f)
sys.exit(0 if live == committed else 1)
" 2>/dev/null; then
  echo "ERROR: OpenAPI spec has changed! Run 'OPENAPI_URL=$OPENAPI_URL npm run generate-api-types' to update." >&2
  exit 1
fi

echo "OpenAPI spec is up to date."
