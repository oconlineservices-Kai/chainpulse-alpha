# AGENT_LOGS.md — ChainPulse Alpha SEV-1 Debug

## Session: SEV-1-ChainPulse-Debug
**Date:** 2026-05-11
**Agent:** Senior Dev Agent (Subagent)

---

## Root Cause Analysis

### Issue 1: Admin Authentication Failing

**Root Cause:** The `ADMIN_EMAIL` environment variable in production was set to `kmaity.work@gmail.com`, but this user **does not exist in the database**. Only `admin@chainpulsealpha.com` exists with `premium_status='admin'` and a valid bcrypt password hash. The auth code uses `user.email === process.env.ADMIN_EMAIL` to determine admin status.

**Breakdown:**
1. `src/lib/auth.ts:45` — `isAdmin: user.email === process.env.ADMIN_EMAIL`
2. Production `ADMIN_EMAIL=kmaity.work@gmail.com` — no such user in DB
3. User `admin@chainpulsealpha.com` has `password`, `premium_status='admin'` — login works but `isAdmin=false`
4. Admin login page at `/admin/login` → fails because `/api/admin/enhanced-stats` checks `req.auth?.user?.isAdmin`

**Fix Applied:**
- Set `ADMIN_EMAIL` Fly secret to `admin@chainpulsealpha.com`
- Verified via SSH that `process.env.ADMIN_EMAIL` now returns `admin@chainpulsealpha.com`
- Verified Prisma query confirms the user exists with proper bcrypt hash

### Issue 2: Email Delivery Failing

