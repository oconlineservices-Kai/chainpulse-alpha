import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import ProfileClient from './ProfileClient'

export const metadata = {
  title: 'Profile - ChainPulse Alpha',
  description: 'Manage your ChainPulse account settings, subscription, and preferences.',
}

export default async function ProfilePage() {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/login')
  }

  return <ProfileClient />
}
