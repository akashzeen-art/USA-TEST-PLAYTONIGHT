import React from 'react'
import LegalFooterLinks from './legal/LegalFooterLinks'

const Footer = () => {
  return (
    <footer className="py-4 sm:py-5 w-full mb-16 shadow-lg" style={{ background: '#000047', color: '#fff' }}>
      <div className="flex flex-col justify-center gap-3 mx-auto px-2 sm:px-4 max-w-7xl text-center text-sm">
        <LegalFooterLinks />
        <div>
          Zeen Mediconnect OPC Pvt Ltd. <br />
          All Rights Reserved © 2026.
        </div>
      </div>
    </footer>
  )
}

export default Footer
