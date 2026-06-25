import {
  parsePhoneNumberFromString,
  type CountryCode,
  isSupportedCountry,
} from 'libphonenumber-js'

const TEL_INPUT_MAX = 22

/** Strip invalid characters; keep digits, +, spaces, common separators */
export function sanitizeTelInput(value: string): string {
  return String(value ?? '')
    .replace(/[^\d+\s().-]/g, '')
    .slice(0, TEL_INPUT_MAX)
}

export type ProductPhoneHints = {
  country_iso?: string
  countryIso?: string
  country_code?: string
  countryCode?: string
  currency?: string
} | null | undefined

export function defaultCountryFromProduct(product: ProductPhoneHints): CountryCode {
  if (!product) return 'IN'
  const raw =
    product.country_iso ||
    product.countryIso ||
    product.country_code ||
    product.countryCode
  if (typeof raw === 'string') {
    const u = raw.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2)
    if (u.length === 2 && isSupportedCountry(u)) {
      return u as CountryCode
    }
  }
  const cur = String(product.currency ?? '').toUpperCase()
  if (cur === 'USD') return 'US'
  if (cur === 'GBP') return 'GB'
  if (cur === 'EUR') return 'DE'
  if (cur === 'AED') return 'AE'
  if (cur === 'SAR') return 'SA'
  return 'IN'
}

export function validateCheckoutPhone(
  value: string,
  defaultCountry: CountryCode = 'IN',
): { valid: true; e164: string } | { valid: false; message: string } {
  const raw = String(value ?? '').trim()
  if (!raw) {
    return { valid: false, message: 'Enter your phone number.' }
  }
  const parsed = parsePhoneNumberFromString(raw, defaultCountry)
  if (!parsed || !parsed.isValid()) {
    return { valid: false, message: 'Enter a valid phone number for your region.' }
  }
  return { valid: true, e164: parsed.format('E.164') }
}

export function phoneDigitsForApi(e164: string): string {
  return e164.replace(/\D/g, '')
}
