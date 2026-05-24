import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const rawCookie = req.headers.get('cookie') ?? ''
  const cookies: Record<string, string> = {}
  for (const pair of rawCookie.split(';')) {
    const eqIdx = pair.indexOf('=')
    if (eqIdx === -1) continue
    const key = pair.slice(0, eqIdx).trim()
    const val = pair.slice(eqIdx + 1).trim()
    if (key) cookies[key] = key.includes('session') ? val.substring(0, 50) + '...' : '(hidden)'
  }
  return NextResponse.json({
    hasCookie: rawCookie.length > 0,
    cookieLength: rawCookie.length,
    cookieNames: Object.keys(cookies),
    previews: cookies,
    headers_all: Object.fromEntries(req.headers.entries()),
  })
}
