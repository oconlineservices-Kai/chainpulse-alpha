/**
 * Auth Request Utility — extracts authenticated user from request cookies.
 * Uses hardcoded cookie names to avoid @auth/core internal import issues.
 */
import type { NextRequest } from 'next/server'
import { decode } from '@auth/core/jwt'

// NextAuth v5 / Auth.js v5 cookie names (hardcoded to avoid deep imports)
const SESSION_TOKEN_COOKIE = '__Secure-authjs.session-token'
const SESSION_TOKEN_COOKIE_DEV = 'authjs.session-token'

export interface RequestUser {
  id: string
  email: string
  name?: string
  isAdmin?: boolean
  premiumStatus?: string
  credits?: number
  emailVerified?: boolean
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const result: Record<string, string> = {}
  if (!cookieHeader) return result
  for (const pair of cookieHeader.split(';')) {
    const eqIdx = pair.indexOf('=')
    if (eqIdx === -1) continue
    const key = pair.slice(0, eqIdx).trim()
    const val = pair.slice(eqIdx + 1).trim()
    if (key) result[key] = val
  }
  return result
}

export async function getRequestSession(req: NextRequest): Promise<RequestUser | null> {
  try {
    const rawCookie = req.headers.get('cookie') ?? ''
    const cookies = parseCookies(rawCookie)
    const tokenCookie = cookies[SESSION_TOKEN_COOKIE] ?? cookies[SESSION_TOKEN_COOKIE_DEV]

    // DEBUG: log cookie info
    const cookieKeys = Object.keys(cookies)
    const chunkedKeys = cookieKeys.filter(k => k.startsWith(SESSION_TOKEN_COOKIE))
    console.log('[auth-request-debug] cookie header length:', rawCookie.length)
    console.log('[auth-request-debug] cookie names:', JSON.stringify(cookieKeys))
    console.log('[auth-request-debug] exact match found:', SESSION_TOKEN_COOKIE in cookies)
    console.log('[auth-request-debug] dev match found:', SESSION_TOKEN_COOKIE_DEV in cookies)
    console.log('[auth-request-debug] chunked cookies found:', JSON.stringify(chunkedKeys))
    console.log('[auth-request-debug] token value (first 30):', tokenCookie ? tokenCookie.substring(0, 30) + '...' : 'null')

    if (!tokenCookie) {
      console.log('[auth-request-debug] NO TOKEN COOKIE FOUND - returning null')
      return null
    }

    const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
    if (!secret) { 
      console.error('[auth-request] No AUTH_SECRET or NEXTAUTH_SECRET'); 
      console.log('[auth-request-debug] AUTH_SECRET present:', !!process.env.AUTH_SECRET)
      console.log('[auth-request-debug] NEXTAUTH_SECRET present:', !!process.env.NEXTAUTH_SECRET)
      return null 
    }

    // Determine the salt from which cookie name was actually found.
    // The JWT was ENCODED using the cookie name as the salt (NextAuth does this internally).
    // So we must decode with the SAME salt that was used during encoding.
    const foundInCookie = cookies[SESSION_TOKEN_COOKIE]
      ? SESSION_TOKEN_COOKIE
      : SESSION_TOKEN_COOKIE_DEV

    console.log('[auth-request-debug] Secret found (first 5 chars):', secret.substring(0, 5) + '...')
    console.log('[auth-request-debug] Attempting decode with salt:', foundInCookie, '(matched cookie name)')

    const payload = await decode({ token: tokenCookie, secret, salt: foundInCookie })
    
    console.log('[auth-request-debug] Decode result:', payload ? 'SUCCESS - email: ' + payload.email + ', sub: ' + (payload.sub ?? 'none') : 'NULL/FAILED')
    console.log('[auth-request-debug] Payload keys:', payload ? Object.keys(payload).join(', ') : 'N/A')

    if (!payload?.email) {
      console.log('[auth-request-debug] Decode returned payload but no email field')
      return null
    }

    return {
      id:        payload.sub ?? (payload as any).id as string,
      email:     payload.email as string,
      name:      payload.name as string | undefined,
      isAdmin:   (payload as any).isAdmin as boolean | undefined,
      premiumStatus: (payload as any).premiumStatus as string | undefined ?? 'free',
      credits:   (payload as any).credits as number | undefined ?? 0,
      emailVerified: (payload as any).emailVerified as boolean | undefined ?? false,
    }
  } catch (err) {
    console.error('[auth-request] Failed to decode session:', err)
    return null
  }
}

export async function getRequestEmail(req: NextRequest): Promise<string | null> {
  const user = await getRequestSession(req)
  return user?.email ?? null
}
