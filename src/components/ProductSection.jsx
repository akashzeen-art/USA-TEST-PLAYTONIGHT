import React from 'react'
import { trackButtonClick } from '../utils/analytics'
import DoublePackPriceDisplay from './DoublePackPriceDisplay'

const ProductSection = ({ product, loading, refreshing, error, productId, clickid }) => {
  const name = product?.name
  const numericPrice = product?.price
  const currency = product?.currency || 'INR'
  const discountPercent = product?.discount || 50

  const cardStyle = {
    background: 'linear-gradient(to bottom, rgba(42,42,42,0.45), rgba(58,58,58,0.45))',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
  }

  const featureCardStyle = {
    background: 'rgba(74,74,74,0.25)',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(85,85,85,0.5)',
  }

  return (
    <div className="relative shadow-2xl mx-auto p-4 rounded-xl max-w-6xl overflow-hidden" style={cardStyle}>
      <h3 className="mb-3 font-extrabold text-lg md:text-2xl text-center drop-shadow-sm" style={{ color: '#f7931e' }}>
        For The First Time In The World — PlayTonight
      </h3>
      <h3 className="mb-4 font-extrabold text-xl md:text-2xl text-center drop-shadow-sm" style={{ color: '#ff6b35' }}>
        100x Better Than Viagra — 100% Safe Herbal Formula
      </h3>

      <DoublePackPriceDisplay
        unitPrice={numericPrice}
        currency={currency}
        discountPercent={discountPercent}
        loading={loading && !numericPrice}
        variant="hero"
      />

      <div className="items-center gap-8 grid grid-cols-1 md:grid-cols-2">
        <div className="flex justify-center">
          <img
            src={`${import.meta.env.BASE_URL}Capsules.png`}
            alt="PlayTonight Box"
            className="w-40 md:w-52 object-contain drop-shadow-2xl"
          />
        </div>
        <div className="text-center md:text-left">
          <h4 className="font-bold text-base leading-relaxed" style={{ color: '#e0e0e0' }}>
            It's All About Real Masculinity & Performance
          </h4>
          <h4 className="font-bold text-base md:text-lg leading-relaxed mt-1" style={{ color: '#f7931e' }}>
            Trusted by 10 Lakh+ Men.
          </h4>
          <br />
          <h4 className="font-bold text-base md:text-lg leading-relaxed" style={{ color: '#ff6b35' }}>
            With PlayTonight, Every Night Will Be More EXPLOSIVE!
          </h4>
        </div>
      </div>

      <div className="gap-4 md:gap-6 grid grid-cols-1 sm:grid-cols-2 mt-6 text-center">
        <div className="p-3 rounded-lg transition-all duration-300 hover:-translate-y-1" style={featureCardStyle}>
          <h5 className="font-bold text-base md:text-lg" style={{ color: '#f7931e' }}>Real Strength</h5>
          <p className="text-sm mt-1" style={{ color: '#b0b0b0' }}>Naturally boosts stamina and energy</p>
        </div>
        <div className="p-3 rounded-lg transition-all duration-300 hover:-translate-y-1" style={featureCardStyle}>
          <h5 className="font-bold text-base md:text-lg" style={{ color: '#f7931e' }}>Improved Erectile Function</h5>
          <p className="text-sm mt-1" style={{ color: '#b0b0b0' }}>Supports firm and sustained performance on demand</p>
        </div>
        <div className="p-3 rounded-lg transition-all duration-300 hover:-translate-y-1" style={featureCardStyle}>
          <h5 className="font-bold text-base md:text-lg" style={{ color: '#f7931e' }}>Longer Performance</h5>
          <p className="text-sm mt-1" style={{ color: '#b0b0b0' }}>Helps you last longer in bed</p>
        </div>
        <div className="p-3 rounded-lg transition-all duration-300 hover:-translate-y-1" style={featureCardStyle}>
          <h5 className="font-bold text-base md:text-lg" style={{ color: '#f7931e' }}>Boost Confidence</h5>
          <p className="text-sm mt-1" style={{ color: '#b0b0b0' }}>Regain your self-confidence</p>
        </div>
      </div>

      <div className="md:block flex flex-col justify-center items-center md:justify-between mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center w-full">
          <p className="font-extrabold text-lg md:text-2xl" style={{ color: '#e0e0e0' }}>
            2 Tablets Before Making Love <br />With Milk / Buttermilk
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center w-full">
          <p className="font-extrabold text-2xl md:text-4xl animate-pulse" style={{ color: '#ff6b35' }}>
            Works In Just 45 Minutes
          </p>
        </div>
        <button
          className="md:hidden mt-6 py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 w-full max-w-xs shadow-lg uppercase tracking-wide"
          style={{ background: 'linear-gradient(45deg, #ff6b35, #f7931e)', boxShadow: '0 4px 15px rgba(255,107,53,0.3)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(45deg, #e55a2b, #e8851a)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(45deg, #ff6b35, #f7931e)'; e.currentTarget.style.transform = 'translateY(0)' }}
          onClick={() => {
            trackButtonClick('Order Now')
            document.getElementById('shipping')?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          Order Now
        </button>
      </div>

      <img
        src={`${import.meta.env.BASE_URL}7.png`}
        alt="Doctor"
        className="hidden md:block bottom-0 left-1/2 absolute w-36 md:w-36 object-contain -translate-x-1/2"
      />
    </div>
  )
}

export default ProductSection
