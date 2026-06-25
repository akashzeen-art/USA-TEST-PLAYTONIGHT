import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { trackButtonClick } from '../utils/analytics'
import { saveUserDataProduct, isAndroidDevice, initiateS2SCheckout, checkTransactionStatus } from '../utils/productApi'
import { formatPrice, calculateOriginalPrice } from '../utils/priceFormatter'
import {
  sanitizeTelInput,
  validateCheckoutPhone,
  defaultCountryFromProduct,
  phoneDigitsForApi,
} from '../utils/phoneValidation'

const S2SPaymentScreen = ({ intentUrl, processingUrl, successUrl, onCancel }) => {
  const [status, setStatus] = useState('waiting')
  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)
  const doneRef = useRef(false)

  const stopAll = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
  }, [])

  const pollOnce = useCallback(async () => {
    if (doneRef.current) return
    try {
      const txStatus = await checkTransactionStatus(processingUrl)
      console.log('Transaction Status:', txStatus)
      if (txStatus === 'SUCCESS' || txStatus === 'ACTIVE' || txStatus === 'CAPTURED') {
        doneRef.current = true; stopAll(); setStatus('success')
        window.location.replace(successUrl); return
      }
      if (txStatus === 'FAILED' || txStatus === 'FAILURE' || txStatus === 'CANCELLED') {
        doneRef.current = true; stopAll(); setStatus('failed')
      }
    } catch (error) { console.error('Status Check Error:', error) }
  }, [processingUrl, successUrl, stopAll])

  const startPolling = useCallback(() => {
    if (intervalRef.current) return
    setStatus('polling')
    pollOnce()
    intervalRef.current = setInterval(pollOnce, 3000)
    timeoutRef.current = setTimeout(() => { if (!doneRef.current) stopAll() }, 300000)
  }, [pollOnce, stopAll])

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible' && status === 'polling') pollOnce() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [status, pollOnce])

  useEffect(() => () => stopAll(), [stopAll])

  const handleOpenUPI = () => { startPolling(); setTimeout(() => { window.location.href = intentUrl }, 100) }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,107,53,0.4)', borderRadius: '16px', padding: '32px 24px', maxWidth: '360px', width: '90%', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>UPI Payment</h2>
        {status === 'waiting' && (
          <>
            <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '24px' }}>Tap the button below — your UPI app will open. This page redirects automatically after payment.</p>
            <button onClick={handleOpenUPI} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(45deg, #ff6b35, #f7931e)', color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Pay via UPI</button>
            <br />
            <button onClick={onCancel} style={{ background: 'transparent', color: '#999', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
          </>
        )}
        {status === 'polling' && (
          <>
            <p style={{ color: '#f7931e', fontSize: '16px', marginBottom: '12px' }}>⏳ Verifying payment...</p>
            <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '20px' }}>Complete payment in UPI app, then return here.</p>
            <button onClick={onCancel} style={{ background: 'transparent', color: '#666', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
          </>
        )}
        {status === 'success' && <p style={{ color: '#2ecc71', fontSize: '18px', fontWeight: 700 }}>✅ Payment successful! Redirecting...</p>}
        {status === 'failed' && (
          <>
            <p style={{ color: '#e74c3c', fontSize: '16px', marginBottom: '16px' }}>❌ Payment failed. Please try again.</p>
            <button onClick={onCancel} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(255,107,53,0.2)', color: '#ff6b35', fontSize: '14px' }}>Go Back</button>
          </>
        )}
      </div>
    </div>
  )
}

