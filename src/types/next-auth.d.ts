import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      emailVerified: boolean
      premiumStatus: string
      credits: number
    } & DefaultSession['user']
  }

  interface User {
    isAdmin?: boolean
    premiumStatus?: string
    credits?: number
    emailVerified?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    isAdmin?: boolean
    emailVerified?: boolean
    premiumStatus?: string
    credits?: number
    premiumStatusCheckedAt?: number
  }
}
