#!/bin/bash

# Backup original file
cp src/wa-checkout/components/Checkout.tsx src/wa-checkout/components/Checkout.tsx.backup

# Replace hardcoded currency: 'INR' with currency: currency
sed -i.tmp "s/currency: 'INR',/currency: currency,/g" src/wa-checkout/components/Checkout.tsx

# Replace hardcoded Rs. with formatPrice
# This is more complex and needs manual review

echo "✅ Automated changes complete!"
echo "⚠️  Manual changes still needed:"
echo "   1. Add currency/discount/originalPrice calculations in each component"
echo "   2. Replace Rs.{unitPrice * 2} with formatPrice(originalPrice, currency)"
echo "   3. Replace Rs.{totalPrice} (50% OFF) with formatPrice(totalPrice, currency) ({discountPercent}% OFF)"
echo ""
echo "📄 See CHECKOUT_PAGE_UPDATES.md for detailed instructions"
echo "💾 Backup saved to: src/wa-checkout/components/Checkout.tsx.backup"
