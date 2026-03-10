interface DimensionProps {
  num: string
  title: string
  description: string
  exampleLabel: string
  exampleValue: string
  badgeText: string
  badgeClass: string
}

function DimensionCard({
  num,
  title,
  description,
  exampleLabel,
  exampleValue,
  badgeText,
  badgeClass,
}: DimensionProps) {
  return (
    <div className="bg-white p-10 hover:bg-gray-50 transition-colors">
      <p className="font-mono text-xs text-subtle uppercase tracking-widest mb-5">{num}</p>
      <h3 className="text-xl font-bold text-ink mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-subtle leading-relaxed mb-5">{description}</p>
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs font-semibold uppercase tracking-wider text-subtle mb-1">{exampleLabel}</p>
        <p className="font-mono text-sm font-medium text-ink mb-2">{exampleValue}</p>
        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${badgeClass}`}>
          {badgeText}
        </span>
      </div>
    </div>
  )
}

const dimensions: DimensionProps[] = [
  {
    num: '01',
    title: 'Visibility',
    description:
      'Track how often your brand is mentioned across AI-generated answers for your target queries — and how that compares to competitors.',
    exampleLabel: 'Meridian Finance — this week',
    exampleValue: 'Mentioned in 11 of 15 runs',
    badgeText: '73% mention rate',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  {
    num: '02',
    title: 'Sentiment',
    description:
      'Understand whether AI responses describe your brand positively, neutrally, or negatively when you are mentioned.',
    exampleLabel: 'Meridian Finance — this week',
    exampleValue: '9 positive · 2 neutral · 0 negative',
    badgeText: '82% positive sentiment',
    badgeClass: 'bg-green-100 text-green-700',
  },
  {
    num: '03',
    title: 'Message Match',
    description:
      'Measure how often the AI affirms your specific brand claims — not just that you were mentioned, but whether your story came through.',
    exampleLabel: 'Meridian Finance — this week',
    exampleValue: '4 of 5 claims affirmed per mention',
    badgeText: '94% message match',
    badgeClass: 'bg-amber-100 text-amber-700',
  },
]

export function ThreeDimensions() {
  return (
    <section id="what-we-measure" className="bg-white py-24">
      {/* Scroll anchor for nav link #dimensions */}
      <span id="dimensions" className="sr-only" />
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="font-sans text-3xl font-bold text-ink tracking-tight mb-12">
          What we measure
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
          {dimensions.map((dim) => (
            <DimensionCard key={dim.num} {...dim} />
          ))}
        </div>
      </div>
    </section>
  )
}
