import React, { useState, useEffect } from 'react';
import './HeroSlider.css';

interface TextVariation {
  title: string[];
  subtitle: string;
}

const textVariations: TextVariation[] = [
  {
    title: ['Restore', 'Your', 'Power'],
    subtitle: 'Ancient Herbs. Modern Performance'
  },
  {
    title: ['Confidence', 'in Every', 'Capsule'],
    subtitle: 'From Daily Energy To Peak Performance'
  },
  {
    title: ['Performance', 'That', 'Matters'],
    subtitle: 'Naturally Boost What Matters Most'
  }
];

const HeroSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // Auto-change text every 4 seconds
    const interval = setInterval(() => {
      setIsChanging(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % textVariations.length);
        setTimeout(() => {
          setIsChanging(false);
        }, 50);
      }, 400); // Transition duration for fade out
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentText = textVariations[currentIndex];

  return (
    <section className="hero-slider">
      <div className="hero-video-container">
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          onError={(e) => {
            // Fallback to background image if video fails to load
            const target = e.target as HTMLVideoElement;
            target.style.display = 'none';
            const container = target.parentElement;
            if (container) {
              container.style.backgroundImage = `url(${import.meta.env.BASE_URL}assets/images/home-style-bg.jpg)`;
              container.style.backgroundSize = 'cover';
              container.style.backgroundPosition = 'center';
            }
          }}
        >
          <source src={'https://vz-79319016-ead.b-cdn.net/969412c3-448d-4710-9467-4d87b3e52de8/play_480p.mp4'} type="video/mp4" />
          
          {/* Fallback image if video doesn't load */}
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay"></div>
        <div className="video-fallback" style={{ display: 'none' }}>
          <img src={`${import.meta.env.BASE_URL}assets/images/home-style-bg.jpg`} alt="Hero background" />
        </div>
      </div>
      
      <div className={`hero-content active ${isChanging ? 'changing' : ''}`}>
        <div className="hero-text-wrapper">
          <h1 className="hero-title">
            {currentText.title.map((line, index) => (
              <span key={`${currentIndex}-${index}`} className="title-line">
                {line}
              </span>
            ))}
          </h1>
          <p key={`subtitle-${currentIndex}`} className="hero-subtitle">
            {currentText.subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;