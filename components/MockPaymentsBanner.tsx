export default function MockPaymentsBanner() {
  if (process.env.ENABLE_MOCK_PAYMENTS !== 'true') return null
  return (
    <div className="w-full bg-amber-500/10 py-1.5 text-center text-xs text-amber-400">
      MOCK PAYMENTS ENABLED — not for production use
    </div>
  )
}
