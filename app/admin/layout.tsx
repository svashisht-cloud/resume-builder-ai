import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebarNav from '@/components/admin/AdminSidebarNav'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, email, display_name')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 min-h-screen flex flex-col border-r border-border/60 bg-surface">
        <div className="px-5 py-4 border-b border-border/60">
          <span className="font-semibold text-sm tracking-wide text-muted uppercase">Admin</span>
        </div>
        <AdminSidebarNav />
        <div className="mt-auto px-5 py-4 border-t border-border/60 text-xs text-muted">
          <div className="truncate font-medium mb-1">{profile?.display_name ?? profile?.email ?? 'Admin'}</div>
          <Link href="/dashboard" className="text-accent hover:underline">← Back to app</Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
