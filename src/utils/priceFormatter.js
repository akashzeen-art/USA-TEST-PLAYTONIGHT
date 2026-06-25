/**
 * Currency symbol mapping
 */
const CURRENCY_SYMBOLS = {
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
 * @param {number|string} price - Price value from API
 * @param {string} currency - Currency code from API (e.g., 'INR', 'USD')
 * @returns {string} Formatted price string (e.g., '₹699' or 'INR 699')
 */
export function formatPrice(price, currency = 'INR') {
  if (!price && price !== 0) return ''
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price
  if (!Number.isFinite(numericPrice)) return ''
  
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  const formatted = `${symbol}${Math.round(numericPrice)}`
  
  console.log('💰 formatPrice:', { price, currency, numericPrice, symbol, formatted });
  
  return formatted
}

/**
 * Get currency symbol from currency code
 * @param {string} currency - Currency code from API
 * @returns {string} Currency symbol or code
 */
export function getCurrencySymbol(currency = 'INR') {
  return CURRENCY_SYMBOLS[currency] || currency
}

/**
 * Calculate original price from API price and discount
 * @param {number} price - Current price from API
 * @param {number} discountPercent - Discount percentage from API
 * @returns {number} Original price before discount
 */
export function calculateOriginalPrice(price, discountPercent) {
  if (!price || !discountPercent) return price
  return Math.round(price / (1 - discountPercent / 100))
}
