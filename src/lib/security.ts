/**
 * Security utilities for ChainPulse Alpha
 * XSS prevention, input validation, rate limiting, etc.
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  // Basic HTML escaping
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): boolean {
  // At least 8 characters, with uppercase, lowercase, number, and special char
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongRegex.test(password);
}

/**
 * Check if string contains SQL injection patterns
 */
export function hasSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b)/i,
    /(\b(OR|AND)\s+['"\d])/i,
    /(--|\/\*|\*\/|;)/,
    /(\b(WAITFOR|DELAY)\b)/i,
    /(\b(SLEEP|BENCHMARK)\b)/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Check if string contains XSS patterns
 */
export function hasXSSPatterns(input: string): boolean {
  const xssPatterns = [
    /<script\b[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /alert\s*\(/i,
    /document\./i,
    /window\./i,
    /<iframe\b[^>]*>/i,
    /<object\b[^>]*>/i,
    /<embed\b[^>]*>/i
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize user input for database queries
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Escape special characters
  sanitized = sanitized
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
  
  return sanitized;
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  
  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i % storedToken.length);
  }
  return result === 0;
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; firstAttempt: number }> = new Map();
  private readonly windowMs: number;
  private readonly maxAttempts: number;
  
  constructor(windowMs: number = 15 * 60 * 1000, maxAttempts: number = 5) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
  }
  
  isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt) {
      this.attempts.set(key, { count: 1, firstAttempt: now });
      return false;
    }
    
    // Reset if window has passed
    if (now - attempt.firstAttempt > this.windowMs) {
      this.attempts.set(key, { count: 1, firstAttempt: now });
      return false;
    }
    
    // Increment attempt count
    attempt.count++;
    
    // Check if rate limited
    if (attempt.count > this.maxAttempts) {
      return true;
    }
    
    return false;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
  
  getRemainingAttempts(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return this.maxAttempts;
    
    const now = Date.now();
    if (now - attempt.firstAttempt > this.windowMs) {
      return this.maxAttempts;
    }
    
    return Math.max(0, this.maxAttempts - attempt.count);
  }
}

/**
 * Honeypot field validation
 */
export function isHoneypotTriggered(fields: Record<string, any>): boolean {
  // Common honeypot field names
  const honeypotFields = [
    'website', 'url', 'homepage', 'phone', 'fax',
    'company', 'address', 'city', 'state', 'zip',
    'confirm_email', 'confirm_password', 'subject'
  ];
  
  return honeypotFields.some(field => {
    const value = fields[field];
    return value && value.toString().trim().length > 0;
  });
}

/**
 * Check for temporary/disposable email domains
 */
export function isTemporaryEmail(email: string): boolean {
  const tempDomains = [
    'tempmail.com', 'mailinator.com', 'guerrillamail.com',
    '10minutemail.com', 'throwawaymail.com', 'yopmail.com',
    'fakeinbox.com', 'trashmail.com', 'dispostable.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return tempDomains.some(temp => domain?.includes(temp));
}

export default {
  sanitizeHTML,
  isValidEmail,
  isStrongPassword,
  hasSQLInjection,
  hasXSSPatterns,
  sanitizeInput,
  generateCSRFToken,
  validateCSRFToken,
  RateLimiter,
  isHoneypotTriggered,
  isTemporaryEmail
};
// ── Extended exports required by register/route.ts ──────────────────────────

/**
 * Normalize and sanitize an email address (lowercase + trim).
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Return true if the domain belongs to a known temporary / disposable provider.
 */
export function isTempEmailDomain(domain: string): boolean {
  const tempDomains = [
    'tempmail.com', 'mailinator.com', 'guerrillamail.com',
    '10minutemail.com', 'throwawaymail.com', 'yopmail.com',
    'fakeinbox.com', 'trashmail.com', 'dispostable.com',
    'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
    'spam4.me', 'trashmail.at', 'trashmail.io',
  ];
  const d = domain.toLowerCase();
  return tempDomains.some(t => d === t || d.endsWith('.' + t));
}

/**
 * Validate password strength. Returns an error string or null if valid.
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/\d/.test(password)) return 'Password must contain at least one number.';
  return null;
}

// Simple in-memory rate limiter store
const rateLimitStore = new Map<string, { count: number; firstAt: number }>();

/**
 * Check rate limit. Returns true if the request is allowed.
 * @param key       Unique key (e.g. "signup:1.2.3.4")
 * @param max       Maximum allowed attempts
 * @param windowMs  Rolling window in milliseconds
 */
export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.firstAt > windowMs) {
    rateLimitStore.set(key, { count: 1, firstAt: now });
    return true;
  }

  entry.count += 1;
  if (entry.count > max) return false;
  return true;
}

/**
 * Extract the real client IP from request headers.
 */
export function getClientIP(req: Request): string {
  const forwarded = (req as any).headers?.get?.('x-forwarded-for') ??
                    (req as any).headers?.['x-forwarded-for'] ?? '';
  if (forwarded) return (forwarded as string).split(',')[0].trim();
  return '0.0.0.0';
}

/**
 * Build a rate-limit key scoped to an IP and action.
 */
export function getRateLimitKey(ip: string, action: string): string {
  return `${action}:${ip}`;
}
