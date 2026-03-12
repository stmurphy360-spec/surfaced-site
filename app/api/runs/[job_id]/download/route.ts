import { NextResponse } from 'next/server'

const PYTHON_API = process.env.PYTHON_API_URL ?? 'http://localhost:8000'
const PYTHON_API_SECRET = process.env.PYTHON_API_SECRET ?? ''

export async function GET(
  req: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const { job_id } = await params
  const { searchParams } = new URL(req.url)
  const file = searchParams.get('file')

  let upstreamPath: string
  if (file === 'full-data-csv') {
    upstreamPath = `/files/${job_id}/full_data.csv`
  } else if (file === 'csv-bundle') {
    upstreamPath = `/files/${job_id}/csv-bundle`
  } else if (file === 'visibility-csv') {
    upstreamPath = `/files/${job_id}/visibility.csv`
  } else if (file === 'messaging-csv') {
    upstreamPath = `/files/${job_id}/ideal_content.csv`
  } else {
    upstreamPath = `/files/${job_id}/report.html`
  }

  try {
    const res = await fetch(`${PYTHON_API}${upstreamPath}`, {
      headers: { Authorization: `Bearer ${PYTHON_API_SECRET}` },
      cache: 'no-store',
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'File not available' }, { status: res.status })
    }
    const buffer = await res.arrayBuffer()
    const contentDisposition = (file === 'full-data-csv' || file === 'csv-bundle' || file === 'visibility-csv' || file === 'messaging-csv')
      ? (res.headers.get('content-disposition') ?? 'attachment')
      : 'inline'
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'application/octet-stream',
        'Content-Disposition': contentDisposition,
      },
    })
  } catch {
    return NextResponse.json({ error: 'FastAPI unreachable' }, { status: 503 })
  }
}
