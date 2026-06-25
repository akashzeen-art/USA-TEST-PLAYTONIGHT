/**
 * All pricing comes from the backend API.
 * price = API price (already the total/final price for the pack)
 * qty = API qty
 * currency = API currency
 * No frontend multiplication logic.
 */
export function getPackPricing(apiPrice, apiQty, discountPercent = 50) {
  const price = Number(apiPrice) || 0
  const qty = Number(apiQty) || 1
  const originalPrice = price > 0 && discountPercent > 0
    ? Math.round(price / (1 - discountPercent / 100))
    : price

  return {
    price,
    qty,
    originalPrice,
    discountPercent,
  }
}
