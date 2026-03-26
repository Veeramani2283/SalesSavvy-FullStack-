import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";
import Header from "./Header";
import { Footer } from "./Footer";

export default function CartPage({ setUser }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [overallPrice, setOverallPrice] = useState("0.00");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setError("");
        setLoading(true);
        const response = await fetch("http://localhost:9090/api/cart/items", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch cart items");
        }
        const data = await response.json();

        setCartItems(
          (data?.cart?.products || []).map((item) => ({
            ...item,
            total_price: parseFloat(item.total_price).toFixed(2),
            price_per_unit: parseFloat(item.price_per_unit).toFixed(2),
          }))
        );

        setOverallPrice(parseFloat(data?.cart?.overall_total_price || 0).toFixed(2));
        setUsername(data?.username || "");
        setEmail(
          data?.user?.email ||
            data?.user?.mail ||
            data?.user?.emailId ||
            data?.user?.user_email ||
            data?.email ||
            ""
        );
      } catch (err) {
        setError(err.message || "Failed to load cart.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const subtotal = useMemo(() => {
    return cartItems
      .reduce((total, item) => total + parseFloat(item.total_price || 0), 0)
      .toFixed(2);
  }, [cartItems]);

  const handleRemoveItem = async (productId) => {
    try {
      const response = await fetch("http://localhost:9090/api/cart/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, productId }),
      });

      if (response.status === 204) {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.product_id !== productId)
        );
        return;
      }
      throw new Error("Failed to remove item");
    } catch (err) {
      setError(err.message || "Error removing item.");
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        await handleRemoveItem(productId);
        return;
      }

      const response = await fetch("http://localhost:9090/api/cart/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, productId, quantity: newQuantity }),
      });

      if (response.ok) {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.product_id === productId
              ? {
                  ...item,
                  quantity: newQuantity,
                  total_price: (item.price_per_unit * newQuantity).toFixed(2),
                }
              : item
          )
        );
      } else {
        throw new Error("Failed to update quantity");
      }
    } catch (err) {
      setError(err.message || "Error updating quantity.");
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const handleCheckout = async () => {
    try {
      setIsCheckoutLoading(true);
      const amountValue = parseFloat(subtotal);
      if (!amountValue || amountValue <= 0) {
        alert("Cart total must be greater than zero.");
        return;
      }

      const requestBody = {
        totalAmount: amountValue,
        cartItems: cartItems.map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: parseFloat(item.price_per_unit),
        })),
      };

      const response = await fetch("http://localhost:9090/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Support both plain-text and JSON responses from backend
      const responseText = await response.text();
      let razorpayOrderId = responseText?.trim();
      try {
        const parsed = JSON.parse(responseText);
        razorpayOrderId =
          parsed?.orderId ||
          parsed?.order_id ||
          parsed?.razorpayOrderId ||
          parsed?.id ||
          razorpayOrderId;
      } catch {
        // ignore JSON parsing error, plain-text response is valid
      }
      razorpayOrderId = String(razorpayOrderId || "").replace(/^"|"$/g, "");
      if (!razorpayOrderId) {
        throw new Error("Order id not received from /api/payment/create");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay script not loaded");
      }

      const options = {
        key: "rzp_test_SSOPBaeglF9OD0",
        amount: Math.round(amountValue * 100),
        currency: "INR",
        name: "SalesSavvy",
        description: "Cart Checkout",
        order_id: razorpayOrderId,
        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch("http://localhost:9090/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              }),
            });

            const result = await verifyResponse.text();
            if (verifyResponse.ok) {
              alert("Payment verified successfully!");
              navigate("/customerhome");
            } else {
              alert(`Payment verification failed: ${result}`);
            }
          } catch (err) {
            console.error("Error verifying payment:", err);
            alert("Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: username || "Customer",
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: function () {
            console.log("Razorpay modal closed by user");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (failureResponse) {
        console.error("Razorpay payment failed:", failureResponse?.error);
        alert(failureResponse?.error?.description || "Payment failed.");
      });
      rzp.open();
    } catch (err) {
      alert(`Payment failed: ${err.message || "Please try again."}`);
      console.error("Error during checkout:", err);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="cart-page">
      <Header
        cartCount={cartCount}
        username={username}
        email={email}
        onLogoutSuccess={() => setUser && setUser(null)}
      />
      <div className="cart-container">
        <h1 className="cart-title">Your Cart</h1>

        {error ? <div className="auth-error">{error}</div> : null}

        {loading ? (
          <div className="empty-cart">Loading your cart…</div>
        ) : cartItems.length === 0 ? (
          <div className="empty-cart">Your cart is empty.</div>
        ) : (
          <div className="cart-grid">
            <div className="cart-panel">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.product_id}>
                  <img
                    className="cart-item-img"
                    src={item.image_url || item.image || item.images?.[0]}
                    alt={item.name || "Product"}
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/84";
                    }}
                  />
                  <div>
                    <h3 className="cart-item-name">{item.name}</h3>
                    <div className="cart-item-meta">
                      <div className="cart-price">₹{item.total_price}</div>
                      <div className="qty-controls">
                        <button
                          className="qty-btn"
                          type="button"
                          onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <div className="qty-value">{item.quantity}</div>
                        <button
                          className="qty-btn"
                          type="button"
                          onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="remove-btn"
                        type="button"
                        onClick={() => handleRemoveItem(item.product_id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-panel">
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">₹{subtotal}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Overall Total</span>
                <span className="summary-value">₹{overallPrice}</span>
              </div>
              <button
                type="button"
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
              >
                {isCheckoutLoading ? "Opening payment..." : "Checkout"}
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

