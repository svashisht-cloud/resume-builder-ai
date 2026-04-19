import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppNavbar from '@/components/AppNavbar'
import EditableName from '@/components/EditableName'
import DeleteAccountButton from '@/components/DeleteAccountButton'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email, avatar_url, plan')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name ?? ''
  const email = profile?.email ?? user.email ?? ''
  const plan = profile?.plan ?? 'free'

  return (
    <>
      <AppNavbar
        user={{
          display_name: profile?.display_name ?? null,
          email: email,
          avatar_url: profile?.avatar_url ?? null,
        }}
      />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-bold text-foreground">Settings</h1>

        <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-muted">Display Name</label>
            <EditableName initialName={displayName} userId={user.id} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-muted">Email</label>
            <p className="text-sm text-foreground">{email}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-muted">Plan</label>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                plan === 'pro'
                  ? 'bg-accent/20 text-accent'
                  : 'bg-surface-raised text-muted'
              }`}
            >
              {plan === 'pro' ? 'Pro' : 'Free'}
            </span>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-red-900/50 bg-surface p-6">
          <h2 className="mb-1 text-sm font-semibold text-red-400">Danger Zone</h2>
          <p className="mb-4 text-sm text-muted">Permanently delete your account and all data.</p>
          <DeleteAccountButton />
        </div>
      </main>
    </>
  )
}
