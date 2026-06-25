import { useEffect } from 'react'
import { buildReturnUrl } from '../utils/paymentSuccess'

export default function ThankYou({ phone, productId, source = 'home' }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = buildReturnUrl({ source, productId })
    }, 3000)
    return () => clearTimeout(timer)
  }, [productId, source])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-4">
        <div className="w-24 h-24 rounded-full bg-green-500 mx-auto flex items-center justify-center text-white text-5xl">
          ✓
        </div>
        <h1 className="mt-6 text-4xl font-bold text-green-600">Thank You For Your Purchase</h1>
        <p className="mt-4 text-xl text-gray-700">Your order has been placed successfully.</p>
        <p className="mt-2 text-lg text-gray-600">Your order will be delivered soon.</p>
        {phone ? (
          <p className="mt-4 text-sm text-gray-500">Order linked to: {phone}</p>
        ) : null}
        <p className="mt-6 text-sm text-gray-500">Redirecting...</p>
      </div>
    </div>
  )
}