const CartSection = ({
  product, loading, refreshing, error, onRetry,
  lastUpdatedAt, productId, clickid, navigate,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [s2sData, setS2sData] = useState(null)

  const [formData, setFormData] = useState({
    firstName: 'Test User',
    lastName: '',
    email: 'testuser@example.com',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') { setFormData({ ...formData, phone: sanitizeTelInput(value) }); return }
    setFormData({ ...formData, [name]: value })
  }

  // All values come directly from API — no frontend multiplication
  const apiPrice = useMemo(() => (product && Number.isFinite(product.price) ? product.price : 0), [product])
  const apiQty = useMemo(() => Number(product?.qty) || 1, [product])
  const apiCurrency = useMemo(() => product?.currency || 'INR', [product])
  const apiFlow = useMemo(() => String(product?.flow || '').trim().toLowerCase(), [product])
  const discountPercent = useMemo(() => product?.discount || 50, [product])
  const productName = useMemo(() => product?.name || 'Product', [product])
  const originalPrice = useMemo(() => apiPrice ? calculateOriginalPrice(apiPrice, discountPercent) : 0, [apiPrice, discountPercent])

  const handleSubmit = async (e) => {
    e.preventDefault()
    trackButtonClick('Place Order')

    if (isSubmitting) return
    if (!productId || !clickid) { alert('Missing required URL params: id and clickid'); return }
    if (!product || !Number.isFinite(product.price)) { alert('Product details not loaded yet. Please wait and try again.'); return }
    if (!product.name) { alert('Product name missing from API. Please retry.'); return }

    const termsCheckbox = document.getElementById('terms')
    if (!termsCheckbox || !termsCheckbox.checked) { alert('Please accept the Terms & Conditions and Privacy Policy to continue.'); return }

    const numericProductId = Number(productId)
    if (!Number.isFinite(numericProductId)) { alert('Invalid product id in URL'); return }

    const phoneCountry = defaultCountryFromProduct(product)
    const phoneResult = validateCheckoutPhone(formData.phone, phoneCountry)
    if (!phoneResult.valid) { alert(phoneResult.message); return }
    const phoneForApi = phoneDigitsForApi(phoneResult.e164)

    try {
      setIsSubmitting(true)
      await saveUserDataProduct({ msisdn: phoneForApi, productId: numericProductId, clickId: clickid, productName: product.name })
    } catch (err) {
      console.error('❌ saveuserdataproduct error:', err)
      alert('Could not save your details. Please try again.')
      setIsSubmitting(false)
      return
    }

    const hasFullShippingDetails =
      !!formData.email && !!formData.firstName && !!formData.address1 &&
      !!formData.city && !!formData.zipcode && !!formData.state && !!formData.country

    if (!hasFullShippingDetails) {
      alert('Saved. Please complete the shipping details to place your order.')
      setIsSubmitting(false)
      return
    }

    // amount and qty come directly from API — no multiplication
    const payload = {
      ...formData,
      phone: phoneForApi,
      amount: apiPrice.toFixed(2),
      currency: apiCurrency,
      qty: apiQty,
      clickid,
    }

    console.log('📤 Payload:', payload)

    const useS2S = apiFlow === 's2s' && isAndroidDevice()
    console.log('CartSection | flow:', apiFlow, '| isAndroid:', isAndroidDevice(), '| useS2S:', useS2S)

    try {
      if (useS2S) {
        const s2s = await initiateS2SCheckout({ productId: numericProductId, payload })
        console.log('S2S response:', s2s)
        setS2sData({ intentUrl: s2s.intentUrl, processingUrl: s2s.processingUrl, successUrl: s2s.successUrl })
      } else {
        const res = await fetch(
          `https://playtonight.fun/api/payment/checkout/${numericProductId}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'omit' }
        )
        if (!res.ok) throw new Error('Payment API failed')
        const data = await res.json()
        console.log('✅ Checkout success:', data)
        navigate('/payu-redirect', {
          state: { actionUrl: 'https://secure.payu.in/_payment', params: data, successurl: data.successurl || data.surl, failurl: data.failurl || data.furl },
        })
      }
    } catch (error) {
      console.error('❌ Checkout error:', error)
      alert('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (s2sData) {
    return <S2SPaymentScreen {...s2sData} onCancel={() => { setS2sData(null); setIsSubmitting(false) }} />
  }

  return (
    <>
      <div className="lg:col-span-2 shadow-2xl p-6 rounded-2xl border" style={{ background: 'rgba(10,10,20,0.45)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,107,53,0.2)' }}>
        <h2 className="mb-2 font-semibold text-xl text-white">Shipping Address</h2>

        <div className="mb-3">
          {loading && !product ? (
            <div className="text-gray-400 text-sm">Loading latest price…</div>
          ) : null}
          {!!product && (
            <div className="mt-2 text-sm" style={{ color: '#b0b0b0' }}>
              <span className="font-medium text-white">{productName}</span> —{' '}
              <span className="line-through mr-1" style={{ color: '#555' }}>{formatPrice(originalPrice, apiCurrency)}</span>
              <span className="font-semibold" style={{ color: '#ff6b35' }}>{formatPrice(apiPrice, apiCurrency)} ({discountPercent}% OFF)</span>
              {refreshing ? <span style={{ color: '#b0b0b0' }}> (updating…)</span> : null}
            </div>
          )}
        </div>

        <form className="space-y-2" id="checkoutForm" onSubmit={handleSubmit}>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
              className="px-3 py-3 rounded-lg w-full text-white placeholder-gray-400 focus:outline-none transition"
              style={{ background: 'rgba(74,74,74,0.6)', border: '1px solid rgba(85,85,85,0.5)' }}
              placeholder="Phone Number*" required />
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              className="px-3 py-3 rounded-lg w-full text-white placeholder-gray-400 focus:outline-none transition"
              style={{ background: 'rgba(74,74,74,0.6)', border: '1px solid rgba(85,85,85,0.5)' }}
              placeholder="Email*" />
          </div>
          <input name="firstName" value={formData.firstName} onChange={handleChange}
            className="px-3 py-3 rounded-lg w-full text-white placeholder-gray-400 focus:outline-none transition"
            style={{ background: 'rgba(74,74,74,0.6)', border: '1px solid rgba(85,85,85,0.5)' }}
            placeholder="Full Name*" />
          <div className="gap-2 grid grid-cols-1">
            <input name="address1" value={formData.address1} onChange={handleChange}
              className="px-3 py-3 rounded-lg w-full text-white placeholder-gray-400 focus:outline-none transition"
              style={{ background: 'rgba(74,74,74,0.6)', border: '1px solid rgba(85,85,85,0.5)' }}
              placeholder="House number and street name" />
            <input name="address2" value={formData.address2} onChange={handleChange}
              className="px-3 py-3 rounded-lg w-full text-white placeholder-gray-400 focus:outline-none transition"
              style={{ background: 'rgba(74,74,74,0.6)', border: '1px solid rgba(85,85,85,0.5)' }}
              placeholder="Apartment, suite, unit, etc. (optional)" />
          </div>
          <div className="gap-2 grid grid-cols-1 md:grid-cols-2">
            <input name="city" value={formData.city} onChange={handleChange}
              className="px-3 py-3 rounded-lg w-full text-white placeholder-gray-400 focus:outline-none transition"
              style={{ background: 'rgba(74,74,74,0.6)', border: '1px solid rgba(85,85,85,0.5)' }}
              placeholder="City name*" />
            <input name="zipcode" value={formData.zipcode} onChange={handleChange}
              className="px-3 py-3 rounded-lg w-full text-white placeholder-gray-400 focus:outline-none transition"
              style={{ background: 'rgba(74,74,74,0.6)', border: '1px solid rgba(85,85,85,0.5)' }}
              placeholder="Postcode*" />
            <input name="state" value={formData.state} onChange={handleChange}
              className="px-3 py-3 rounded-lg w-full text-white placeholder-gray-400 focus:outline-none transition"
              style={{ background: 'rgba(74,74,74,0.6)', border: '1px solid rgba(85,85,85,0.5)' }}
              placeholder="State*" />
            <input name="country" value={formData.country} onChange={handleChange}
              className="px-3 py-3 rounded-lg w-full text-white placeholder-gray-400 focus:outline-none transition"
              style={{ background: 'rgba(74,74,74,0.6)', border: '1px solid rgba(85,85,85,0.5)' }}
              placeholder="Country*" />
          </div>
        </form>
      </div>

      <div className="shadow-2xl p-6 rounded-2xl h-fit border" style={{ background: 'rgba(10,10,20,0.45)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,107,53,0.2)' }}>
        <h2 className="mb-4 font-semibold text-xl text-white">Your Cart</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="font-medium text-white">{productName}</p>
              <div className="text-xs mt-1">
                <span className="line-through mr-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{formatPrice(originalPrice, apiCurrency)}</span>
                <span className="font-semibold" style={{ color: '#ff6b35' }}>{formatPrice(apiPrice, apiCurrency)} ({discountPercent}% OFF)</span>
              </div>
              {apiQty > 1 && <p className="mt-1 text-xs" style={{ color: '#b0b0b0' }}>Qty: {apiQty}</p>}
            </div>
            <p className="font-semibold text-white">{formatPrice(apiPrice, apiCurrency)}</p>
          </div>
        </div>

        <div className="space-y-2 mt-4 text-sm" style={{ color: '#b0b0b0' }}>
          <div className="flex justify-between pt-2 font-semibold text-lg text-white" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <span>Total</span>
            <span>{formatPrice(apiPrice, apiCurrency)}</span>
          </div>
        </div>

        <div className="flex items-start space-x-3 mt-4">
          <input id="terms" type="checkbox" defaultChecked required
            className="border-gray-300 rounded focus:ring-[#750D0D] w-5 h-5 text-red-700" />
          <label htmlFor="terms" className="text-sm" style={{ color: '#b0b0b0' }}>
            I have read and agree to the{' '}
            <a href={`${import.meta.env.BASE_URL}terms`} target="_blank" rel="noopener noreferrer" className="text-red-700 hover:underline">Terms & Conditions</a>{' '}
            and{' '}
            <a href={`${import.meta.env.BASE_URL}privacypolicy`} target="_blank" rel="noopener noreferrer" className="text-red-700 hover:underline">Privacy Policy</a>.
          </label>
        </div>

        <button form="checkoutForm" disabled={isSubmitting || loading}
          className="bg-gradient-to-r from-red-600/90 to-red-700/90 hover:from-red-700 hover:to-red-800 disabled:opacity-60 backdrop-blur-md mt-4 py-3 rounded-lg w-full font-medium text-white transition shadow-lg">
          {isSubmitting ? 'Processing…' : 'Place Order'}
        </button>
      </div>
    </>
  )
}

export default CartSection
