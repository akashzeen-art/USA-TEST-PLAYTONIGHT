import { formatPrice } from '../utils/priceFormatter'

export type DoublePackPriceVariant = 'inline' | 'hero' | 'cart-line' | 'payment'

export interface DoublePackPriceDisplayProps {
  unitPrice: number       // API price — already the final total, no multiplication
  currency?: string       // API currency
  discountPercent?: number
  loading?: boolean
  variant?: DoublePackPriceVariant
}

/**
 * Displays the price directly from the API.
 * price = API price (backend-controlled, no frontend math)
 * originalPrice = price / (1 - discount%) for strikethrough display only
 */
export default function DoublePackPriceDisplay({
  unitPrice,
  currency = 'INR',
  discountPercent = 50,
  loading = false,
  variant = 'inline',
}: DoublePackPriceDisplayProps) {
  if (loading && !unitPrice) {
    return <span style={{ color: 'rgba(255,255,255,0.4)' }}>Loading price…</span>
  }
  if (!unitPrice) return null

  const price = unitPrice
  const originalPrice = discountPercent > 0
    ? Math.round(price / (1 - discountPercent / 100))
    : price

  if (variant === 'hero') {
    return (
      <div className="text-center mb-4">
        <span className="text-xl font-bold">
          <span className="line-through mr-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {formatPrice(originalPrice, currency)}
          </span>
          <span className="font-bold animate-pulse" style={{ color: '#ff6b35' }}>
            {formatPrice(price, currency)} ({discountPercent}% OFF)
          </span>
        </span>
      </div>
    )
  }

  if (variant === 'cart-line') {
    return (
      <div className="text-xs">
        <span className="line-through mr-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {formatPrice(originalPrice, currency)}
        </span>
        <span className="font-semibold" style={{ color: '#ff6b35' }}>
          {formatPrice(price, currency)} ({discountPercent}% OFF)
        </span>
      </div>
    )
  }

  if (variant === 'payment') {
    return (
      <>
        <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px' }}>
          {formatPrice(originalPrice, currency)}
        </span>
        <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
          {formatPrice(price, currency)} ({discountPercent}% OFF)
        </span>
      </>
    )
  }

  return (
    <span>
      <span className="line-through mr-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {formatPrice(originalPrice, currency)}
      </span>
      <span className="font-semibold" style={{ color: '#ff6b35' }}>
        {formatPrice(price, currency)} ({discountPercent}% OFF)
      </span>
    </span>
  )
}
