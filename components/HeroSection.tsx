// No 'use client' — Server Component
import Link from 'next/link'

// Inline SVG checkmark — no icon library
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const PROOF_ITEMS = [
  'No scores without explanations',
  'Every prompt and response logged',
  'Week-over-week trending built in',
]

export function HeroSection() {
  return (
    <section id="hero" className="bg-cream">
      <div className="mx-auto max-w-2xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ocean bg-green-light px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-ocean animate-pulse" aria-hidden="true" />
          AI Brand Intelligence — Early Access Open
        </div>

        {/* Headline */}
        <h1 className="font-sans text-5xl md:text-6xl text-ink leading-tight tracking-tight mb-6 max-w-2xl">
          Finally know what AI says about your brand —{' '}
          <em className="not-italic text-ocean">and whether it&apos;s true.</em>
        </h1>

        {/* Subhead */}
        <p className="font-sans text-subtle text-lg leading-relaxed mb-10 max-w-xl">
          Surfaced monitors how frontier LLMs represent your brand across 15 searches per week —{' '}
          <strong className="text-ink font-semibold">visibility, sentiment, and messaging alignment</strong>{' '}
          — so you know exactly where you stand before your competitors do.
        </p>

        {/* CTA group */}
        <div className="flex items-center gap-4 flex-wrap mb-14">
          <Link
            href="#cta"
            className="inline-flex items-center justify-center px-6 py-3 bg-ocean text-white font-semibold text-sm rounded-lg hover:bg-ocean-dark transition-colors"
          >
            Request early access
          </Link>
          <Link
            href="#methodology"
            className="inline-flex items-center gap-1 text-sm font-medium text-ocean hover:text-ocean-dark transition-colors"
          >
            See how it works →
          </Link>
        </div>

        {/* Proof strip */}
        <div className="flex items-center gap-6 flex-wrap">
          {PROOF_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-subtle">
              <span className="text-subtle opacity-70">
                <CheckIcon />
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
