'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import './wizard.css'

// ── Types ──────────────────────────────────────────────────────────────────

type WizardState = {
  brand: string
  products: string[]
  claims: {
    brand: string[]
    products: Record<string, string[]>
  }
  competitors: string[]
  llms: string[]
}

const INITIAL_STATE: WizardState = {
  brand: '',
  products: [],
  claims: {
    brand: [],
    products: {},
  },
  competitors: [],
  llms: ['gpt-4o'],
}

const STEPS = [
  { label: 'Brand' },
  { label: 'Products' },
  { label: 'Claims' },
  { label: 'Competitors' },
  { label: 'Model' },
  { label: 'Review' },
]

// ── Helper functions ───────────────────────────────────────────────────────

function buildClaimsPayload(state: WizardState): Record<string, string[]> {
  const claims: Record<string, string[]> = { brand: state.claims.brand }
  state.products.forEach((p) => {
    claims[p] = state.claims.products[p] ?? []
  })
  return claims
}

function buildCompetitorsPayload(state: WizardState): Record<string, string[]> {
  if (state.products.length === 0) return { brand: state.competitors }
  const competitors: Record<string, string[]> = {}
  state.products.forEach((p) => {
    competitors[p] = state.competitors
  })
  return competitors
}

// ── Sub-components ─────────────────────────────────────────────────────────

function WizardTopBar() {
  return (
    <div className="wiz-topbar">
      <div className="wiz-topbar-logo">
        Surfaced<span>.</span>
      </div>
      <a
        href="mailto:support@surfaced.app"
        style={{
          fontSize: '14px',
          color: 'var(--wiz-text-secondary)',
          textDecoration: 'none',
        }}
      >
        Need help?
      </a>
    </div>
  )
}

function WizardProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="wiz-progress">
      {STEPS.map((step, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep
        const className = [
          'progress-step',
          isActive ? 'active' : '',
          isCompleted ? 'completed' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <div key={step.label} className={className}>
            <div className="progress-step-dot">
              {isCompleted ? '✓' : stepNumber}
            </div>
            <div className="progress-step-label">{step.label}</div>
          </div>
        )
      })}
    </div>
  )
}

// ── Step 1: Brand ──────────────────────────────────────────────────────────

function StepBrand({
  brand,
  error,
  onChange,
  onNext,
}: {
  brand: string
  error: string
  onChange: (v: string) => void
  onNext: () => void
}) {
  return (
    <div className="step-card">
      <div className="step-eyebrow">Step 1 of 6</div>
      <div className="step-title">{"What's your brand name?"}</div>
      <div className="step-subtitle">
        This is how Surfaced will refer to your brand in all reports.
      </div>
      <input
        className={`wiz-input${error ? ' error' : ''}`}
        placeholder="Enter your brand name"
        value={brand}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
      {error && <p className="wiz-input-error-msg">{error}</p>}
      <div className="wiz-btn-actions">
        <div />
        <button
          className="wiz-btn-primary"
          onClick={onNext}
          disabled={brand.trim() === ''}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function WizardPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [state, setState] = useState<WizardState>(INITIAL_STATE)
  const [submitting, setSubmitting] = useState(false)
  const [brandError, setBrandError] = useState('')

  // Bypass check: if brand_name already set, redirect to dashboard
  useEffect(() => {
    fetch('/api/config', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.brand_name) router.replace('/dashboard')
        else setReady(true)
      })
      .catch(() => setReady(true))
  }, [router])

  // Claims reconciliation: sync products into claims on step 3 entry
  useEffect(() => {
    if (currentStep !== 3) return
    setState((prev) => {
      const next = {
        ...prev,
        claims: { ...prev.claims, products: { ...prev.claims.products } },
      }
      Object.keys(next.claims.products).forEach((p) => {
        if (!next.products.includes(p)) delete next.claims.products[p]
      })
      next.products.forEach((p) => {
        if (!next.claims.products[p]) next.claims.products[p] = []
      })
      return next
    })
  }, [currentStep])

  // Suppress unused-variable warnings for helpers used in later plans
  void buildClaimsPayload
  void buildCompetitorsPayload
  void submitting
  void setSubmitting

  // Always render wizard-root so CSS custom properties are available on mount.
  // Content is hidden until the bypass check completes (to avoid flash before redirect).
  return (
    <div
      className="wizard-root"
      style={{ minHeight: '100vh', background: 'var(--wiz-bg)' }}
    >
      {ready && (
        <>
          <WizardTopBar />
          <WizardProgress currentStep={currentStep} />
          <div className="wizard-body">
            <div className="step-container">
              {currentStep === 1 && (
                <StepBrand
                  brand={state.brand}
                  error={brandError}
                  onChange={(v) => {
                    setState((prev) => ({ ...prev, brand: v }))
                    setBrandError('')
                  }}
                  onNext={() => {
                    if (!state.brand.trim()) {
                      setBrandError('Brand name is required.')
                      return
                    }
                    setBrandError('')
                    setCurrentStep(2)
                  }}
                />
              )}
              {currentStep === 2 && <div>Step 2 coming soon</div>}
              {currentStep === 3 && <div>Step 3 coming soon</div>}
              {currentStep === 4 && <div>Step 4 coming soon</div>}
              {currentStep === 5 && <div>Step 5 coming soon</div>}
              {currentStep === 6 && <div>Step 6 coming soon</div>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
