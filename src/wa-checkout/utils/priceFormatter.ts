/**
 * Currency symbol mapping
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED', // United Arab Emirates Dirham
  SAR: 'SAR', // Saudi Riyal
  QAR: 'QAR', // Qatari Riyal
  KWD: 'KWD', // Kuwaiti Dinar
  OMR: 'OMR', // Omani Rial
  BHD: 'BHD', // Bahraini Dinar
}

/**
 * Format price with currency from API
 * @param price - Price value from API
 * @param currency - Currency code from API (e.g., 'INR', 'USD')
 * @returns Formatted price string (e.g., '₹699' or 'AED 699')
 */
export function formatPrice(price: number | string | undefined | null, currency: string = 'INR'): string {
  if (!price && price !== 0) return ''
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price
  if (!Number.isFinite(numericPrice)) return ''
  
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  const formatted = `${symbol}${Math.round(numericPrice)}`
  
  return formatted
}

/**
 * Get currency symbol from currency code
 * @param currency - Currency code from API
 * @returns Currency symbol or code
 */
export function getCurrencySymbol(currency: string = 'INR'): string {
  return CURRENCY_SYMBOLS[currency] || currency
}

/**
 * Calculate original price from API price and discount
 * @param price - Current price from API
 * @param discountPercent - Discount percentage from API
 * @returns Original price before discount
 */
export function calculateOriginalPrice(price: number, discountPercent: number): number {
  if (!price || !discountPercent) return price
  return Math.round(price / (1 - discountPercent / 100))
}
