import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ run_id: string }> }
) {
  const { run_id } = await params
  try {
    const { data, status } = await api.jobStatus(run_id)
    return NextResponse.json(data, { status })
  } catch {
    return NextResponse.json({ error: 'FastAPI unreachable' }, { status: 503 })
  }
}
