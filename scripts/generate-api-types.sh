#!/usr/bin/env bash
set -euo pipefail

# Default to local dev server; override with OPENAPI_URL env var
OPENAPI_URL="${OPENAPI_URL:-http://localhost:8000/openapi.json}"

echo "Fetching OpenAPI spec from $OPENAPI_URL ..."
npx openapi-typescript "$OPENAPI_URL" -o lib/api-types.ts

echo "Types generated at lib/api-types.ts"
