import { NextRequest, NextResponse } from 'next/server'
import { api, type RunRequest } from '@/lib/api-client'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RunRequest
    const { data, status } = await api.triggerRun(body)
    return NextResponse.json(data, { status })
  } catch {
    return NextResponse.json({ error: 'FastAPI unreachable' }, { status: 503 })
  }
}
