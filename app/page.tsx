import { Wordmark } from '@/components/Wordmark'
import { EmailForm } from '@/components/EmailForm'

export default function Home() {
  return (
    <>
      <nav className="mx-auto max-w-2xl px-6 py-6">
        <Wordmark />
      </nav>

      <section className="mx-auto max-w-2xl px-6 pt-12 pb-16 md:pt-16 md:pb-20">
        <h1 className="font-display text-5xl md:text-6xl text-ink leading-tight tracking-tight mb-6">
          Know exactly how your brand appears in AI answers.
        </h1>
        <p className="font-body text-subtle text-lg leading-relaxed mb-8">
          See the actual responses — where your brand appeared, how you ranked, and where competitors showed up instead. Real data, not a score.
        </p>
        <EmailForm />
        <p className="mt-3 text-xs text-subtle">Early access is limited.</p>
        <p className="mt-1 text-xs text-subtle">No spam. Unsubscribe any time.</p>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-16 md:pb-20">
        <p className="font-body text-ink text-base leading-relaxed">
          We track how your brand appears in AI-generated answers — the search results your customers are already getting, before they ever visit a website. You see exactly where your brand shows up, where competitors appear instead, and how that changes week over week. The brands mapping their AI presence today will be a full step ahead when leadership asks the question.
        </p>
      </section>

      <section className="w-full bg-ocean py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="font-display text-3xl text-white mb-10">How it works</h2>
          <div className="space-y-4">
            <div className="rounded-xl bg-cream px-6 py-5 shadow-sm">
              <p className="font-body text-xs font-semibold text-subtle uppercase tracking-widest mb-1">01</p>
              <p className="font-body font-bold text-ink text-base mb-1">Monitor</p>
              <p className="font-body text-ink/80 text-sm leading-relaxed">See where your brand appears in AI answers — and where it doesn&apos;t.</p>
            </div>
            <div className="rounded-xl bg-cream px-6 py-5 shadow-sm">
              <p className="font-body text-xs font-semibold text-subtle uppercase tracking-widest mb-1">02</p>
              <p className="font-body font-bold text-ink text-base mb-1">Score</p>
              <p className="font-body text-ink/80 text-sm leading-relaxed">Understand how your brand comes through — and how competitors show up instead.</p>
            </div>
            <div className="rounded-xl bg-cream px-6 py-5 shadow-sm">
              <p className="font-body text-xs font-semibold text-subtle uppercase tracking-widest mb-1">03</p>
              <p className="font-body font-bold text-ink text-base mb-1">Report</p>
              <p className="font-body text-ink/80 text-sm leading-relaxed">Get a weekly snapshot to track how your brand&apos;s position changes over time.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-2xl px-6 py-8">
        <p className="font-body text-xs text-subtle">© 2026 Surfaced</p>
      </footer>
    </>
  )
}
