import NextAuth from 'next-auth'
import { prisma } from '@/lib/prisma'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  // No PrismaAdapter — using JWT strategy which doesn't need DB session tables
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.email.split('@')[0],
          isAdmin: user.email === process.env.ADMIN_EMAIL || user.premiumStatus === 'admin',
          premiumStatus: user.premiumStatus ?? 'free'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
        token.premiumStatus = (user as any).premiumStatus ?? 'free'
        token.email = user.email
      }

      // Always refresh premiumStatus from DB to reflect payment changes immediately.
      // This runs on every request that touches the JWT (session fetch, etc.)
      // We throttle it: only re-query if last check was > 2 minutes ago.
      const now = Date.now()
      const lastCheck = (token.premiumStatusCheckedAt as number) ?? 0
      const shouldRefresh = trigger === 'update' || now - lastCheck > 2 * 60 * 1000

      // Skip DB refresh during Next.js build phase (no real DB connection available)
      const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.NEON_DATABASE_URL?.startsWith('postgresql://build:')

      if (shouldRefresh && token.email && !isBuildPhase) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { premiumStatus: true, credits: true, premiumExpiresAt: true }
          })
          if (dbUser) {
            // Check if premium has expired
            let status = dbUser.premiumStatus
            if (
              status === 'premium' &&
              dbUser.premiumExpiresAt &&
              dbUser.premiumExpiresAt < new Date()
            ) {
              status = 'free'
              // Update DB to reflect expiry
              await prisma.user.update({
                where: { email: token.email as string },
                data: { premiumStatus: 'free' }
              })
            }
            token.premiumStatus = status
            token.credits = dbUser.credits
            token.premiumStatusCheckedAt = now
          }
        } catch {
          // DB unavailable — keep cached value
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
        ;(session.user as any).premiumStatus = token.premiumStatus as string
        ;(session.user as any).credits = token.credits as number ?? 0
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    // Shorten max age so sessions expire naturally if premium lapses
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
})
