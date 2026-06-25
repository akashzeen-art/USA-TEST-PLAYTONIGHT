#!/usr/bin/env python3
import re

# Read the file
with open('src/wa-checkout/components/Checkout.tsx', 'r') as f:
    content = f.read()

# Replace Rs.{...} patterns with proper formatPrice calls
# Pattern 1: Rs.{loading ? '...' : (unitPrice * 2)}
content = re.sub(
    r"Rs\.{loading \? '\.\.\.'\s*:\s*\(unitPrice \* 2\)}",
    r"{loading ? '...' : formatPrice(unitPrice * 2, currency)}",
    content
)

# Pattern 2: Rs.{loading ? '...' : totalPrice}
content = re.sub(
    r"Rs\.{loading \? '\.\.\.'\s*:\s*totalPrice}",
    r"{loading ? '...' : formatPrice(totalPrice, currency)}",
    content
)

# Pattern 3: Rs.{loading ? '...' : ((product?.price || 0) * formData.quantity * 2)}
content = re.sub(
    r"Rs\.{loading \? '\.\.\.'\s*:\s*\(\(product\?\.price \|\| 0\) \* formData\.quantity \* 2\)}",
    r"{loading ? '...' : formatPrice((product?.price || 0) * formData.quantity * 2, currency)}",
    content
)

# Pattern 4: Rs.{loading ? '...' : (product?.price || 0) * formData.quantity}
content = re.sub(
    r"Rs\.{loading \? '\.\.\.'\s*:\s*\(product\?\.price \|\| 0\) \* formData\.quantity}",
    r"{loading ? '...' : formatPrice((product?.price || 0) * formData.quantity, currency)}",
    content
)

# Replace (50% OFF) with ({discountPercent}% OFF)
content = re.sub(r'\(50% OFF\)', r'({discountPercent}% OFF)', content)

# Replace currency: 'INR', with currency: currency,
content = re.sub(r"currency: 'INR',", r"currency: currency,", content)

# Write back
with open('src/wa-checkout/components/Checkout.tsx', 'w') as f:
    f.write(content)

print("✅ All Rs. replaced with formatPrice")
print("✅ All (50% OFF) replaced with ({discountPercent}% OFF)")
print("✅ All currency: 'INR' replaced with currency: currency")
