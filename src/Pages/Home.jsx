import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import CartSection from '../components/CartSection'
import TrackingScripts from '../components/TrackingScripts'
import { getProductDetails } from '../utils/productApi'

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [id, setIdState] = useState(() => {
    const urlId = searchParams.get('id') || ''
    if (urlId) return urlId
    // Check localStorage for persisted id
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
    // Check localStorage for persisted clickid
    if (id) {
      try {
        const stored = localStorage.getItem(`pt_clickid_${id}`)
        if (stored) return stored
      } catch {
        // ignore storage errors
      }
    }
    return ''
  })

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)
  const [headtag, setHeadtag] = useState(null)
  const [bodytag, setBodytag] = useState(null)

  const abortRef = useRef(null)
  const lastInitialFetchTsRef = useRef(0)
  const productRef = useRef(null)
  const loggedClickKey = id && clickid ? `pt_click_logged_${id}_${clickid}` : ''
  const clickidGeneratedRef = useRef(false)

  // Generate and persist id if missing
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

    if (!id || id.trim() === '') {
      // Check localStorage first (persist across refreshes)
      const storedId = localStorage.getItem('pt_product_id')
      if (storedId) {
        setIdState(storedId)
        // Update URL without page reload
        const newParams = new URLSearchParams(searchParams)
        newParams.set('id', storedId)
        window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`)
        setSearchParams(newParams)
        return
      }

      // Generate default id
      const defaultId = ''
      setIdState(defaultId)

      // Store in localStorage
      try {
        localStorage.setItem('pt_product_id', defaultId)
      } catch {
        // ignore storage errors
      }

      // Update URL without page reload
      const newParams = new URLSearchParams(searchParams)
      newParams.set('id', defaultId)
      window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`)
      setSearchParams(newParams)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Generate and persist clickid if missing
  useEffect(() => {
    if (!id) return

    const urlClickid = searchParams.get('clickid') || ''
    if (urlClickid) {
      // Always use URL clickid if present
      if (urlClickid !== clickid) {
        setClickidState(urlClickid)
        try {
          localStorage.setItem(`pt_clickid_${id}`, urlClickid)
        } catch {
          // ignore storage errors
        }
      }
      return
    }

    // If clickid is missing, generate one
    if (!clickid || clickid.trim() === '') {
      // Check localStorage first (persist across refreshes)
      const storedClickid = localStorage.getItem(`pt_clickid_${id}`)
      if (storedClickid) {
        setClickidState(storedClickid)
        // Update URL without page reload
        const newParams = new URLSearchParams(searchParams)
        newParams.set('clickid', storedClickid)
        window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`)
        setSearchParams(newParams)
        clickidGeneratedRef.current = true
        return
      }

      // Generate new clickid
      let generatedClickid
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        generatedClickid = crypto.randomUUID()
      } else {
        generatedClickid = Math.random().toString(36).slice(2) + Date.now().toString(36)
      }

      setClickidState(generatedClickid)

      // Store in localStorage
      try {
        localStorage.setItem(`pt_clickid_${id}`, generatedClickid)
      } catch {
        // ignore storage errors
      }

      // Update URL without page reload
      const newParams = new URLSearchParams(searchParams)
      newParams.set('clickid', generatedClickid)
      window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`)
      setSearchParams(newParams)
      clickidGeneratedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, searchParams])

  useEffect(() => {
    productRef.current = product
  }, [product])

  // Show last known price instantly (if we have it), then update in background.
  useEffect(() => {
    if (!id) return
    try {
      const cachedRaw = localStorage.getItem(`pt_product_cache_${id}`)
      if (!cachedRaw) return
      const cached = JSON.parse(cachedRaw)
      if (cached && Number.isFinite(Number(cached.price))) {
        setProduct({
          id,
          clickid,
          name: cached.name || '',
          price: Number(cached.price),
          priceDisplay: cached.priceDisplay ?? String(cached.price),
          currency: cached.currency || 'INR',
          discount: cached.discount || 50,
          qty: cached.qty ?? 1,
          flow: String(cached.flow || '').trim().toLowerCase(),
          raw: cached.raw ?? null,
        })
        if (cached.cachedAt) setLastUpdatedAt(new Date(cached.cachedAt))
        setLoading(false)
      }
    } catch {
      // ignore cache errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchAndUpdate = async ({ isInitial = false } = {}) => {
    if (!id || !clickid) {
      setError('Missing required URL params: id and clickid')
      setLoading(false)
      return
    }

    // FRONTEND-ONLY FIX to stop duplicate/null backend "nutra click" logs:
    // If this click was already logged once for this browser, DO NOT hit getproductDetails again.
    // This prevents backend from logging duplicate clickid or logging `null` during refresh/background calls.
    // REMOVED: Allow API call even if clickid was logged before to ensure price is always fetched

    if (isInitial) {
      const hasCached = !!productRef.current
      if (!hasCached) setLoading(true)
      else setRefreshing(true)
      setError('')
    }

    // Avoid accidental “spam” duplicate initial calls (e.g., React StrictMode dev double-mount)
    // by skipping if another initial fetch happened very recently.
    if (isInitial) {
      const now = Date.now()
      if (now - lastInitialFetchTsRef.current < 1500) {
        return
      }
      lastInitialFetchTsRef.current = now
    }

    // Cancel any in-flight request before starting a new one
    abortRef.current?.abort?.()
    const controller = new AbortController()
    abortRef.current = controller
    const hasAnyPrice = !!productRef.current
    // First load can be slower (cold backend, mobile networks). Be more patient initially.
    const timeoutMs = isInitial && !hasAnyPrice ? 20000 : 8000
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      // Call once with a valid clickid (first visit only). Backend should log exactly once.
      const raw = await getProductDetails({ id, clickid, signal: controller.signal })

      // Normalize fields defensively (backend shape may vary)
      const priceRaw = raw?.price
      const priceNumber = Number(priceRaw)
      const normalized = {
        id,
        clickid,
        name: raw?.name ?? raw?.productName ?? raw?.product_name ?? '',
        price: priceNumber,
        priceDisplay:
          typeof priceRaw === 'string' || typeof priceRaw === 'number'
            ? String(priceRaw)
            : String(priceNumber),
        currency: raw?.currency || 'INR',
        discount: raw?.discount || 50,
        qty: raw?.qty ?? 1,
        flow: String(raw?.flow || '').trim().toLowerCase(),
        raw,
        headtag: raw?.headtag ?? null,
        bodytag: raw?.bodytag ?? null,
      }

      if (!Number.isFinite(normalized.price)) {
        throw new Error('Product API returned an invalid price')
      }

      setProduct((prev) => {
        if (!prev) return normalized
        // Only update UI immediately if price (or name) changed
        if (
          prev.price !== normalized.price ||
          prev.priceDisplay !== normalized.priceDisplay ||
          prev.name !== normalized.name
        )
          return normalized
        return prev
      })

      // Extract tracking scripts from API response
      console.log('🔍 API raw:', raw);
      console.log('🔍 Normalized headtag:', normalized.headtag);
      console.log('🔍 Normalized bodytag:', normalized.bodytag);
      if (normalized.headtag) {
        setHeadtag(normalized.headtag);
        console.log('✅ Headtag state set');
      }
      if (normalized.bodytag) {
        setBodytag(normalized.bodytag);
        console.log('✅ Bodytag state set');
      }
      const now = new Date()
      setLastUpdatedAt(now)
      try {
        // Mark click as logged (so refresh will not call this endpoint again)
        if (loggedClickKey) localStorage.setItem(loggedClickKey, '1')

        localStorage.setItem(
          `pt_product_cache_${id}`,
          JSON.stringify({
            name: normalized.name,
            price: normalized.price,
            priceDisplay: normalized.priceDisplay,
            currency: normalized.currency,
            discount: normalized.discount,
            cachedAt: now.toISOString(),
          })
        )
      } catch {
        // ignore cache write errors
      }
      setError('')
    } catch (e) {
      // If we already have a price (cached/previous), don't spam the UI with background errors.
      // Only show errors when we have nothing to display.
      if (!hasAnyPrice) {
        if (e?.name === 'AbortError') {
          setError('Price request timed out. Please retry.')
        } else {
          setError(e?.message || 'Failed to load product details')
        }
      } else {
        // keep UI clean; log for debugging only
        console.warn('Product refresh failed:', e)
      }
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAndUpdate({ isInitial: true })

    return () => {
      abortRef.current?.abort?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, clickid])

  return (
    <>
      {headtag && <script dangerouslySetInnerHTML={{ __html: headtag }} />}
      {bodytag && <script dangerouslySetInnerHTML={{ __html: bodytag }} />}
      <TrackingScripts headtag={headtag} bodytag={bodytag} />
      <div
        className="min-h-screen flex items-center justify-center px-4 py-6"
        style={{ background: '#0d0d1a' }}
        id="shipping"
      >
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
          <CartSection
            product={product}
            loading={loading}
            refreshing={refreshing}
            error={error}
            lastUpdatedAt={lastUpdatedAt}
            onRetry={() => fetchAndUpdate({ isInitial: true })}
            productId={id}
            clickid={clickid}
            navigate={navigate}
          />
        </div>
      </div>
    </>
  )
}

export default Home
