import { Nav } from '@/components/Nav'
import { Wordmark } from '@/components/Wordmark'
import { EmailForm } from '@/components/EmailForm'
import { HeroSection } from '@/components/HeroSection'
import { DashboardPreview } from '@/components/DashboardPreview'
import { ThreeDimensions } from '@/components/ThreeDimensions'

export default function Home() {
  return (
    <>
      <Nav />

      <HeroSection />
      <DashboardPreview />

      <ThreeDimensions />

      {/* Methodology stub — Phase 27 fills this */}
      <section id="methodology" className="py-24">
        <div className="mx-auto max-w-5xl px-6" />
      </section>

      {/* CTA stub — Phase 28 fills this */}
      <section id="cta" className="bg-bg-subtle py-24">
        <div className="mx-auto max-w-5xl px-6">
          <EmailForm />
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
