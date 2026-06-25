import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import type { ProductDetails } from './productApi';

/** ISO2 → calling code (digits, no +) */
export const DIAL_BY_ISO2: Record<string, string> = {
  IN: '91',
  US: '1',
  GB: '44',
  AE: '971',
  SA: '966',
  QA: '974',
  KW: '965',
  OM: '968',
  BH: '973',
  AU: '61',
  CA: '1',
  DE: '49',
  FR: '33',
  IT: '39',
  ES: '34',
  NL: '31',
  SG: '65',
  MY: '60',
  NP: '977',
  BD: '880',
  LK: '94',
  PK: '92',
};

/** Single primary ISO2 per calling code (ambiguous codes like +1 default US) */
const PRIMARY_ISO_BY_DIAL: Record<string, string> = {
  '1': 'US',
  '44': 'GB',
  '91': 'IN',
  '971': 'AE',
  '966': 'SA',
  '974': 'QA',
  '965': 'KW',
  '968': 'OM',
  '973': 'BH',
  '61': 'AU',
  '49': 'DE',
  '33': 'FR',
  '39': 'IT',
  '34': 'ES',
  '31': 'NL',
  '65': 'SG',
  '60': 'MY',
  '977': 'NP',
  '880': 'BD',
  '94': 'LK',
  '92': 'PK',
};

export interface GeoCountry {
  iso2: string;
  dialCode: string;
}

