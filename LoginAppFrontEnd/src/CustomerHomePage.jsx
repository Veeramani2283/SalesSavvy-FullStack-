import React, { useState, useEffect } from 'react';
import { CategoryNavigation } from './CategoryNavigation';
import { ProductList } from './ProductList';
import { Footer } from './Footer';
import { Header } from './Header';
import './assets/styles.css';

export default function CustomerHomePage({ setUser }) {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [cartError, setCartError] = useState(false); // State for cart fetch error
  const [isCartLoading, setIsCartLoading] = useState(true); // State for cart loading
  const [cartItemQuantities, setCartItemQuantities] = useState({}); // per-product quantities

  useEffect(() => {
    fetchProducts();
    fetchCartDetails();
  }, [username]);

  const fetchProducts = async (category = '') => {
    try {
      const response = await fetch(
        `http://localhost:9090/api/products${category ? `?category=${category}` : ''}`,
        { credentials: 'include' } // Include authToken as a cookie
      );
      const data = await response.json();
      if(data)
     { 
      setUsername(data.user?.name || 'Guest'); // Extract username
      setEmail(
        data.user?.email ||
          data.user?.mail ||
          data.user?.emailId ||
          data.user?.user_email ||
          ''
      );
      setProducts(data.products || []);
    }else{
      setProducts([]);

    }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchCartDetails = async () => {
    setIsCartLoading(true);
    try {
      const response = await fetch('http://localhost:9090/api/cart/items', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      const data = await response.json();
      const items = data?.cart?.products || [];
      setEmail(
        data?.user?.email ||
          data?.user?.mail ||
          data?.user?.emailId ||
          data?.user?.user_email ||
          ''
      );

      const quantities = {};
      let totalCount = 0;
      items.forEach((item) => {
        const qty = item.quantity || 0;
        quantities[item.product_id] = qty;
        totalCount += qty;
      });

      setCartItemQuantities(quantities);
      setCartCount(totalCount);
      setCartError(false);
    } catch (error) {
      console.error('Error fetching cart details:', error);
      setCartError(true);
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    fetchProducts(category);
  };

  const handleAddToCart = async (productId) => {
    if (!username) {
      console.error('Username is required to add items to the cart');
      return;
    }
    try {
      const response = await fetch('http://localhost:9090/api/cart/add', {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({ username, productId }), // Include username and productId in the request
        headers: { 'Content-Type': 'application/json' },
        // Include authToken as a cookie
      });

      if (response.ok) {
        await handleChangeQuantity(productId, 'inc');
      } else {
        console.error('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  const handleChangeQuantity = async (productId, type) => {
    const current = cartItemQuantities[productId] || 0;
    const newQuantity = type === 'inc' ? current + 1 : current - 1;

    try {
      if (newQuantity <= 0) {
        await fetch('http://localhost:9090/api/cart/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, productId }),
        });
      } else {
        await fetch('http://localhost:9090/api/cart/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, productId, quantity: newQuantity }),
        });
      }

      setCartItemQuantities((prev) => {
        const updated = { ...prev };
        if (newQuantity <= 0) {
          delete updated[productId];
        } else {
          updated[productId] = newQuantity;
        }
        return updated;
      });

      setCartCount((prev) => {
        const delta = newQuantity - current;
        const next = prev + delta;
        return next < 0 ? 0 : next;
      });
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  return (
    <div className="customer-homepage">
      <Header
        cartCount={isCartLoading ? '...' : cartError ? 'Error' : cartCount}
        username={username}
        email={email}
        onLogoutSuccess={() => setUser && setUser(null)}
      />
      <nav className="navigation">
        <CategoryNavigation onCategoryClick={handleCategoryClick} />
      </nav>
      <main className="main-content">
        <ProductList
          products={products}
          onAddToCart={handleAddToCart}
          onQuantityChange={handleChangeQuantity}
          cartItemQuantities={cartItemQuantities}
        />
      </main>
      <Footer />
    </div>
  );
}