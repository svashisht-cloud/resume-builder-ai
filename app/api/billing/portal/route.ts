export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { makeDodoClient, getAppUrl } from '@/lib/billing/dodo-client'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('dodo_customer_id')
    .eq('id', user.id)
    .single()

  const customerId = profile?.dodo_customer_id as string | null
  if (!customerId) {
    return Response.json({ error: 'No active subscription found.' }, { status: 400 })
  }

  try {
    const dodo = makeDodoClient()
    let returnUrl: string | undefined
    try { returnUrl = `${getAppUrl()}/settings` } catch { /* optional */ }

    const session = await dodo.customers.customerPortal.create(customerId, { return_url: returnUrl })
    return Response.json({ portalUrl: session.link })
  } catch (err) {
    console.error('[portal] Dodo API error:', err)
    return Response.json({ error: 'Failed to open billing portal' }, { status: 500 })
  }
}
