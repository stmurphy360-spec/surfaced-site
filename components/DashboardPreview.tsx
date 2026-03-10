// No 'use client' — Server Component

const METRIC_CARDS = [
  {
    label: 'Visibility Score',
    value: '82%',
    delta: '↑ +12 pts vs last run',
    deltaVariant: 'up' as const,
  },
  {
    label: 'Sentiment',
    value: '+0.4',
    delta: '↑ Positive trend',
    deltaVariant: 'up' as const,
  },
  {
    label: 'Message Match',
    value: '94%',
    delta: '↑ +6 pts vs last run',
    deltaVariant: 'up' as const,
  },
]

function MetricCard({ label, value, delta, deltaVariant }: {
  label: string
  value: string
  delta: string
  deltaVariant: 'up' | 'down' | 'neutral'
}) {
  const deltaClasses = {
    up: 'bg-green-light text-green',
    down: 'bg-red-light text-red',
    neutral: 'bg-bg-subtle text-subtle',
  }[deltaVariant]

  return (
    <div className="bg-white border border-border rounded-lg p-4 flex-1 min-w-0">
      <div className="text-[11px] text-tertiary font-medium mb-2 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-ink tracking-tight mb-2">{value}</div>
      <div className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded ${deltaClasses}`}>
        {delta}
      </div>
    </div>
  )
}

export function DashboardPreview() {
  return (
    <section id="preview" className="bg-bg-subtle py-10 md:py-12">
      <div className="mx-auto max-w-2xl px-6">
        {/* Section label */}
        <p className="text-xs font-medium text-subtle mb-6 uppercase tracking-widest">
          Weekly report — Meridian Finance
        </p>

        {/* Flat metric cards — no device/browser frame per design decision */}
        <div className="flex gap-4 flex-wrap">
          {METRIC_CARDS.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}
