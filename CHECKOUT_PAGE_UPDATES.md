# Checkout.tsx - Dynamic Currency & Price Implementation Guide

## Changes Required in `/src/wa-checkout/components/Checkout.tsx`

### 1. Import Statement (Line 1-5)
✅ DONE - Added import for formatPrice and calculateOriginalPrice

### 2. CheckoutModal Component (~Line 60-350)

**Add after line ~120 (after unitPrice calculation):**
```typescript
const currency = product?.currency || 'INR';
const discountPercent = product?.discount || 50;
const originalPrice = unitPrice ? calculateOriginalPrice(unitPrice, discountPercent) : 0;
```

**Replace line ~181:**
```typescript
// OLD:
currency: 'INR',

// NEW:
currency: currency,
```

**Replace lines ~234-235:**
```typescript
// OLD:
<span style={{textDecoration: 'line-through', color: '#999', marginRight: '8px'}}>Rs.{loading ? '...' : (unitPrice * 2)}</span>
<span style={{color: '#e74c3c', fontWeight: 'bold'}}>Rs.{loading ? '...' : totalPrice} (50% OFF)</span>

// NEW:
<span style={{textDecoration: 'line-through', color: '#999', marginRight: '8px'}}>{loading ? '...' : formatPrice(originalPrice, currency)}</span>
<span style={{color: '#e74c3c', fontWeight: 'bold'}}>{loading ? '...' : formatPrice(totalPrice, currency)} ({discountPercent}% OFF)</span>
```

### 3. CheckoutPopupModal Component (~Line 400-750)

**Add after unitPrice calculation:**
```typescript
const currency = product?.currency || 'INR';
const discountPercent = product?.discount || 50;
const originalPrice = unitPrice ? calculateOriginalPrice(unitPrice, discountPercent) : 0;
```

**Replace line ~540:**
```typescript
// OLD:
currency: 'INR',

// NEW:
currency: currency,
```

**Replace lines ~631-632:**
```typescript
// OLD:
<span style={{textDecoration: 'line-through', color: '#999', marginRight: '8px'}}>Rs.{loading ? '...' : (unitPrice * 2)}</span>
<span style={{color: '#e74c3c', fontWeight: 'bold'}}>Rs.{loading ? '...' : totalPrice} (50% OFF)</span>

// NEW:
<span style={{textDecoration: 'line-through', color: '#999', marginRight: '8px'}}>{loading ? '...' : formatPrice(originalPrice, currency)}</span>
<span style={{color: '#e74c3c', fontWeight: 'bold'}}>{loading ? '...' : formatPrice(totalPrice, currency)} ({discountPercent}% OFF)</span>
```

### 4. ScrollToBottomPopup Component (~Line 800-1150)

**Add after unitPrice calculation:**
```typescript
const currency = product?.currency || 'INR';
const discountPercent = product?.discount || 50;
const originalPrice = unitPrice ? calculateOriginalPrice(unitPrice, discountPercent) : 0;
```

**Replace line ~939:**
```typescript
// OLD:
currency: 'INR',

// NEW:
currency: currency,
```

**Replace lines ~1030-1031:**
```typescript
// OLD:
<span style={{textDecoration: 'line-through', color: '#999', marginRight: '8px'}}>Rs.{loading ? '...' : (unitPrice * 2)}</span>
<span style={{color: '#e74c3c', fontWeight: 'bold'}}>Rs.{loading ? '...' : totalPrice} (50% OFF)</span>

// NEW:
<span style={{textDecoration: 'line-through', color: '#999', marginRight: '8px'}}>{loading ? '...' : formatPrice(originalPrice, currency)}</span>
<span style={{color: '#e74c3c', fontWeight: 'bold'}}>{loading ? '...' : formatPrice(totalPrice, currency)} ({discountPercent}% OFF)</span>
```

### 5. WhatsAppWidget Component (~Line 1200-1400)

**Add after unitPrice calculation:**
```typescript
const currency = product?.currency || 'INR';
const discountPercent = product?.discount || 50;
const originalPrice = (product?.price || 0) * formData.quantity ? calculateOriginalPrice((product?.price || 0) * formData.quantity, discountPercent) : 0;
```

**Replace line ~1269:**
```typescript
// OLD:
currency: 'INR',

// NEW:
currency: currency,
```

**Replace line ~1331:**
```typescript
// OLD:
<span style={{textDecoration: 'line-through', color: '#999', marginRight: '8px'}}>Rs.{loading ? '...' : ((product?.price || 0) * formData.quantity * 2)}</span>
<span style={{color: '#e74c3c', fontWeight: 'bold'}}>Rs.{loading ? '...' : (product?.price || 0) * formData.quantity} (50% OFF)</span>

// NEW:
<span style={{textDecoration: 'line-through', color: '#999', marginRight: '8px'}}>{loading ? '...' : formatPrice(originalPrice, currency)}</span>
<span style={{color: '#e74c3c', fontWeight: 'bold'}}>{loading ? '...' : formatPrice((product?.price || 0) * formData.quantity, currency)} ({discountPercent}% OFF)</span>
```

## Summary of Changes

✅ Created `/src/wa-checkout/utils/priceFormatter.ts`
✅ Added import in Checkout.tsx
⏳ Need to update 4 components in Checkout.tsx:
  - CheckoutModal
  - CheckoutPopupModal
  - ScrollToBottomPopup
  - WhatsAppWidget

## Testing

After changes, test with:
- `?id=1007` (AED currency) - Should show "AED 1"
- `?id=1013` (INR currency) - Should show "₹699"

## Files Modified
1. `/src/wa-checkout/utils/priceFormatter.ts` - Created ✅
2. `/src/wa-checkout/components/Checkout.tsx` - Partially updated (import added)
