
import React from 'react';
import './assets/styles.css';

export function ProductList({
  products,
  onAddToCart,
  onQuantityChange,
  cartItemQuantities = {},
}) {
  if (products.length === 0) {
    return <p className="no-products">No products available.</p>;
  }

  return (
    <section className="product-section">
      <div className="product-section-header">
        <h2 className="product-section-title">Our Products</h2>
      </div>
      <div className="product-list">
        <div className="product-grid">
          {products.map((product) => {
            const quantity = cartItemQuantities[product.product_id] || 0;
            return (
            <div key={product.product_id} className="product-card">
              {quantity > 0 && (
                <div className="product-badge">
                  In Cart: {quantity}
                </div>
              )}
              <img
                src={product.images[0]}
                alt={product.name}
                className="product-image"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">₹{product.price}</p>
                {quantity === 0 ? (
                  <button
                    className="add-to-cart-btn"
                    onClick={() => onAddToCart(product.product_id)}
                  >
                    Add to Cart
                  </button>
                ) : (
                  <div className="product-qty-inline">
                    <button
                      type="button"
                      className="product-qty-btn"
                      onClick={() => onQuantityChange && onQuantityChange(product.product_id, 'dec')}
                    >
                      -
                    </button>
                    <span className="product-qty-value">{quantity}</span>
                    <button
                      type="button"
                      className="product-qty-btn"
                      onClick={() => onQuantityChange && onQuantityChange(product.product_id, 'inc')}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          )})}
        </div>
      </div>
    </section>
  );
}