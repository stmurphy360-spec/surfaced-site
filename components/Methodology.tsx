const stats = [
  { num: '5×3', label: 'Prompt variants × independent runs per report' },
  { num: '15',  label: 'Data points behind every visibility score' },
  { num: '1×',  label: 'What a single manual ChatGPT check gives you' },
]

const pillClasses = {
  mentioned:       'bg-green-100 text-green-700',
  'not-mentioned': 'bg-gray-100 text-subtle',
  competitor:      'bg-blue-100 text-ocean',
} as const

type PillType = keyof typeof pillClasses

interface Pill {
  label: string
  type: PillType
}

interface PromptRow {
  id: string
  text: string
  pills: Pill[]
}

const promptRows: PromptRow[] = [
  {
    id: 'P1',
    text: 'Which financial apps do people trust for long-term investing?',
    pills: [
      { label: 'Meridian mentioned', type: 'mentioned' },
      { label: 'Robinhood mentioned', type: 'competitor' },
    ],
  },
  {
    id: 'P2',
    text: 'What investment platforms are recommended for beginners?',
    pills: [
      { label: 'Meridian mentioned', type: 'mentioned' },
      { label: 'Betterment mentioned', type: 'competitor' },
    ],
  },
  {
    id: 'P3',
    text: 'Best robo-advisors for millennials with moderate risk tolerance',
    pills: [
      { label: 'Meridian not mentioned', type: 'not-mentioned' },
      { label: 'Acorns mentioned', type: 'competitor' },
    ],
  },
  {
    id: 'P4',
    text: 'Which apps have transparent fee structures for everyday investors?',
    pills: [
      { label: 'Meridian mentioned', type: 'mentioned' },
    ],
  },
  {
    id: 'P5',
    text: 'Top investment platforms reviewed by financial advisors',
    pills: [
      { label: 'Meridian mentioned', type: 'mentioned' },
      { label: 'Schwab mentioned', type: 'competitor' },
    ],
  },
]

const resultBars = [
  { label: 'This run', fraction: '4/5', pct: 80 },
  { label: 'All 15 runs', fraction: '11/15', pct: 73 },
]

export function Methodology() {
  return (
    <section id="how-it-works" className="bg-cream py-14 border-t border-gray-200">
      <span id="methodology" />
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-2xl font-semibold text-ink mb-8">How we measure it</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* Left: stat block */}
          <div>
            <p className="text-base text-subtle leading-relaxed mb-6">
              Every Surfaced score is built on 15 independent data points — 5 distinct prompt
              variants, each run 3 times. That removes single-prompt noise and gives you a
              reproducible visibility number you can track over time.
            </p>
            <div className="flex flex-wrap gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.num}
                  className="flex-1 min-w-[140px] bg-white border border-gray-200 rounded-lg px-5 py-5"
                >
                  <p className="font-mono text-3xl font-bold text-ocean tracking-tight mb-1">{stat.num}</p>
                  <p className="text-sm text-subtle leading-snug">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: prompt log illustration */}
          <div
            data-testid="prompt-log"
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            {/* Header bar */}
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="font-mono text-xs font-semibold text-ink">Prompt log — Meridian Finance</span>
              <span className="font-mono text-xs text-subtle">Run 3 of 3 · Mar 9, 2026</span>
            </div>

            {/* Prompt rows */}
            <div className="px-4 py-3">
              {promptRows.map((row) => (
                <div
                  key={row.id}
                  data-testid="prompt-row"
                  className="flex items-start gap-2.5 py-2.5 border-b border-gray-200 last:border-0 last:pb-0"
                >
                  <span className="font-mono text-xs text-subtle min-w-[20px] pt-px">{row.id}</span>
                  <div>
                    <p className="text-sm text-subtle leading-snug">{row.text}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {row.pills.map((pill) => (
                        <span
                          key={pill.label}
                          className={`font-mono text-[10px] font-medium px-1.5 py-0.5 rounded ${pillClasses[pill.type]}`}
                        >
                          {pill.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Result bars */}
            <div className="px-4 pt-3 pb-4 border-t border-gray-200">
              {resultBars.map((bar) => (
                <div key={bar.label} className="flex items-center gap-3 mt-3 first:mt-0">
                  <span className="text-xs text-subtle min-w-[80px]">{bar.label}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-ocean rounded-full" style={{ width: `${bar.pct}%` }} />
                  </div>
                  <span className="font-mono text-sm font-bold text-ink min-w-[36px] text-right">{bar.fraction}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
