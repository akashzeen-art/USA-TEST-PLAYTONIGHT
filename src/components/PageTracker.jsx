import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../utils/analytics'

// Page name mapping
const PAGE_NAMES = {
  '/': 'Landing Page',
  '/cart': 'Cart Page',
  '/terms': 'Terms & Conditions',
  '/privacypolicy': 'Privacy Policy',
  '/disclaimer': 'Disclaimer',
  '/refund': 'Refund Policy',
  '/payu-redirect': 'PayU Redirect',
  '/dashboard': 'Dashboard',
}

const PageTracker = () => {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    const pageName = PAGE_NAMES[path] || path
    trackPageView(path, pageName)
  }, [location.pathname])

  return null // This component doesn't render anything
}

export default PageTracker

