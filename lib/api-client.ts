/**
 * Typed API client for the LLM Visibility Tracker backend.
 *
 * Centralizes PYTHON_API_URL, auth headers, and provides typed methods
 * for every endpoint. Response types are extracted from the auto-generated
 * OpenAPI types so they stay in sync with the backend schema.
 */
import type { components, operations } from './api-types'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PYTHON_API = process.env.PYTHON_API_URL ?? 'http://localhost:8000'
const PYTHON_API_SECRET = process.env.PYTHON_API_SECRET ?? ''

// ---------------------------------------------------------------------------
// Type helpers
// ---------------------------------------------------------------------------

/** Extract the JSON body type from a response object. */
type JsonOf<T> = T extends { content: { 'application/json': infer U } } ? U : never

/** Shorthand to pull the success-response JSON type from an operation. */
type ResponseOf<Op, Code extends number = 200> =
  Op extends { responses: infer R }
    ? Code extends keyof R
      ? JsonOf<R[Code]>
      : never
    : never

// ---------------------------------------------------------------------------
// Exported response types (concrete where response_model exists, fallback otherwise)
// ---------------------------------------------------------------------------

export type HealthResponse = components['schemas']['HealthResponse']
export type RunTriggerResponse = components['schemas']['RunTriggerResponse']
export type RunRecord = components['schemas']['RunRecord']
export type RegenerateResponse = components['schemas']['RegenerateResponse']
export type RunRequest = components['schemas']['RunRequest']

/** GET /runs — array of RunRecord */
export type RunListResponse = ResponseOf<operations['list_runs_runs_get']>

/** GET /status/active — dynamic shape, not modeled */
export type ActiveJobResponse = Record<string, unknown>

/** GET /status/{job_id} — dynamic shape, not modeled */
export type JobStatusResponse = Record<string, unknown>

/** GET /runs/{run_id}/meta — dynamic shape, not modeled */
export type RunMetaResponse = Record<string, unknown>

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T; status: number }> {
  const res = await fetch(`${PYTHON_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${PYTHON_API_SECRET}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  })
  const data = (await res.json()) as T
  return { data, status: res.status }
}

async function apiRaw(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${PYTHON_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${PYTHON_API_SECRET}`,
      ...init?.headers,
    },
    cache: 'no-store',
  })
}

// ---------------------------------------------------------------------------
// Public API object
// ---------------------------------------------------------------------------

export const api = {
  /** GET /health (no auth) */
  health: () =>
    apiFetch<HealthResponse>('/health', {
      headers: { 'Content-Type': 'application/json' },
    }),

  /** POST /run — returns 202 */
  triggerRun: (body: RunRequest) =>
    apiFetch<RunTriggerResponse>('/run', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** GET /runs */
  listRuns: () => apiFetch<RunListResponse>('/runs'),

  /** GET /status/active */
  activeJob: () => apiFetch<ActiveJobResponse>('/status/active'),

  /** GET /status/{job_id} */
  jobStatus: (jobId: string) =>
    apiFetch<JobStatusResponse>(`/status/${jobId}`),

  /** GET /runs/{run_id}/meta */
  runMeta: (runId: string) =>
    apiFetch<RunMetaResponse>(`/runs/${runId}/meta`),

  /** GET /files/{run_id}/{filePath} — raw Response for binary downloads */
  downloadFile: (runId: string, filePath: string) =>
    apiRaw(`/files/${runId}/${filePath}`),

  /** POST /runs/{run_id}/regenerate-report */
  regenerateReport: (runId: string) =>
    apiFetch<RegenerateResponse>(`/runs/${runId}/regenerate-report`, {
      method: 'POST',
    }),
}
