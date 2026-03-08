export const metadata = {
  robots: 'noindex',
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ run_id: string }>
}) {
  const { run_id } = await params

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-subtle/20 bg-cream shrink-0">
        <div className="flex items-center gap-4">
          <a
            href="/dashboard"
            className="font-body text-sm text-ink/60 hover:text-ink transition-colors"
          >
            &larr; Dashboard
          </a>
          <span className="font-body text-sm text-ink/40">{run_id}</span>
        </div>
        <a
          href={`/api/runs/${run_id}/download?file=csv-bundle`}
          download
          className="rounded-md bg-ocean px-4 py-2 font-body text-sm font-semibold text-cream hover:bg-ocean-dark transition-colors"
        >
          Download CSVs
        </a>
      </div>

      {/* Full-width iframe for HTML report */}
      <iframe
        src={`/api/runs/${run_id}/download?file=report`}
        className="flex-1 w-full border-none"
        title={`Visibility report — ${run_id}`}
      />
    </div>
  )
}
