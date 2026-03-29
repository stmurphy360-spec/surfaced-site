import { NextRequest, NextResponse } from 'next/server'
import { api, type ConfigPayload } from '@/lib/api-client'

export async function GET() {
  try {
    const { data, status } = await api.getConfig()
    return NextResponse.json(data, { status })
  } catch {
    return NextResponse.json({ error: 'FastAPI unreachable' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ConfigPayload
    const { data, status } = await api.postConfig(body)
    return NextResponse.json(data, { status })
  } catch {
    return NextResponse.json({ error: 'FastAPI unreachable' }, { status: 503 })
  }
}
