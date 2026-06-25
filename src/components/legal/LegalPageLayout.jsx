import Footer from '../Footer'
import { LEGAL_COMPANY, LEGAL_SITE_URL } from './legalConstants'

const accent = '#f7931e'
const muted = '#b0b0b0'
const link = '#ff6b35'

export function LegalH2({ num, children }) {
  const label = num != null ? `${String(num).padStart(2, '0')} ${children}` : children
  return (
    <h2
      className="pb-2 font-semibold text-2xl"
      style={{ color: accent, borderBottom: '1px solid rgba(255,107,53,0.3)' }}
    >
      {label}
    </h2>
  )
}

export function LegalUl({ items }) {
  return (
    <ul className="space-y-2 mt-3 pl-6 list-disc">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export function LegalContact({ address }) {
  return (
    <div>
      <LegalH2>Contact Us</LegalH2>
      <div className="space-y-2 mt-3 leading-relaxed">
        <p className="font-medium text-white">✉ Contact Us</p>
        <address className="not-italic" style={{ color: muted }}>
          {address}
        </address>
        <p>
          <a href="tel:+919217528957" style={{ color: link }} className="hover:underline">
            +91 92175 28957
          </a>
        </p>
        <p>
          <a href="mailto:bd@zeenmediconnect.com" style={{ color: link }} className="hover:underline">
            bd@zeenmediconnect.com
          </a>
        </p>
      </div>
    </div>
  )
}

export default function LegalPageLayout({ title, intro, children }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%)', minHeight: '100vh' }}>
      <nav style={{ background: '#000047' }} className="shadow-md">
        <div className="flex items-center mx-auto px-4 py-3 max-w-6xl">
          <h1 className="font-bold text-white text-xl">PLAY TONIGHT</h1>
        </div>
      </nav>
      <section
        className="mx-2 sm:mx-auto my-10 p-6 sm:p-10 rounded-2xl max-w-4xl"
        style={{ background: 'rgba(20,20,40,0.95)', border: '1px solid rgba(255,107,53,0.15)' }}
      >
        <header className="mb-8">
          <h1 className="font-bold text-white text-3xl sm:text-4xl tracking-tight">{title}</h1>
          <p className="mt-3 text-base sm:text-lg leading-relaxed" style={{ color: muted }}>
            {intro}
          </p>
          <p className="mt-2 text-sm" style={{ color: muted }}>
            {LEGAL_COMPANY}
          </p>
        </header>
        <div className="space-y-8 max-w-none" style={{ color: muted }}>
          {children}
        </div>
      </section>
      <Footer />
    </div>
  )
}

export function LegalSiteLink() {
  return (
    <a href={LEGAL_SITE_URL} style={{ color: link }} className="hover:underline">
      {LEGAL_SITE_URL}
    </a>
  )
}
