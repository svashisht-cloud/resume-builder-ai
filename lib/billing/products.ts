export type DodoProduct = 'pro_monthly' | 'pro_annual' | 'resume_pack' | 'resume_pack_plus'

export const SUBSCRIPTION_PRODUCTS: DodoProduct[] = ['pro_monthly', 'pro_annual']
export const CREDIT_PRODUCTS: DodoProduct[] = ['resume_pack', 'resume_pack_plus']

const PRODUCT_ENV_KEYS: Record<DodoProduct, string> = {
  pro_monthly:      'DODO_PRODUCT_ID_PRO_MONTHLY',
  pro_annual:       'DODO_PRODUCT_ID_PRO_ANNUAL',
  resume_pack:      'DODO_PRODUCT_ID_RESUME_PACK',
  resume_pack_plus: 'DODO_PRODUCT_ID_RESUME_PACK_PLUS',
}

export function getDodoProductId(product: DodoProduct): string {
  const key = PRODUCT_ENV_KEYS[product]
  const id = process.env[key]
  if (!id) throw new Error(`Missing env var: ${key}`)
  return id
}

export function getProductFromDodoId(dodoId: string): DodoProduct | null {
  for (const [product, key] of Object.entries(PRODUCT_ENV_KEYS)) {
    if (process.env[key] === dodoId) return product as DodoProduct
  }
  return null
}

export function isValidDodoProduct(value: string): value is DodoProduct {
  return Object.keys(PRODUCT_ENV_KEYS).includes(value)
}