**Root Cause:** No email provider configured in production. **Zero** email-related secrets were set:
- No `RESEND_API_KEY`
- No `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

The email service at `/src/lib/email.ts` falls back to console logging when no provider is configured. This means no emails were ever sent — not for password resets, not for registration, not for any purpose.

**Observations:**
- `.env.backup` has Resend API key but it was never configured on Fly.io
- The deployed `Dockerfile` doesn't bake in any email secrets
- `fly.toml` doesn't specify secrets (secrets are set via `flyctl secrets set`)
- `ecosystem.config.js` has no email-related fallback values

**Fix Status:**
- ⚠️ **Requires owner action:** Set `RESEND_API_KEY` or SMTP credentials as Fly secrets
- The `sendVerificationEmail()` function was added to source code but won't deliver until a provider is configured

### Issue 3: Schema Drift (Deployed Client vs Database)

**Root Cause:** The deployed Prisma client was generated from a **newer version** of `prisma/schema.prisma` than what exists in the current source code. The deployed client expects these additional fields on the `User` model:

| Field | Type | Status in DB |
|---|---|---|
| `emailVerified` | Boolean (default false) | ✅ Added via ALTER TABLE |
| `verificationToken` | String? | ✅ Added via ALTER TABLE |
| `verificationExpires` | DateTime? | ✅ Added via ALTER TABLE |

The database already had `subscription_expires_at` column (from a prior migration that was also missing from local source).

**The deployed app was built from a different commit/branch** — it includes:
- Email verification system (send-verification, verify-email, refresh-session API routes)
- Rate limiting (5 registration attempts per IP per 15 min)
- `emailVerified` in JWT token/session callbacks
- All of these exist in the deployed `.next/` build artifact but NOT in source code

**Fix Applied:**
1. Added missing columns to database via `ALTER TABLE` directly on Fly VM
2. Updated `prisma/schema.prisma` with `emailVerified`, `verificationToken`, `verificationExpires`
3. Created migration file `prisma/migrations/20260511000000_add_email_verification/migration.sql`
4. Marked migration as applied in Prisma migrations table
5. Regenerated local Prisma client via `prisma generate`
6. Recreated all missing API routes in source code
7. Updated `auth.ts` to include `emailVerified` in JWT/session
8. Updated `next-auth.d.ts` to include `emailVerified`, `premiumStatus`, `credits`

---

## Files Changed

### Config/Infrastructure
| File | Change |
|---|---|
| Fly.io secret `ADMIN_EMAIL` | Changed from `kmaity.work@gmail.com` to `admin@chainpulsealpha.com` |

### Schema
| File | Change |
|---|---|
| `prisma/schema.prisma` | Added `emailVerified`, `verificationToken`, `verificationExpires` fields to User model |
| `prisma/migrations/20260511000000_add_email_verification/migration.sql` | New migration file for email verification columns |

### Source Code (New Files)
| File | Description |
|---|---|
| `src/app/api/auth/send-verification/route.ts` | POST endpoint to resend verification email |
| `src/app/api/auth/verify-email/route.ts` | GET endpoint to verify email via token link |
| `src/app/api/auth/refresh-session/route.ts` | GET endpoint to refresh user session data |

### Source Code (Modified)
| File | Change |
|---|---|
| `src/app/api/auth/register/route.ts` | Added email verification (generates token, creates user with `emailVerified:false`, sends verification email) |
| `src/lib/email.ts` | Added `sendVerificationEmail()` function |
| `src/lib/auth.ts` | Added `emailVerified` to authorize return, JWT token, and session callbacks; added `emailVerified` to DB refresh query |
| `src/types/next-auth.d.ts` | Added `emailVerified`, `premiumStatus`, `credits` to Session, User, and JWT types |

---

## Deployed Fixes

### ✅ Fixed: Admin Authentication
- `ADMIN_EMAIL` secret changed to `admin@chainpulsealpha.com`
- Verified match: user exists with bcrypt hash and `premium_status='admin'`
- Admin login should now work with credentials: `admin@chainpulsealpha.com`

### ✅ Fixed: Schema Drift
- Three missing columns added to `users` table:
  - `email_verified` (BOOLEAN NOT NULL DEFAULT false)
  - `verification_token` (TEXT)
  - `verification_expires` (TIMESTAMP)
- Local schema updated with mapped fields
- New Prisma migration created and marked as applied

### ✅ Fixed: Source Code Sync
- Recreated 3 missing API routes that exist in deployed build
- Updated auth.ts with email verification fields
- Added `sendVerificationEmail` to email service
- Registration now generates verification tokens

### ⚠️ Not Fixed: Email Delivery
- No Resend API key or SMTP credentials are configured in production
- Emails will only log to console until owner sets secrets
- **Action required:** Run `flyctl secrets set RESEND_API_KEY=re_xxx` or SMTP config

---

## Remaining Risks

1. **🚨 Email delivery is still broken** — Until `RESEND_API_KEY` (or SMTP credentials) are set as Fly secrets, no actual emails will be sent. The app will log email content to console but users won't receive password reset or verification emails.

2. **🟡 Source code may diverge again** — The deployed build was made from a different version of the source code. After the next redeployment (which builds from current source), the app should be in sync. But there may be other differences not yet discovered.

3. **🟢 `ADMIN_PASSWORD` env var is dead config** — Set in production and `ecosystem.config.js` but never read by the application. Not harmful, just confusing.

4. **🟢 `ecosystem.config.js` has outdated placeholder values** — Contains `AUTH_SECRET: 'CHANGE-ME-IN-PRODUCTION'` as fallback. Production overrides via Fly secrets, but if Fly secrets are ever removed, the app would fall back to weak secrets.

5. **🟢 Build-time env vars in Dockerfile** — Uses dummy values (`***`) for build-time secrets. These are only used during `next build` and don't affect runtime, but could cause build failures if Prisma attempts to connect during build for introspection.

---

## Prevention Recommendations

### 1. Implement Git-Commit Gates
- All changes must be committed to the repository before deployment
- The deployed build should be traceable to a specific commit hash
- CI/CD should use `git rev-parse HEAD` as a build tag

### 2. Environment Secret Audit
- Create a single source of truth for required secrets (e.g., a `.env.example` with all keys)
- Automate secret validation on startup — if critical secrets are missing, log a clear warning
- Implement a `/api/health` endpoint that checks all required env vars and DB connectivity

### 3. Prisma Schema Versioning
- Never manually alter the Prisma schema without creating a migration
- Use `prisma migrate dev` (development) and `prisma migrate deploy` (production)
- The migration history in `prisma/migrations/` should be the single source of truth for DB schema

### 4. CI/CD Pipeline
- Add a pre-build step that verifies `prisma generate` doesn't produce uncommitted changes
- Run `prisma validate` during CI
- After deployment, run a health check that verifies DB schema compatibility

### 5. Development Workflow
- Use feature branches — never deploy directly from a dirty working tree
- Add a pre-commit hook that runs `prisma generate` and checks for drift
- When adding Prisma fields, always commit both `schema.prisma` AND the migration SQL

### 6. Monitoring
- Set up error tracking (e.g., Sentry) to catch runtime errors like missing columns
- Add alerting for email delivery failures
- Log all authentication attempts with appropriate context

---

## Verification Steps

1. **Admin login:** https://chainpulsealpha.com/admin/login — use `admin@chainpulsealpha.com` credentials
2. **User registration:** Sign up at https://chainpulsealpha.com/register — should create user with verification token
3. **Email verification:** Admin must set `RESEND_API_KEY` before verification emails are sent
4. **Password reset:** Requires email provider configuration
5. **Schema compatibility:** All Prisma queries should now work without column errors

---

## Owner Actions Required

1. **Set Resend API key:**
   ```bash
   flyctl secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx --app chainpulse-alpha
   ```

2. **Verify admin login:**
   - Visit https://chainpulsealpha.com/admin/login
   - Login with admin@chainpulsealpha.com

3. **Redeploy from updated source:**
   ```bash
   cd /root/.openclaw/workspace/chainpulse-alpha
   flyctl deploy --app chainpulse-alpha
   ```

4. **Optional: Set SMTP as alternative to Resend:**
   ```bash
   flyctl secrets set SMTP_HOST=smtp.example.com SMTP_PORT=587 SMTP_USER=user SMTP_PASS=pass --app chainpulse-alpha
   ```
