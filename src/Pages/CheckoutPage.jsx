import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CheckoutPopupModal,
  PopupStateProvider,
} from '../wa-checkout/components/Checkout'
import { generateClickid, getProductDetails } from '../wa-checkout/utils/productApi'
import TrackingScripts from '../wa-checkout/components/TrackingScripts'
import '../wa-checkout/App.css'

/**
 * CheckoutPage - WA PlayTonight checkout flow
 * Accessible at /checkout route
 * Renders the complete WA PlayTonight application as-is
 * Note: Router is handled by parent App.jsx, so we only render the components
 */
function CheckoutPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [headtag, setHeadtag] = useState(null)
  const [bodytag, setBodytag] = useState(null)
  const hasCalledApiRef = React.useRef(false)

  const [id, setIdState] = useState(() => {
    const urlId = searchParams.get('id') || ''
    if (urlId) return urlId
    try {
      const stored = localStorage.getItem('pt_product_id')
      if (stored) return stored
    } catch {
      // ignore storage errors
    }
    return ''
  })

  const [clickid, setClickidState] = useState(() => {
    const urlClickid = searchParams.get('clickid') || ''
    if (urlClickid) return urlClickid
    try {
      const storedClickid = localStorage.getItem('playtonight_clickid')
      if (storedClickid) return storedClickid
    } catch {
      // ignore storage errors
    }
    return ''
  })

  // Restore or persist product id in URL
  useEffect(() => {
    const urlId = searchParams.get('id') || ''
    if (urlId && urlId !== id) {
      setIdState(urlId)
      try {
        localStorage.setItem('pt_product_id', urlId)
      } catch {
        // ignore storage errors
      }
      return
    }

    if (!id) {
      try {
        const storedId = localStorage.getItem('pt_product_id')
        if (storedId) {
          setIdState(storedId)
          const newParams = new URLSearchParams(searchParams)
          newParams.set('id', storedId)
          window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`)
          setSearchParams(newParams)
        }
      } catch {
        // ignore storage errors
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Auto-generate and update clickid in URL if not present
  useEffect(() => {
    const urlClickid = searchParams.get('clickid') || ''
    if (urlClickid && urlClickid !== clickid) {
      setClickidState(urlClickid)
      if (id) {
        try {
          localStorage.setItem(`pt_clickid_${id}`, urlClickid)
          localStorage.setItem('playtonight_clickid', urlClickid)
        } catch {
          // ignore storage errors
        }
      }
      return
    }

    if (!id) return

    if (!clickid) {
      const newClickid = generateClickid(id)
      setClickidState(newClickid)
      const newParams = new URLSearchParams(searchParams)
      newParams.set('clickid', newClickid)
      if (!newParams.get('id')) newParams.set('id', id)
      window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`)
      setSearchParams(newParams)
      console.log('✅ Clickid auto-generated and added to URL:', newClickid)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, searchParams])

  // Fetch tracking scripts and populate cache on page load
  useEffect(() => {
    const fetchTracking = async () => {
      if (!id || !clickid) return

      // Prevent duplicate calls (React StrictMode runs useEffect twice)
      if (hasCalledApiRef.current) {
        console.log('⚠️ API already called, skipping duplicate')
        return
      }

      hasCalledApiRef.current = true

      try {
        const data = await getProductDetails({ id, clickid })
        if (data) {
          setHeadtag(data.headtag || null)
          setBodytag(data.bodytag || null)
        }
      } catch (error) {
        console.error('Failed to load product details:', error)
        hasCalledApiRef.current = false
      }
    }
    fetchTracking()
  }, [id, clickid])

  return (
    <PopupStateProvider>
      {headtag && <script dangerouslySetInnerHTML={{ __html: headtag }} />}
      {bodytag && <script dangerouslySetInnerHTML={{ __html: bodytag }} />}
      <TrackingScripts headtag={headtag} bodytag={bodytag} />
      <div className="App" style={{ minHeight: '100vh', background: '#0d0d1a' }}>
        {id && clickid ? (
          <CheckoutPopupModal showOnMount productId={id} clickid={clickid} />
        ) : (
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '14px' }}>
            Loading checkout…
          </div>
        )}
      </div>
    </PopupStateProvider>
  )
}

export default CheckoutPage