export async function fetchGeoCountry(): Promise<GeoCountry | null> {
  try {
    const res = await fetch('https://ipwho.is/', {
      cache: 'no-store',
      credentials: 'omit',
    });
    const j = await res.json();
    if (!j || j.success === false) return null;
    const iso2 = String(j.country_code || '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 2);
    if (iso2.length !== 2) return null;
    let dial = String(j.calling_code ?? '').replace(/\D/g, '');
    if (!dial) dial = DIAL_BY_ISO2[iso2] || '';
    if (!dial) return null;
    return { iso2, dialCode: dial };
  } catch {
    return null;
  }
}

function onlyDigits(s: unknown): string {
  return String(s ?? '').replace(/\D/g, '');
}

/**
 * Read optional region / dial fields from payment API payload.
 */
export function parseApiDialAndIso(product: ProductDetails): { iso2?: string; dialCode?: string } {
  const rawIso =
    product.country_iso ||
    product.countryIso ||
    product.country_code ||
    product.countryCode ||
    product.phone_country ||
    product.phoneCountry;

  let iso2: string | undefined;
  if (typeof rawIso === 'string') {
    const u = rawIso.trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (u.length === 2) iso2 = u;
  }

  const rawDial =
    product.phone_code ||
    product.phoneCode ||
    product.dial_code ||
    product.dialCode ||
    product.calling_code ||
    product.callingCode ||
    product.country_calling_code ||
    product.countryCallingCode;

  let dialCode = onlyDigits(rawDial);
  if (dialCode && !iso2) {
    iso2 = PRIMARY_ISO_BY_DIAL[dialCode];
  }
  if (iso2 && !dialCode) {
    dialCode = DIAL_BY_ISO2[iso2] || '';
  }
  return { iso2, dialCode: dialCode || undefined };
}

export interface ResolvedMarket {
  iso2: string;
  dialCode: string;
  regionMismatch: boolean;
  apiIso?: string;
}

/**
 * API defines the product market (dial + optional ISO). Visitor geo must match when API sends a country.
 */
export function resolveMarketForCheckout(
  product: ProductDetails,
  geo: GeoCountry | null,
): ResolvedMarket {
  const api = parseApiDialAndIso(product);
  const apiIso = api.iso2;

  let iso2 = apiIso;
  let dialCode = api.dialCode || '';

  if (!iso2 && geo) {
    iso2 = geo.iso2;
    dialCode = geo.dialCode;
  }
  if (iso2 && !dialCode) {
    dialCode = DIAL_BY_ISO2[iso2] || '';
  }
  if (!iso2) {
    iso2 = geo?.iso2 || 'IN';
  }
  if (!dialCode) {
    dialCode = DIAL_BY_ISO2[iso2] || geo?.dialCode || '91';
  }

  const regionMismatch = Boolean(apiIso && geo && apiIso !== geo.iso2);

  return {
    iso2,
    dialCode,
    regionMismatch,
    apiIso,
  };
}

export function normalizePriceFromApi(data: ProductDetails): number | null {
  const candidates = [
    data.price,
    data.sale_price,
    data.salePrice,
    data.product_price,
    data.productPrice,
    data.amount,
    data.payable_amount,
    data.payableAmount,
  ];
  for (const c of candidates) {
    if (c === undefined || c === null) continue;
    const n = typeof c === 'number' ? c : parseFloat(String(c).replace(/,/g, '').trim());
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return null;
}

export type CheckoutProductRow = {
  price: number;
  priceDisplay: string;
  name: string;
  currency?: string;
  description?: string;
  checkouturl?: string;
  successurl?: string;
  failurl?: string;
  dialCode: string;
  marketIso: string;
  regionMismatch: boolean;
};

export function fallbackCheckoutProductRow(geo: GeoCountry | null): CheckoutProductRow {
  return {
    price: 0,
    priceDisplay: '0',
    name: 'Product',
    currency: 'INR',
    dialCode: geo?.dialCode || '91',
    marketIso: geo?.iso2 || 'IN',
    regionMismatch: false,
  };
}

export function buildCheckoutProductRow(
  productData: ProductDetails,
  geo: GeoCountry | null,
): CheckoutProductRow | null {
  const price = normalizePriceFromApi(productData);
  if (price === null) return null;

  const market = resolveMarketForCheckout(productData, geo);
  const rawDisplay =
    productData.price ?? productData.sale_price ?? productData.amount ?? price;

  return {
    price,
    priceDisplay:
      typeof rawDisplay === 'string' || typeof rawDisplay === 'number'
        ? String(rawDisplay)
        : String(price),
    name:
      productData?.name ||
      productData?.productName ||
      productData?.product_name ||
      'Product',
    currency: (productData?.currency as string) || 'INR',
    description: productData?.description,
    checkouturl: productData?.checkouturl,
    successurl: productData?.successurl,
    failurl: productData?.failurl,
    dialCode: market.dialCode,
    marketIso: market.iso2,
    regionMismatch: market.regionMismatch,
  };
}

export function countryLabel(iso2: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(iso2) || iso2;
  } catch {
    return iso2;
  }
}

/** Max length for the national (subscriber) digits we collect in the UI. */
export const MAX_NATIONAL_PHONE_DIGITS = 15;

export type NationalPhoneInputStatus = 'empty' | 'partial' | 'valid' | 'invalid';

/**
 * Live validation for national digits + country calling code (for inline UI feedback).
 */
export function describeNationalPhoneInput(
  iso2: string,
  dialDigits: string,
  nationalDigits: string,
): { status: NationalPhoneInputStatus; message?: string } {
  const digits = nationalDigits.replace(/\D/g, '').slice(0, MAX_NATIONAL_PHONE_DIGITS);
  const dial = onlyDigits(dialDigits);
  if (digits.length === 0) {
    return { status: 'empty' };
  }
  if (!dial) {
    return { status: 'partial' };
  }

  const cc = iso2.toUpperCase() as CountryCode;
  const full = `+${dial}${digits}`;
  const parsed = parsePhoneNumberFromString(full, cc);

  if (parsed?.isValid()) {
    return { status: 'valid' };
  }

  if (digits.length < 6) {
    return { status: 'partial' };
  }

  if (parsed?.isPossible()) {
    return { status: 'partial' };
  }

  return {
    status: 'invalid',
    message: 'Enter a valid phone number for your country (digits only).',
  };
}

export function validateNationalMsisdn(
  iso2: string,
  dialDigits: string,
  nationalDigits: string,
): { ok: true; e164: string; msisdnDigits: string } | { ok: false; error: string } {
  const digits = nationalDigits.replace(/\D/g, '').slice(0, MAX_NATIONAL_PHONE_DIGITS);
  if (digits.length < 6) {
    return { ok: false, error: 'Enter a complete mobile number.' };
  }

  const cc = iso2.toUpperCase() as CountryCode;
  const full = `+${dialDigits}${digits}`;
  const parsed = parsePhoneNumberFromString(full, cc);
  if (!parsed || !parsed.isValid()) {
    return {
      ok: false,
      error: 'Enter a valid phone number for your country.',
    };
  }

  const e164 = parsed.format('E.164');
  const msisdnDigits = e164.replace(/\D/g, '');
  return { ok: true, e164, msisdnDigits };
}
