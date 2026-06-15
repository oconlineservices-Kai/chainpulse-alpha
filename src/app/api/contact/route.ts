import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Log the contact submission (for now — will be replaced with email sending)
    console.log('[contact] submission received:', { name, email, subject, messageLength: message.length })

    // For now, return success — email sending infrastructure can be added later
    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out! We\'ll get back to you within 24 hours.',
    })
  } catch (error) {
    console.error('[contact] error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
