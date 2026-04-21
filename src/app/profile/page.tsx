export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import ProfileClient from './ProfileClient'

export const metadata = {
  title: 'Profile - ChainPulse Alpha',
  description: 'Manage your ChainPulse account settings, subscription, and preferences.',
}

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }

  return <ProfileClient />
}
