// Product API utilities - TypeScript version of playtonight backend logic

/**
 * Generate clickid starting from 0000 format
 * Auto-generates sequential clickid if not present
 */
export function generateClickid(productId: string = ''): string {
  // Check URL params first
  const searchParams = new URLSearchParams(window.location.search);
  const urlClickid = searchParams.get('clickid') || 
                     searchParams.get('click_id') || 
                     searchParams.get('clickId') || 
                     searchParams.get('CLICKID') || 
                     searchParams.get('cid') || 
                     searchParams.get('ref') || '';
  
  if (urlClickid) {
    // Store in localStorage for future use
    try {
      localStorage.setItem(`pt_clickid_${productId}`, urlClickid);
      localStorage.setItem('playtonight_clickid', urlClickid);
    } catch {}
    return urlClickid;
  }
  
  // Check localStorage
  try {
    const stored = localStorage.getItem(`pt_clickid_${productId}`);
    if (stored) return stored;
    
    const globalClickid = localStorage.getItem('playtonight_clickid');
    if (globalClickid) return globalClickid;
  } catch {}
  
  // Generate new clickid in format: 0000 + UUID
  try {
    // Generate UUID
    let uuid: string;
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      uuid = crypto.randomUUID();
    } else {
      // Fallback UUID generation
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
      });
    }
    
    // Format as 0000 + UUID (e.g., 0000c3ca5629-1013-4021-b069-46acbb4793c6)
    const formattedClickid = '0000' + uuid;
    
    // Store clickid
    try {
      localStorage.setItem(`pt_clickid_${productId}`, formattedClickid);
      localStorage.setItem('playtonight_clickid', formattedClickid);
    } catch {}
    
    return formattedClickid;
  } catch {
    // Fallback to timestamp-based if generation fails
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const fallbackClickid = '0000' + timestamp.toString(36) + random;
    return fallbackClickid;
  }
}

// Global flag to prevent duplicate API calls across all components
let globalApiCallInProgress = false;
const globalApiCache = new Map<string, ProductDetails>();
let globalProductData: ProductDetails | null = null;
let isInitialPageLoad = true; // Track if this is the first API call on page load
let hasApiBeenCalled = false; // Track if API has been called at least once

// Clear cache on page load to ensure fresh data
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    globalApiCache.clear();
    globalProductData = null;
    isInitialPageLoad = true;
    hasApiBeenCalled = false;
    console.log('🔄 API cache cleared on page load');
  });
}

export interface ProductDetails {
  id?: string;
  name?: string;
  productName?: string;
  product_name?: string;
  price?: number | string;
  priceDisplay?: string;
  currency?: string;
  description?: string;
  domain?: string;
  checkouturl?: string;
  successurl?: string;
  failurl?: string;
  dspurl?: string;
  form_config_dspurl?: string;
  headtag?: string;
  bodytag?: string;
  qty?: string | number;
  flow?: string;
  discount?: number;
  [key: string]: any;
}

export interface GetProductDetailsParams {
  id: string;
  clickid?: string;
  signal?: AbortSignal;
}

export interface SaveUserDataProductParams {
  msisdn: string;
  productId: number;
  clickId: string;
  productName: string;
  signal?: AbortSignal;
}

export interface CheckoutParams {
  productId: number;
  payload: Record<string, any>;
  checkoutUrl?: string;
}

/**
 * Check if click has already been logged for this product
 */
