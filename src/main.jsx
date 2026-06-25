import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'


;(function captureClickidOnLoad() {
  const searchParams = new URLSearchParams(window.location.search)
  const variations = ['clickid', 'click_id', 'clickId', 'CLICKID', 'cid', 'ref']
  
  // Supports prefixed routes like /dom/checkout, /int/checkout, /com/checkout
  const isCheckoutRoute = /\/checkout\/?$/.test(window.location.pathname)
  
  for (const key of variations) {
    const value = searchParams.get(key)
    if (value) {
      localStorage.setItem('playtonight_clickid', value)
      console.log('✅ Clickid captured on page load:', value)
      return
    }
  }
  
  // Auto-generate clickid for /checkout route if not present
  if (isCheckoutRoute && !searchParams.get('clickid')) {
    try {
      // Generate UUID
      let uuid
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        uuid = crypto.randomUUID()
      } else {
        // Fallback UUID generation
        uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = (Math.random() * 16) | 0
          const v = c === 'x' ? r : ((r & 0x3) | 0x8)
          return v.toString(16)
        })
      }
      
      // Format as 0000 + UUID
      const formattedClickid = '0000' + uuid
      
      // Store in localStorage
      localStorage.setItem('playtonight_clickid', formattedClickid)
      
      // Update URL
      const newParams = new URLSearchParams(searchParams)
      newParams.set('clickid', formattedClickid)
      const newUrl = `${window.location.pathname}?${newParams.toString()}`
      window.history.replaceState({}, '', newUrl)
      
      console.log('✅ Clickid auto-generated for /checkout:', formattedClickid)
    } catch (error) {
      console.warn('Failed to generate clickid:', error)
    }
  }
})()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

