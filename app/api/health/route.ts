import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'

export async function GET() {
  try {
    const { data, status } = await api.health()
    return NextResponse.json(data, { status })
  } catch {
    return NextResponse.json({ status: 'unreachable' }, { status: 503 })
  }
}