function isClickLogged(productId: string, clickid: string): boolean {
  try {
    const key = `pt_click_logged_${productId}_${clickid}`;
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark click as logged for this product
 */
function markClickLogged(productId: string, clickid: string): void {
  try {
    const key = `pt_click_logged_${productId}_${clickid}`;
    localStorage.setItem(key, 'true');
    console.log('✅ Click marked as logged for product:', productId);
  } catch {
    console.warn('⚠️ Failed to mark click as logged');
  }
}

/**
 * Fetch product/event details from backend API
 * Aligned with playtonight implementation
 * 
 * Click Logging Rule:
 * - First call: Send clickid → backend logs click
 * - Subsequent calls: Omit clickid → no click logged
 */
export async function getProductDetails({ id, clickid, signal }: GetProductDetailsParams): Promise<ProductDetails> {
  if (!id) throw new Error('Missing id');

  console.log('🔍 getProductDetails called with ID:', id, 'clickid:', clickid);

  // If data already cached, return it immediately - NO API CALL
  if (globalProductData && String(globalProductData.id) === String(id)) {
    console.log('✅ Returning cached data - NO API call');
    return globalProductData;
  }

  // Check cache
  const callKey = `${id}`;
  if (globalApiCache.has(callKey)) {
    const cached = globalApiCache.get(callKey)!;
    globalProductData = cached;
    console.log('✅ Returning cached product details - NO API call');
    return cached;
  }
  
  if (globalApiCallInProgress) {
    console.log('⚠️ API call already in progress, waiting...');
    await new Promise(resolve => setTimeout(resolve, 300));
    if (globalProductData && String(globalProductData.id) === String(id)) {
      return globalProductData;
    }
    if (globalApiCache.has(callKey)) {
      return globalApiCache.get(callKey)!;
    }
  }

  globalApiCallInProgress = true;

  // Determine if we should send clickid
  // RULE: Only send clickid on FIRST API call (initial page load)
  let shouldSendClickid = false;
  let effectiveClickid = clickid;
  
  if (clickid && !hasApiBeenCalled) {
    const clickAlreadyLogged = isClickLogged(id, clickid);
    if (clickAlreadyLogged) {
      console.log('⏭️ Click already logged - calling API WITHOUT clickid');
      shouldSendClickid = false;
    } else {
      console.log('🆕 Initial page load - calling API WITH clickid to log click');
      shouldSendClickid = true;
    }
  } else if (hasApiBeenCalled) {
    console.log('🚫 API already called once - this should not happen (cache should be used)');
    shouldSendClickid = false;
  }

  const base = `https://playtonight.fun/api/payment/getproductDetails?id=${encodeURIComponent(id)}`;
  const url = shouldSendClickid && effectiveClickid 
    ? `${base}&clickid=${encodeURIComponent(effectiveClickid)}` 
    : base;

  console.log('📡 Calling API:', url);

  try {
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
    
    // If we sent clickid, mark it as logged
    if (shouldSendClickid && effectiveClickid) {
      markClickLogged(id, effectiveClickid);
    }
    
    // Mark that API has been called
    hasApiBeenCalled = true;
    
    // Mark that initial page load is complete
    if (isInitialPageLoad) {
      isInitialPageLoad = false;
      console.log('✅ Initial page load complete - future calls will use cache');
    }
    
    // Store in both cache and global variable
    globalApiCache.set(callKey, data);
    globalProductData = data;
    console.log('💾 Data cached - future calls will NOT hit API');
    
    return data;
  } finally {
    globalApiCallInProgress = false;
  }
}

/**
 * Save user data (MSISDN + product metadata) before initiating payment
 * Aligned with playtonight implementation
 */
export async function saveUserDataProduct({
  msisdn,
  productId,
  clickId,
  productName,
  signal,
}: SaveUserDataProductParams): Promise<any> {
  const res = await fetch('https://playtonight.fun/api/payment/saveuserdataproduct', {
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
  });

  if (!res.ok) {
    throw new Error(`saveuserdataproduct failed (${res.status})`);
  }

  // Some backends return empty body; be defensive.
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text || null;
  }
}

/**
 * Initiate PayU checkout
 * Aligned with playtonight implementation
 */
export async function initiateCheckout({ productId, payload, checkoutUrl }: CheckoutParams): Promise<any> {
  const url = checkoutUrl 
    ? `${checkoutUrl}${productId}` 
    : `https://playtonight.fun/api/payment/checkout/${productId}`;
    
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'omit',
  });

  if (!res.ok) {
    throw new Error('Payment API failed');
  }

  return await res.json();
}

/**
 * Detect if current device is Android
 */
export function isAndroidDevice(): boolean {
  return /Android/i.test(navigator.userAgent);
}

export interface S2SCheckoutParams {
  productId: number;
  payload: Record<string, any>;
}

export interface S2SResponse {
  txnId: string;
  intentUrl: string;
  processingUrl: string;
  successUrl: string;
  html: string | null;
  rawResponse: string | null;
  qrString: string | null;
  status: string | null;
}

/**
 * Initiate S2S checkout (Android + flow=s2s)
 */
export async function initiateS2SCheckout({ productId, payload }: S2SCheckoutParams): Promise<S2SResponse> {
  const url = `https://playtonight.fun/api/payment/checkouts2s/${productId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'omit',
  });
  if (!res.ok) throw new Error(`S2S checkout failed (${res.status})`);
  return await res.json();
}

/**
 * Poll transaction status — returns uppercase status string
 * e.g. INACTIVE, ACTIVE, FAILED
 */
export async function checkTransactionStatus(processingUrl: string): Promise<string> {
  const res = await fetch(processingUrl, {
    method: 'GET',
    credentials: 'omit',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Transaction status check failed (${res.status})`);
  const text = (await res.text()).trim();
  console.log('Raw transaction status:', text);
  try {
    const json = JSON.parse(text);
    const s = String(json?.status || json?.paymentStatus || json?.transactionStatus || json?.txnStatus || json?.TxnStatus || text);
    return s.toUpperCase();
  } catch {
    return text.toUpperCase();
  }
}
