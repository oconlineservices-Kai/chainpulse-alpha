import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * CSP violation report endpoint
 * Browsers POST JSON here when they encounter CSP violations.
 */
export async function POST(req: NextRequest) {
  try {
    const report = await req.json()
    const violation = report['csp-report'] ?? report
    
    // Log violation (in production, send to your monitoring service)
    console.warn('[CSP Violation]', JSON.stringify({
      documentUri: violation['document-uri'],
      violatedDirective: violation['violated-directive'],
      blockedUri: violation['blocked-uri'],
      sourceFile: violation['source-file'],
      lineNumber: violation['line-number'],
      timestamp: new Date().toISOString(),
    }))
    
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
