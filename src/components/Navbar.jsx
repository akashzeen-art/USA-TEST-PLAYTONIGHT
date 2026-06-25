import React, { useState, useEffect } from 'react'

const Navbar = () => {
  const [timeLeft, setTimeLeft] = useState(48 * 60)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 48 * 60
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <nav style={{ background: 'linear-gradient(to bottom, #1a1a2e, #16213e)' }} className="shadow-2xl border-b border-white/10">
      <div className="flex justify-center items-center mx-auto px-4 py-4 max-w-6xl">
        <h1 className="text-center font-extrabold text-3xl lg:text-6xl drop-shadow-lg">
          <span className="text-white tracking-wide">PlayTonight</span>
          <br />
          <span
            className="animate-pulse text-4xl lg:text-6xl font-extrabold"
            style={{ background: 'linear-gradient(45deg, #ff6b35, #f7931e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            Festival Sale !!
          </span>
        </h1>
      </div>

      {/* Scrolling Ticker Strip */}
      <div className="py-2 overflow-hidden relative border-t border-white/10" style={{ background: 'rgba(0,0,71,0.85)' }}>
        <div className="animate-marquee whitespace-nowrap inline-block">
          <span className="font-bold text-lg mx-8" style={{ color: '#f7931e' }}>
            🔥 Order Now - Limited Time Offer - 50% OFF - Hurry Up! ⏰ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} Left
          </span>
          <span className="font-bold text-lg mx-8" style={{ color: '#f7931e' }}>
            🔥 Order Now - Limited Time Offer - 50% OFF - Hurry Up! ⏰ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} Left
          </span>
          <span className="font-bold text-lg mx-8" style={{ color: '#f7931e' }}>
            🔥 Order Now - Limited Time Offer - 50% OFF - Hurry Up! ⏰ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} Left
          </span>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
