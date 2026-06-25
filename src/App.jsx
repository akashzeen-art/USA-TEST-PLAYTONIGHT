import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ThankYou from './Pages/ThankYou'
import Home from './Pages/Home'
import Terms from './Pages/Terms'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import Disclaimer from './Pages/Disclaimer'
import Refund from './Pages/Refund'
import PayURedirectPage from './Pages/PayURedirectPage'
import Dashboard from './Pages/Dashboard'
import CheckoutPage from './Pages/CheckoutPage'
import WAPayURedirectPage from './wa-checkout/Pages/PayURedirectPage'
import PageTracker from './components/PageTracker'

function App() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('payment') === 'success') {
    return (
      <ThankYou
        phone={params.get('phone') || ''}
        productId={params.get('id') || ''}
        source={params.get('source') || 'home'}
      />
    )
  }

  const baseName = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

  return (
    <Router basename={baseName}>
      <PageTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Home />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/payu-redirect" element={<PayURedirectPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* WA PlayTonight checkout flow */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/payu-redirect" element={<WAPayURedirectPage />} />
        {/* Prefixed deploy paths: /int/checkout, /dom/checkout, /com/checkout */}
        <Route path="/:prefix/checkout" element={<CheckoutPage />} />
        <Route path="/:prefix/checkout/payu-redirect" element={<WAPayURedirectPage />} />
      </Routes>
    </Router>
  )
}

export default App

