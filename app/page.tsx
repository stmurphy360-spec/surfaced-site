import { Nav } from '@/components/Nav'
import { Wordmark } from '@/components/Wordmark'
import { EmailForm } from '@/components/EmailForm'
import { HeroSection } from '@/components/HeroSection'
import { DashboardPreview } from '@/components/DashboardPreview'
import { ThreeDimensions } from '@/components/ThreeDimensions'
import { Methodology } from '@/components/Methodology'

export default function Home() {
  return (
    <>
      <Nav />

      <HeroSection />
      <DashboardPreview />

      <ThreeDimensions />
      <Methodology />

      <section id="cta" data-testid="section-cta" className="w-full bg-ocean py-20 md:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 mb-8">
            <span className="block h-2 w-2 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
            <span className="font-body text-sm text-cream/90">AI answers are forming brand impressions right now</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-cream leading-tight mb-4">
            The brands that understand their AI presence in 2026 won&apos;t be scrambling in 2027.
          </h2>
          <p className="font-body text-cream/80 text-lg mb-10">
            Surfaced is in early access. Request a slot now.
          </p>
          <EmailForm />
          <p className="font-body text-xs text-cream/60 mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1">
            <span>No credit card required</span>
            <span aria-hidden="true">·</span>
            <span>First report delivered in 48 hours</span>
            <span aria-hidden="true">·</span>
            <span>Cancel anytime</span>
          </p>
        </div>
      </section>

      <footer className="border-t border-border bg-bg">
        <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <Wordmark />
          <div className="flex gap-6">
            <a href="/privacy" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Privacy</a>
            <a href="/terms" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Terms</a>
            <a href="#cta" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </>
  )
}
