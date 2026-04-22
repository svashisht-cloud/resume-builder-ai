import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

export const runtime = 'nodejs'

const BodySchema = z.object({
  userId: z.string().uuid(),
  count: z.number().int().min(1).max(20),
  reason: z.enum(['admin_grant', 'courtesy', 'bug_compensation']),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single<{ is_admin: boolean }>()

  if (!profile?.is_admin) return Response.json({ error: 'forbidden' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid request body.' }, { status: 400 })

  const { userId, count, reason } = parsed.data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (getAdminClient() as any).rpc('admin_grant_credits', {
    p_user_id: userId,
    p_count: count,
    p_reason: reason,
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
