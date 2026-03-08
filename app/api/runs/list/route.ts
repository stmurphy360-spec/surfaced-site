import { NextResponse } from 'next/server'

const PYTHON_API = process.env.PYTHON_API_URL ?? 'http://localhost:8000'
const PYTHON_API_SECRET = process.env.PYTHON_API_SECRET ?? ''

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') ?? ''
    const url = date
      ? `${PYTHON_API}/runs?date=${encodeURIComponent(date)}`
      : `${PYTHON_API}/runs`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${PYTHON_API_SECRET}` },
      cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'FastAPI unreachable' }, { status: 503 })
  }
}
