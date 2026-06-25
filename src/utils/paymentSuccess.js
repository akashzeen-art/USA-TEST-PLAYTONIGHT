/**
 * PayU success redirect URLs (respects Vite BASE_URL e.g. /dom/, /two/).
 */

export function buildPaymentSuccessUrl({ source, productId, phone }) {
  const rawBase = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  const params = new URLSearchParams({
    payment: 'success',
    id: String(productId ?? ''),
    phone: String(phone ?? ''),
    source: source === 'checkout' ? 'checkout' : 'home',
  })
  const pathname =
    source === 'checkout'
      ? `${rawBase}/checkout`.replace(/\/{2,}/g, '/')
      : rawBase
        ? `${rawBase}/`
        : '/'
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${window.location.origin}${normalized}?${params.toString()}`
}

/** Relative path for post-thank-you redirect (keeps deploy prefix). */
export function buildReturnUrl({ source, productId }) {
  const rawBase = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  const params = new URLSearchParams()
  if (productId != null && String(productId) !== '') {
    params.set('id', String(productId))
  }
  const query = params.toString()
  const path =
    source === 'checkout'
      ? `${rawBase}/checkout`.replace(/\/{2,}/g, '/')
      : rawBase
        ? `${rawBase}/`
        : '/'
  const normalized = path.startsWith('/') ? path : `/${path}`
  return query ? `${normalized}?${query}` : normalized
}

export function isPaymentSuccessFromSearch(search) {
  return search?.get('payment') === 'success'
}
