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
  competitors: Record<string, string[]>
  skippedProductLines: string[]
  llms: string[]
}

const INITIAL_STATE: WizardState = {
  brand: '',
  products: [],
  claims: {
    brand: [],
    products: {},
  },
  competitors: {},
  skippedProductLines: [],
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

// ── LLM card data ──────────────────────────────────────────────────────────

const LLM_CARDS = [
  { id: 'gpt-4o', name: 'GPT-4o', desc: 'OpenAI', locked: false },
  { id: 'claude', name: 'Claude', desc: 'Anthropic', locked: true },
  { id: 'gemini', name: 'Gemini', desc: 'Google', locked: true },
  { id: 'perplexity', name: 'Perplexity', desc: 'Perplexity AI', locked: true },
]

// ── Helper functions ───────────────────────────────────────────────────────

function buildClaimsPayload(state: WizardState): Record<string, string[]> {
  const claims: Record<string, string[]> = { brand: state.claims.brand }
  state.products.forEach((p) => {
    claims[p] = state.claims.products[p] ?? []
  })
  return claims
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
  skippedProductLines,
  onChange,
  onToggleSkip,
  onNext,
  onBack,
}: {
  products: string[]
  skippedProductLines: string[]
  onChange: (products: string[]) => void
  onToggleSkip: (product: string) => void
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

      {products.map((product, i) => {
        const isSkipped = skippedProductLines.includes(product)
        return (
          <div key={i} className="wiz-product-item">
            <span>{product}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className={`wiz-skip-toggle ${isSkipped ? 'wiz-skip-toggle--skipped' : 'wiz-skip-toggle--active'}`}
                onClick={() => onToggleSkip(product)}
                type="button"
              >
                {isSkipped ? 'Skipped' : 'Skip'}
              </button>
              <button
                className="wiz-product-remove"
                onClick={() => removeProduct(i)}
                type="button"
              >
                ×
              </button>
            </div>
          </div>
        )
      })}

      {products.length < 3 ? (
        <>
          <input
            className="wiz-input"
            placeholder="e.g. Home Insurance"
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
            disabled={!newProduct.trim()}
            type="button"
          >
            + Add product
          </button>
        </>
      ) : (
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
  skippedProductLines,
  claimsBrand,
  claimsProducts,
  onChangeBrand,
  onChangeProduct,
  onNext,
  onBack,
}: {
  products: string[]
  skippedProductLines: string[]
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
        placeholder="e.g. We're the trusted leader in our category"
        hint="Press Enter or comma to add each claim"
      />

      {products.length > 0 &&
        products.map((product) => (
          <div
            key={product}
            className={skippedProductLines.includes(product) ? 'wiz-section-disabled' : ''}
          >
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
  products,
  skippedProductLines,
  competitors,
  onChange,
  onNext,
  onBack,
}: {
  products: string[]
  skippedProductLines: string[]
  competitors: Record<string, string[]>
  onChange: (product: string, tags: string[]) => void
  onNext: () => void
  onBack: () => void
}) {
  const keys = products.length === 0 ? ['brand'] : products

  return (
    <div className="step-card">
      <div className="step-eyebrow">Step 4 of 6</div>
      <div className="step-title">Who are your competitors?</div>
      <div className="step-subtitle">
        Optional — add competitors for each product line you're tracking.
      </div>

      {keys.map((key) => (
        <div
          key={key}
          className={skippedProductLines.includes(key) ? 'wiz-section-disabled' : ''}
        >
          <div className="wiz-section-label">
            {key === 'brand' ? 'BRAND' : key.toUpperCase()}
          </div>
          <TagInput
            tags={competitors[key] ?? []}
            onChange={(tags) => onChange(key, tags)}
            placeholder="e.g. Competitor Name"
            hint="Press Enter or comma to add each competitor"
          />
        </div>
      ))}

      <div className="wiz-btn-actions">
        <button className="wiz-btn-secondary" onClick={onBack} type="button">Back</button>
        <button className="wiz-btn-primary" onClick={onNext} type="button">Continue</button>
      </div>
    </div>
  )
}

// ── Step 5: Models ─────────────────────────────────────────────────────────

function StepModels({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="step-card">
      <div className="step-eyebrow">Step 5 of 6</div>
      <div className="step-title">Choose your analysis model</div>
      <div className="step-subtitle">
        More models coming soon. GPT-4o is selected by default.
      </div>

      <div className="wiz-llm-grid">
        {LLM_CARDS.map((card) => (
          <div
            key={card.id}
            className={`wiz-llm-card${!card.locked ? ' selected' : ''}`}
          >
            <div className="wiz-llm-card-name">{card.name}</div>
            <div className="wiz-llm-card-desc">{card.desc}</div>
            {card.locked && (
              <span className="wiz-coming-soon">Coming soon</span>
            )}
          </div>
        ))}
      </div>

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

// ── Step 6: Review ─────────────────────────────────────────────────────────

function StepReview({
  state,
  submitting,
  onSubmit,
  onBack,
  onEditStep,
}: {
  state: WizardState
  submitting: boolean
  onSubmit: () => void
  onBack: () => void
  onEditStep: (step: number) => void
}) {
  const brandClaimsCount = state.claims.brand.length
  const productClaimEntries = state.products.map((p) => ({
    name: p,
    count: (state.claims.products[p] ?? []).length,
  }))
  const hasAnyClaims =
    brandClaimsCount > 0 || productClaimEntries.some((e) => e.count > 0)

  const activeProducts = state.products.filter(
    (p) => !state.skippedProductLines.includes(p)
  )
  const skippedProducts = state.products.filter((p) =>
    state.skippedProductLines.includes(p)
  )

  return (
    <div className="step-card">
      <div className="step-eyebrow">Step 6 of 6</div>
      <div className="step-title">Review your setup</div>
      <div className="step-subtitle">
        Everything looks good? Launch Surfaced to start tracking.
      </div>

      <div className="wiz-review-section">
        <div className="wiz-review-label">
          BRAND NAME
          <button className="wiz-edit-link" onClick={() => onEditStep(1)} type="button">
            Edit
          </button>
        </div>
        <div className="wiz-review-value">{state.brand}</div>
      </div>

      <div className="wiz-review-section">
        <div className="wiz-review-label">
          PRODUCT LINES
          <button className="wiz-edit-link" onClick={() => onEditStep(2)} type="button">
            Edit
          </button>
        </div>
        <div className="wiz-review-value">
          {state.products.length > 0 ? (
            <>
              <div>Tracking: {activeProducts.length > 0 ? activeProducts.join(', ') : 'None'}</div>
              {skippedProducts.length > 0 && (
                <div>Skipped: {skippedProducts.join(', ')}</div>
              )}
            </>
          ) : (
            <span className="wiz-review-empty">None added</span>
          )}
        </div>
      </div>

      <div className="wiz-review-section">
        <div className="wiz-review-label">
          CLAIMS
          <button className="wiz-edit-link" onClick={() => onEditStep(3)} type="button">
            Edit
          </button>
        </div>
        <div className="wiz-review-value">
          {hasAnyClaims ? (
            <>
              <div>Brand: {brandClaimsCount} claim(s)</div>
              {productClaimEntries.map((e) => (
                <div key={e.name}>
                  {e.name}: {e.count} claim(s)
                </div>
              ))}
            </>
          ) : (
            <span className="wiz-review-empty">None added</span>
          )}
        </div>
      </div>

      <div className="wiz-review-section">
        <div className="wiz-review-label">
          COMPETITORS
          <button className="wiz-edit-link" onClick={() => onEditStep(4)} type="button">
            Edit
          </button>
        </div>
        <div className="wiz-review-value">
          {state.products.length > 0 ? (
            state.products.map((product) => (
              <div key={product}>
                {product}: {(state.competitors[product] ?? []).length} competitor(s)
              </div>
            ))
          ) : (
            <span className="wiz-review-empty">None added</span>
          )}
        </div>
      </div>

      <div className="wiz-review-section">
        <div className="wiz-review-label">
          ANALYSIS MODEL
          <button className="wiz-edit-link" onClick={() => onEditStep(5)} type="button">
            Edit
          </button>
        </div>
        <div className="wiz-review-value">GPT-4o</div>
      </div>

      <div className="wiz-btn-actions">
        <button className="wiz-btn-secondary" onClick={onBack} type="button">
          Back
        </button>
        <button
          className="wiz-btn-primary"
          onClick={onSubmit}
          disabled={submitting}
          type="button"
        >
          {submitting ? 'Setting up...' : 'Launch Surfaced'}
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

  // Bypass check: if brand_name already set, redirect to dashboard (unless ?force=true)
  useEffect(() => {
    const forceShow = new URLSearchParams(window.location.search).get('force') === 'true'
    if (forceShow) { setReady(true); return }
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

  // Competitors reconciliation: sync products into competitors on step 4 entry
  useEffect(() => {
    if (currentStep !== 4) return
    setState((prev) => {
      const next = { ...prev, competitors: { ...prev.competitors } }
      // Remove keys for product lines no longer in state.products
      Object.keys(next.competitors).forEach((p) => {
        if (p !== 'brand' && !next.products.includes(p)) delete next.competitors[p]
      })
      // Add empty entry for each product line not yet in competitors
      if (next.products.length === 0) {
        if (!next.competitors['brand']) next.competitors['brand'] = []
      } else {
        next.products.forEach((p) => {
          if (!next.competitors[p]) next.competitors[p] = []
        })
      }
      return next
    })
  }, [currentStep])

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const payload = {
        brand_name: state.brand,
        claims: buildClaimsPayload(state),
        competitors: state.competitors,
        product_lines: state.products,
        skipped_product_lines: state.skippedProductLines,
        llms: state.llms,
      }
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Config save failed')
      router.replace('/dashboard')
    } catch (err) {
      console.error('Wizard submit failed:', err)
      setSubmitting(false)
      // Don't crash — user can retry by clicking Launch again
    }
  }

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
                  skippedProductLines={state.skippedProductLines}
                  onChange={(products) =>
                    setState((prev) => ({
                      ...prev,
                      products,
                      // Remove any skipped lines that are no longer in products
                      skippedProductLines: prev.skippedProductLines.filter((s) =>
                        products.includes(s)
                      ),
                    }))
                  }
                  onToggleSkip={(product) =>
                    setState((prev) => ({
                      ...prev,
                      skippedProductLines: prev.skippedProductLines.includes(product)
                        ? prev.skippedProductLines.filter((s) => s !== product)
                        : [...prev.skippedProductLines, product],
                    }))
                  }
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                />
              )}
              {currentStep === 3 && (
                <StepClaims
                  products={state.products}
                  skippedProductLines={state.skippedProductLines}
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
                  products={state.products}
                  skippedProductLines={state.skippedProductLines}
                  competitors={state.competitors}
                  onChange={(product, tags) =>
                    setState((prev) => ({
                      ...prev,
                      competitors: { ...prev.competitors, [product]: tags },
                    }))
                  }
                  onNext={() => setCurrentStep(5)}
                  onBack={() => setCurrentStep(3)}
                />
              )}
              {currentStep === 5 && (
                <StepModels
                  onNext={() => setCurrentStep(6)}
                  onBack={() => setCurrentStep(4)}
                />
              )}
              {currentStep === 6 && (
                <StepReview
                  state={state}
                  submitting={submitting}
                  onSubmit={handleSubmit}
                  onBack={() => setCurrentStep(5)}
                  onEditStep={(step) => setCurrentStep(step)}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
