import { NextRequest, NextResponse } from 'next/server'

const PYTHON_API = process.env.PYTHON_API_URL ?? 'http://localhost:8000'
const PYTHON_API_SECRET = process.env.PYTHON_API_SECRET ?? ''

export async function GET() {
  try {
    const res = await fetch(`${PYTHON_API}/config`, {
      headers: { Authorization: `Bearer ${PYTHON_API_SECRET}` },
      cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'FastAPI unreachable' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${PYTHON_API}/config`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PYTHON_API_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'FastAPI unreachable' }, { status: 503 })
  }
}
