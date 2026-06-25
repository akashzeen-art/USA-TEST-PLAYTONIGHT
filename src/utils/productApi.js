// Global cache
let cachedProductData = null;
let cachedClickid = null;
let hasApiBeenCalled = false;

/**
 * Fetch product details from backend API
 * Simple logic: Always send clickid if available, clear cache when clickid changes
 */
export async function getProductDetails({ id, clickid, signal } = {}) {
  if (!id) throw new Error('Missing id')

  console.log('🔍 getProductDetails called with ID:', id, 'clickid:', clickid);

  // Clear cache if clickid changed
  if (cachedClickid && clickid && cachedClickid !== clickid) {
    console.log('🔄 Clickid changed from', cachedClickid, 'to', clickid, '- clearing cache');
    cachedProductData = null;
    cachedClickid = null;
  }

  // If data already cached for this ID and same clickid, return it immediately - NO API CALL
  if (cachedProductData && String(cachedProductData.id) === String(id) && cachedClickid === clickid) {
    console.log('✅ Returning cached data - NO API call');
    return cachedProductData;
  }

  // Build API URL - always include clickid if available
  const base = `https://playtonight.fun/api/payment/getproductDetails?id=${encodeURIComponent(id)}`;
  const url = clickid ? `${base}&clickid=${encodeURIComponent(clickid)}` : base;

  console.log('📡 Calling API:', url);

  const res = await fetch(url, {
    method: 'GET',
    signal,
    credentials: 'omit',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`getproductDetails failed (${res.status})`);
  }

  const data = await res.json();
  console.log('📦 API Response for ID', id, ':', data);
  console.log('💰 Price from API:', data.price);

  // Cache the data with clickid
  cachedProductData = data;
  cachedClickid = clickid;
  hasApiBeenCalled = true;
  console.log('💾 Data cached for clickid:', clickid);

  return data;
}


export function isAndroidDevice() {
  return /Android/i.test(navigator.userAgent);
}

export async function initiateS2SCheckout({ productId, payload } = {}) {
  const res = await fetch(
    `https://playtonight.fun/api/payment/checkouts2s/${productId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'omit',
    }
  )
  if (!res.ok) throw new Error(`S2S checkout failed (${res.status})`)
  return await res.json()
}

export async function checkTransactionStatus(processingUrl) {
  const res = await fetch(processingUrl, { method: 'GET', credentials: 'omit', cache: 'no-store' })
  if (!res.ok) throw new Error(`Transaction status check failed (${res.status})`)
  const text = (await res.text()).trim()
  console.log('Raw transaction status:', text)
  try {
    const json = JSON.parse(text)
    const s = String(json?.status || json?.paymentStatus || json?.transactionStatus || json?.txnStatus || json?.TxnStatus || text)
    return s.toUpperCase()
  } catch {
    return text.toUpperCase()
  }
}

export async function saveUserDataProduct({
  msisdn,
  productId,
  clickId,
  productName,
  signal,
} = {}) {
  const res = await fetch(
    'https://playtonight.fun/api/payment/saveuserdataproduct',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msisdn,
        productId,
        clickId,
        productName,
      }),
      signal,
      credentials: 'omit',
    }
  )

  if (!res.ok) {
    throw new Error(`saveuserdataproduct failed (${res.status})`)
  }

  // Some backends return empty body; be defensive.
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return text || null
  }
}


