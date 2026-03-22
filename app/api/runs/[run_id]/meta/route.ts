import { NextResponse } from 'next/server'

const PYTHON_API = process.env.PYTHON_API_URL ?? 'http://localhost:8000'
const PYTHON_API_SECRET = process.env.PYTHON_API_SECRET ?? ''

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ run_id: string }> }
) {
  const { run_id } = await params
  try {
    const res = await fetch(`${PYTHON_API}/runs/${run_id}/meta`, {
      headers: { Authorization: `Bearer ${PYTHON_API_SECRET}` },
      cache: 'no-store',
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Meta not found' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'FastAPI unreachable' }, { status: 503 })
  }
}
