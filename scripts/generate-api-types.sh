#!/usr/bin/env bash
set -euo pipefail

# Use local spec file if it exists and no URL override is set
SPEC_FILE="lib/openapi-spec.json"

if [ -n "${OPENAPI_URL:-}" ]; then
  echo "Fetching OpenAPI spec from $OPENAPI_URL ..."
  curl -sf "$OPENAPI_URL" -o "$SPEC_FILE"
  echo "Spec saved to $SPEC_FILE"
fi

if [ ! -f "$SPEC_FILE" ]; then
  echo "ERROR: No spec file at $SPEC_FILE. Run with OPENAPI_URL=http://localhost:8000/openapi.json to fetch." >&2
  exit 1
fi

echo "Generating types from $SPEC_FILE ..."
npx openapi-typescript "$SPEC_FILE" -o lib/api-types.ts

echo "Types generated at lib/api-types.ts"
