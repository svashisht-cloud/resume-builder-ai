import DodoPayments from 'dodopayments'

export function makeDodoClient(): DodoPayments {
  if (!process.env.DODO_PAYMENTS_API_KEY) {
    throw new Error('DODO_PAYMENTS_API_KEY is not set')
  }
  return new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: (process.env.DODO_PAYMENTS_ENV ?? 'test_mode') as 'test_mode' | 'live_mode',
  })
}

export function getAppUrl(): string {
  const url = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL
  if (!url) throw new Error('APP_URL is not set')
  return url
}
