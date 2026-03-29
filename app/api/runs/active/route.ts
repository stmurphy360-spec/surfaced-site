import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'

export async function GET() {
  try {
    const { data, status } = await api.activeJob()
    return NextResponse.json(data, { status })
  } catch {
    return NextResponse.json({ error: 'FastAPI unreachable' }, { status: 503 })
  }
}
