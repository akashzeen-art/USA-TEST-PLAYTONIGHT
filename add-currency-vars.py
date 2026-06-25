#!/usr/bin/env python3
import re

with open('src/wa-checkout/components/Checkout.tsx', 'r') as f:
    content = f.read()

# Pattern to find and replace
pattern = r'(const unitPrice = product\?\.price \|\| 0;)\n(\s+)(const totalPrice = unitPrice \* formData\.quantity;)'

replacement = r'\1\n\2const currency = product?.currency || \'INR\';\n\2const discountPercent = product?.discount || 50;\n\2\3'

content = re.sub(pattern, replacement, content)

with open('src/wa-checkout/components/Checkout.tsx', 'w') as f:
    f.write(content)

print("✅ Added currency and discountPercent variables")
