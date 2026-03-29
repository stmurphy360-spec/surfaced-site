import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'

export async function POST() {
  try {
    const { data, status } = await api.triggerRun()
    return NextResponse.json(data, { status })
  } catch {
    return NextResponse.json({ error: 'FastAPI unreachable' }, { status: 503 })
  }
}
