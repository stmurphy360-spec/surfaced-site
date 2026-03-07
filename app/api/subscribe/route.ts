import { NextRequest, NextResponse } from 'next/server'
import { LoopsClient, APIError } from 'loops'

const loops = new LoopsClient(process.env.LOOPS_API_KEY as string)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email: string = body?.email ?? ''
    const company: string = body?.company ?? ''

    if (!email || !company) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await loops.createContact({
      email,
      properties: {
        companyName: company,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof APIError) {
      if (error.statusCode === 409) {
        // Duplicate email — silent success per spec
        return NextResponse.json({ success: true })
      }
    }
    console.error('Loops API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
