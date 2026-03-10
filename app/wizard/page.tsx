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

// ── TagInput ───────────────────────────────────────────────────────────────

function TagInput({
  tags,
  onChange,
  placeholder,
  hint,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  hint?: string
}) {
  const [inputVal, setInputVal] = useState('')

  function addTag(val: string) {
    const trimmed = val.trim()
    if (!trimmed || tags.includes(trimmed)) return
    onChange([...tags, trimmed])
    setInputVal('')
  }

  function removeTag(idx: number) {
    onChange(tags.filter((_, i) => i !== idx))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputVal)
    }
    if (e.key === 'Backspace' && inputVal === '' && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div>
      <div
        className="wiz-tag-wrapper"
        onClick={(e) =>
          (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()
        }
      >
        {tags.map((tag, i) => (
          <span key={i} className="wiz-tag">
            {tag}
            <button
              className="wiz-tag-remove"
              onClick={() => removeTag(i)}
              type="button"
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="wiz-tag-input"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(inputVal)}
          placeholder={
            tags.length === 0 ? (placeholder ?? 'Type and press Enter') : ''
          }
        />
      </div>
      {hint && <p className="wiz-tag-hint">{hint}</p>}
    </div>
  )
}

// ── Step 2: Products ────────────────────────────────────────────────────────

function StepProducts({
  products,
  onChange,
  onNext,
  onBack,
}: {
  products: string[]
  onChange: (products: string[]) => void
  onNext: () => void
  onBack: () => void
}) {
  const [newProduct, setNewProduct] = useState('')

  function addProduct() {
    const trimmed = newProduct.trim()
    if (!trimmed || products.includes(trimmed) || products.length >= 3) return
    onChange([...products, trimmed])
    setNewProduct('')
  }

  function removeProduct(idx: number) {
    onChange(products.filter((_, i) => i !== idx))
  }

  return (
    <div className="step-card">
      <div className="step-eyebrow">Step 2 of 6</div>
      <div className="step-title">What product lines do you track?</div>
      <div className="step-subtitle">
        Optional — add up to 3 product lines. You can configure more later.
      </div>

      {products.map((product, i) => (
        <div key={i} className="wiz-product-item">
          <span>{product}</span>
          <button
            className="wiz-product-remove"
            onClick={() => removeProduct(i)}
            type="button"
          >
            ×
          </button>
        </div>
      ))}

      <input
        className="wiz-input"
        placeholder="e.g. Personal Loans"
        value={newProduct}
        onChange={(e) => setNewProduct(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addProduct()
          }
        }}
      />
      <button
        className="wiz-add-btn"
        onClick={addProduct}
        disabled={products.length >= 3}
        type="button"
      >
        + Add product
      </button>
      {products.length >= 3 && (
        <p className="wiz-add-caption">Maximum 3 products reached</p>
      )}

      <div className="wiz-btn-actions">
        <button className="wiz-btn-secondary" onClick={onBack} type="button">
          Back
        </button>
        <button className="wiz-btn-primary" onClick={onNext} type="button">
          Continue
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Claims ─────────────────────────────────────────────────────────

function StepClaims({
  products,
  claimsBrand,
  claimsProducts,
  onChangeBrand,
  onChangeProduct,
  onNext,
  onBack,
}: {
  products: string[]
  claimsBrand: string[]
  claimsProducts: Record<string, string[]>
  onChangeBrand: (claims: string[]) => void
  onChangeProduct: (product: string, claims: string[]) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="step-card">
      <div className="step-eyebrow">Step 3 of 6</div>
      <div className="step-title">What claims do you make?</div>
      <div className="step-subtitle">
        Add the key messages you want LLMs to affirm. Optional — you can add
        more later.
      </div>

      <div className="wiz-section-label">BRAND MESSAGING</div>
      <TagInput
        tags={claimsBrand}
        onChange={onChangeBrand}
        placeholder="e.g. We pay structured settlements fast"
        hint="Press Enter or comma to add each claim"
      />

      {products.length > 0 &&
        products.map((product) => (
          <div key={product}>
            <div className="wiz-section-label">{product.toUpperCase()}</div>
            <TagInput
              tags={claimsProducts[product] ?? []}
              onChange={(tags) => onChangeProduct(product, tags)}
              hint="Press Enter or comma to add each claim"
            />
          </div>
        ))}

      <div className="wiz-btn-actions">
        <button className="wiz-btn-secondary" onClick={onBack} type="button">
          Back
        </button>
        <button className="wiz-btn-primary" onClick={onNext} type="button">
          Continue
        </button>
      </div>
    </div>
  )
}

// ── Step 4: Competitors ────────────────────────────────────────────────────

function StepCompetitors({
  competitors,
  onChange,
  onNext,
  onBack,
}: {
  competitors: string[]
  onChange: (competitors: string[]) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="step-card">
      <div className="step-eyebrow">Step 4 of 6</div>
      <div className="step-title">Who are your competitors?</div>
      <div className="step-subtitle">
        Optional — add competitors you want to benchmark against.
      </div>

      <TagInput
        tags={competitors}
        onChange={onChange}
        placeholder="e.g. Peachtree Financial"
        hint="Press Enter or comma to add each competitor"
      />

      <div className="wiz-btn-actions">
        <button className="wiz-btn-secondary" onClick={onBack} type="button">
          Back
        </button>
        <button className="wiz-btn-primary" onClick={onNext} type="button">
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
              {currentStep === 2 && (
                <StepProducts
                  products={state.products}
                  onChange={(products) =>
                    setState((prev) => ({ ...prev, products }))
                  }
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                />
              )}
              {currentStep === 3 && (
                <StepClaims
                  products={state.products}
                  claimsBrand={state.claims.brand}
                  claimsProducts={state.claims.products}
                  onChangeBrand={(tags) =>
                    setState((prev) => ({
                      ...prev,
                      claims: { ...prev.claims, brand: tags },
                    }))
                  }
                  onChangeProduct={(product, tags) =>
                    setState((prev) => ({
                      ...prev,
                      claims: {
                        ...prev.claims,
                        products: { ...prev.claims.products, [product]: tags },
                      },
                    }))
                  }
                  onNext={() => setCurrentStep(4)}
                  onBack={() => setCurrentStep(2)}
                />
              )}
              {currentStep === 4 && (
                <StepCompetitors
                  competitors={state.competitors}
                  onChange={(competitors) =>
                    setState((prev) => ({ ...prev, competitors }))
                  }
                  onNext={() => setCurrentStep(5)}
                  onBack={() => setCurrentStep(3)}
                />
              )}
              {currentStep === 5 && <div>Step 5 coming soon</div>}
              {currentStep === 6 && <div>Step 6 coming soon</div>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
