import { NextResponse } from 'next/server'
import { api } from '@/lib/api-client'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ run_id: string }> }
) {
  const { run_id } = await params
  const { searchParams } = new URL(req.url)
  const file = searchParams.get('file')

  let filePath: string
  if (file === 'full-data-csv') filePath = 'full_data.csv'
  else if (file === 'csv-bundle') filePath = 'csv-bundle'
  else if (file === 'visibility-csv') filePath = 'visibility.csv'
  else if (file === 'messaging-csv') filePath = 'ideal_content.csv'
  else if (file === 'print') filePath = 'print'
  else filePath = 'report.html'

  try {
    const res = await api.downloadFile(run_id, filePath)
    if (!res.ok) {
      return NextResponse.json({ error: 'File not available' }, { status: res.status })
    }
    const buffer = await res.arrayBuffer()
    const contentDisposition = ['full-data-csv', 'csv-bundle', 'visibility-csv', 'messaging-csv'].includes(file ?? '')
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
