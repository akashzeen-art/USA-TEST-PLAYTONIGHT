import React from 'react'
import { trackButtonClick } from '../utils/analytics'

const VideoBanner = () => {
  return (
    <div className="relative flex justify-center items-center rounded-lg overflow-hidden" style={{ background: 'rgba(42,42,42,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <video
        autoPlay
        loop
        playsInline
        className="lg:rounded-lg w-full h-full object-cover"
        muted
      >
        <source src={'https://vz-79319016-ead.b-cdn.net/969412c3-448d-4710-9467-4d87b3e52de8/play_480p.mp4'} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="md:hidden right-4 bottom-4 absolute">
        <button
          className="font-semibold text-white py-3 px-5 rounded-lg transition-all duration-300 shadow-lg"
          style={{ background: 'linear-gradient(45deg, #ff6b35, #f7931e)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(45deg, #e55a2b, #e8851a)'}
          onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(45deg, #ff6b35, #f7931e)'}
          onClick={() => {
            trackButtonClick('Order Now (Banner)')
            document.getElementById('shipping')?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          Order Now
        </button>
      </div>
    </div>
  )
}

export default VideoBanner
