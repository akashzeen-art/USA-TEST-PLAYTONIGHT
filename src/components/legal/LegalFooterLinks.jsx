import { Link } from 'react-router-dom'

const sepStyle = { color: 'rgba(255,255,255,0.45)' }
const linkStyle = { color: '#ff6b35' }

/**
 * Pipe-separated legal links. Works with React Router basename (/dom, /int, /com).
 */
export default function LegalFooterLinks({ compact = false, className = '' }) {
  const size = compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'
  return (
    <nav
      className={`flex flex-wrap justify-center items-center gap-x-1.5 gap-y-1 px-2 ${size} ${className}`.trim()}
      aria-label="Legal policies"
    >
      <Link to="/disclaimer" style={linkStyle} className="hover:underline whitespace-nowrap">
        Disclaimer
      </Link>
      <span style={sepStyle} aria-hidden="true">
        |
      </span>
      <Link to="/terms" style={linkStyle} className="hover:underline whitespace-nowrap">
        Terms & Conditions
      </Link>
      <span style={sepStyle} aria-hidden="true">
        |
      </span>
      <Link to="/privacypolicy" style={linkStyle} className="hover:underline whitespace-nowrap">
        Privacy Policy
      </Link>
      <span style={sepStyle} aria-hidden="true">
        |
      </span>
      <Link to="/refund" style={linkStyle} className="hover:underline whitespace-nowrap">
        Refund & Cancellation Policy
      </Link>
    </nav>
  )
}
