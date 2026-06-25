import React, { useState } from 'react';
import './BlogSection.css';
import { CheckoutModal, ScrollToBottomPopup } from './Checkout';
import { usePopupState } from './Checkout';

const benefits = [
  {
    id: 1,
    title: "Enhanced Vitality",
    description: "Naturally boosts stamina and energy"
  },
  {
    id: 2,
    title: "Stronger Erections",
    description: "Helps you stay firm whenever you desire"
  },
  {
    id: 3,
    title: "Improved Endurance",
    description: "Supports longer-lasting performance"
  },
  {
    id: 4,
    title: "Boosted Confidence",
    description: "Restores self-assurance in intimacy"
  }
];

const BlogSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setHasManualPopupOpened, setIsManualPopupOpen } = usePopupState();

  const handleOrderNow = () => {
    setHasManualPopupOpened(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Track modal state
  React.useEffect(() => {
    setIsManualPopupOpen(isModalOpen);
  }, [isModalOpen, setIsManualPopupOpen]);
  return (
    <section className="blog-section play-tonight-section">
      <div className="content_container">
        <div className="column_row">
          <div className="column_container column-1_1">
            <div className="column-inner">
              <div className="empty_space hide_on_mobile h-2em"></div>
              <div className="empty_space h-4_3em"></div>
              
              <div className="play-tonight-header">
                <div className="hero-product-cta">
                  <img
                    src={`${import.meta.env.BASE_URL}Capsules.png`}
                    alt="Play Tonight — product"
                    className="hero-product-image"
                  />
                  <button type="button" className="order-now-btn hero-order-now-btn" onClick={handleOrderNow}>
                    ORDER NOW
                  </button>
                </div>
                <h1 className="main-headline">Your Sexual Life Matters</h1>
                <h2 className="sub-headline">100 Times Better Than Harmful Viagra</h2>
              </div>

              <div className="play-tonight-content">
                <div className="product-intro">
                  <h3 className="product-title">Play Tonight</h3>
                  {/* <p className="product-description">
                    "Wellness For Men"
                  </p> */}
                  <h4 className="product-subtitle">"Wellness For Men"</h4>
                  <h4 className="product-subtitle">Introducing Play Tonight For Long Lasting Everyday Sex!</h4>
                  <p className="product-description">
                    When it comes to real masculinity and performance, this is the trusted formula for 1 million+ men. With PlayTonight, every night becomes even more powerful.
                  </p>
                </div>

                <div className="benefits-grid">
                  {benefits.map(benefit => (
                    <div key={benefit.id} className="benefit-card">
                      <h5 className="benefit-title">{benefit.title}</h5>
                      <p className="benefit-description">{benefit.description}</p>
                    </div>
                  ))}
                </div>

                <div className="product-images-gallery">
                  <div className="image-item">
                    <img src={`${import.meta.env.BASE_URL}1.png`} alt="Product 1" />
                  </div>
                  <div className="image-item">
                    <img src={`${import.meta.env.BASE_URL}2.png`} alt="Product 2" />
                  </div>
                  <div className="image-item">
                    <img src={`${import.meta.env.BASE_URL}3.png`} alt="Product 3" />
                  </div>
                  <div className="image-item">
                    <img src={`${import.meta.env.BASE_URL}4.png`} alt="Product 4" />
                  </div>
                  <div className="image-item">
                    <img src={`${import.meta.env.BASE_URL}5.png`} alt="Product 5" />
                  </div>
                  <div className="image-item">
                    <img src={`${import.meta.env.BASE_URL}6.png`} alt="Product 6" />
                  </div>
                </div>

                <div className="usage-info">
                  <div className="usage-item">
                    <span className="usage-icon">💊</span>
                    <span className="usage-text">2 Capsules Before Sex</span>
                  </div>
                  <div className="usage-item">
                    <span className="usage-icon">⏱️</span>
                    <span className="usage-text">Works In Just 45 Mins</span>
                  </div>
                </div>

                <div className="order-now-section">
                  <button className="order-now-btn" onClick={handleOrderNow}>
                    ORDER NOW
                  </button>
                  <br />
                  <br />
                <p className="product-description">
                    The product will be delivered in the name of Wellness For Men <br />
                    We ensure that your order remains “private” during the delivery process.
                </p>
                </div>
              </div>

              <div className="empty_space h-5em"></div>
            </div>
          </div>
        </div>
      </div>
      <CheckoutModal isOpen={isModalOpen} onClose={handleCloseModal} />
      <ScrollToBottomPopup />
    </section>
  );
};

export default BlogSection;
