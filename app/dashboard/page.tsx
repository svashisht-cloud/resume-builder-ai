import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppNavbar from '@/components/AppNavbar'
import { DashboardShell } from '@/components/DashboardShell'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppNavbar
        user={{
          display_name: profile?.display_name ?? null,
          email: profile?.email ?? user.email ?? null,
          avatar_url: profile?.avatar_url ?? null,
        }}
      />
      <DashboardShell />
    </div>
  )
}
