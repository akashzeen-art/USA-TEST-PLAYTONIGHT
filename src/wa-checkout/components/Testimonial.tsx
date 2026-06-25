import React from 'react';
import './Testimonial.css';

const products = [
  {
    id: 1,
    name: "Hamza",
    rating: 5,
    image: "1m.jpeg"
  },
  {
    id: 2,
    name: "Koa",
    rating: 5,
    image: "2m.jpeg"
  },
  {
    id: 3,
    name: "Robert",
    rating: 5,
    image: "3m.jpeg"
  },
  {
    id: 4,
    name: "Zaire",
    rating: 5,
    image: "4m.jpeg"
  },
  {
    id: 5,
    name: "Ashwin",
    rating: 5,
    image: "5m.jpeg"
  }
];

const Testimonial: React.FC = () => {
  const renderStars = (rating: number) => {
    if (rating === 0) return null;
    const percentage = (rating / 5) * 100;
    return (
      <div className="star-rating" title={`Rated ${rating} out of 5`}>
        <span className="w_100per" style={{ width: `${percentage}%` }}>
          <strong className="rating">{rating}</strong>
        </span>
      </div>
    );
  };

  return (
    <section className="product-section">
      <div className="content_container">
        <div className="empty_space h-5em"></div>
        <div className="sc_title sc_title_default">
          <h2 className="sc_item_title">Energy. Endurance. Excellence</h2>
          <div className="sc_item_descr">Globally Accepted PlayTonight For Men. A performance-driven formula designed to help you feel stronger, more energized, and in control.</div>
        </div>
        <div className="empty_space h-2_3em"></div>
        <div className="woocommerce columns-5">
          <ul className="products wcspt-products">
          {products.map(product => (
              <li key={product.id} className="product type-product wcspt-has-gallery">
                <div className="post_item post_layout_thumbs">
                  <div className="post_featured">
                    <div className="product-img-wrapper">
                      <img src={`${import.meta.env.BASE_URL}assets/images/${product.image}`} alt={product.name} />
                    </div>
                  </div>
                  <div className="post_data">
                    <div className="post_header">
                      <h3>{product.name}</h3>
                      {renderStars(product.rating)}
                    </div>
                  </div>
                </div>
              </li>
          ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
