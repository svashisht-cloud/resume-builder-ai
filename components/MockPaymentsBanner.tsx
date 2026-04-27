export default function MockPaymentsBanner() {
  if (process.env.ENABLE_MOCK_PAYMENTS !== 'true') return null
  return (
    <div className="w-full bg-warning-bg py-1.5 text-center text-xs text-warning-fg">
      MOCK PAYMENTS ENABLED — not for production use
    </div>
  )
}
