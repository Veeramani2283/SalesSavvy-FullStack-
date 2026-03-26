import React, { useCallback, useEffect, useState } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { getOrderItemImageUrl, ORDER_PLACEHOLDER_IMG } from "./orderImage";
import "./assets/styles.css";

async function resolveUsername(sessionUser) {
  if (sessionUser && String(sessionUser).trim()) {
    return String(sessionUser).trim();
  }
  try {
    const r = await fetch("http://localhost:9090/api/cart/items", {
      credentials: "include",
    });
    if (r.ok) {
      const d = await r.json();
      const name = d?.username ?? d?.user?.name;
      if (name) return String(name).trim();
    }
  } catch {
    /* ignore */
  }
  try {
    const r = await fetch("http://localhost:9090/api/products", {
      credentials: "include",
    });
    if (r.ok) {
      const d = await r.json();
      const name = d?.user?.name;
      if (name) return String(name).trim();
    }
  } catch {
    /* ignore */
  }
  return "";
}

async function resolveEmail(sessionUser) {
  if (sessionUser && typeof sessionUser === "object") {
    const maybeEmail =
      sessionUser?.email || sessionUser?.mail || sessionUser?.emailId;
    if (maybeEmail) return String(maybeEmail).trim();
  }
  try {
    const r = await fetch("http://localhost:9090/api/cart/items", {
      credentials: "include",
    });
    if (r.ok) {
      const d = await r.json();
      return (
        d?.user?.email ||
        d?.user?.mail ||
        d?.user?.emailId ||
        d?.user?.user_email ||
        d?.email ||
        ""
      );
    }
  } catch {
    /* ignore */
  }
  try {
    const r = await fetch("http://localhost:9090/api/products", {
      credentials: "include",
    });
    if (r.ok) {
      const d = await r.json();
      return (
        d?.user?.email ||
        d?.user?.mail ||
        d?.user?.emailId ||
        d?.user?.user_email ||
        d?.email ||
        ""
      );
    }
  } catch {
    /* ignore */
  }
  return "";
}

export default function OrdersPage({ setUser, sessionUser }) {
  const [orders, setOrders] = useState([]);
  const [username, setUsername] = useState(() =>
    sessionUser && String(sessionUser).trim() ? String(sessionUser).trim() : ""
  );
  const [email, setEmail] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [cartError, setCartError] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);

  useEffect(() => {
    if (sessionUser && String(sessionUser).trim()) {
      setUsername(String(sessionUser).trim());
    }
  }, [sessionUser]);

  /* Who is logged in (header) — independent of /api/orders success */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const name = await resolveUsername(sessionUser);
      if (!cancelled && name) setUsername(name);
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionUser]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const e = await resolveEmail(sessionUser);
      if (!cancelled && e) setEmail(String(e).trim());
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionUser]);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:9090/api/orders", {
        credentials: "include",
      });

      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        if (!response.ok) {
          setOrders([]);
          if (response.status >= 500) {
            setError(
              "server_500"
            );
          } else {
            setError(
              `Orders request failed (${response.status}): ${raw.slice(0, 200) || response.statusText}`
            );
          }
          return;
        }
        setError("Invalid JSON from orders API.");
        setOrders([]);
        return;
      }

      if (!response.ok) {
        const msg =
          data.message || data.error || raw.slice(0, 200) || response.statusText;
        setOrders([]);
        if (response.status === 401) {
          setError("Not signed in. Please log in again to view orders.");
        } else if (response.status >= 500) {
          setError("server_500");
        } else {
          setError(`Could not load orders (${response.status}): ${msg}`);
        }
        return;
      }

      const list =
        data.products ||
        data.orders ||
        data.orderItems ||
        (Array.isArray(data) ? data : []);
      setOrders(Array.isArray(list) ? list : []);
      const name =
        data.username || data.user?.name || (await resolveUsername(sessionUser));
      if (name) setUsername(String(name).trim());
      const maybeEmail =
        data?.user?.email ||
        data?.user?.mail ||
        data?.user?.emailId ||
        data?.user?.user_email ||
        data?.email;
      if (maybeEmail) setEmail(String(maybeEmail).trim());
      setError("");
    } catch (err) {
      setOrders([]);
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(
          "Network error — is the backend running on http://localhost:9090 and CORS allowing this app?"
        );
      } else {
        setError(err.message || "Failed to load orders.");
      }
    } finally {
      setOrdersLoading(false);
    }
  }, [sessionUser]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!username) return;
    const fetchCartCount = async () => {
      setIsCartLoading(true);
      try {
        const response = await fetch(
          `http://localhost:9090/api/cart/items/count?username=${encodeURIComponent(username)}`,
          { credentials: "include" }
        );
        const count = await response.json();
        setCartCount(count);
        setCartError(false);
      } catch (e) {
        console.error("Error fetching cart count:", e);
        setCartError(true);
      } finally {
        setIsCartLoading(false);
      }
    };
    fetchCartCount();
  }, [username]);

  return (
    <div className="customer-homepage orders-page-wrap">
      <Header
        cartCount={isCartLoading ? "..." : cartError ? "Error" : cartCount}
        username={username || "Guest"}
        email={email}
        onLogoutSuccess={() => setUser && setUser(null)}
      />
      <main className="main-content orders-main">
        <h1 className="orders-title">Your Orders</h1>

        {ordersLoading && <p className="orders-status">Loading orders…</p>}

        {!ordersLoading && error === "server_500" && (
          <div className="orders-retry-box">
            <p className="orders-status">
              We couldn&apos;t load your order history right now (server error). Your account
              is still signed in — please try again, or check the Spring Boot logs for
              <code className="orders-code"> GET /api/orders</code>.
            </p>
            <button type="button" className="orders-retry-btn" onClick={loadOrders}>
              Retry
            </button>
          </div>
        )}

        {!ordersLoading && error && error !== "server_500" && (
          <p className="auth-error">{error}</p>
        )}

        {!ordersLoading && !error && orders.length === 0 && (
          <p className="orders-status">No orders found. Start shopping now!</p>
        )}

        {!ordersLoading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order, index) => (
              <div className="order-card" key={`${order.order_id}-${index}`}>
                <div className="order-card-header">
                  <span>Order Id: {order.order_id}</span>
                </div>
                <div className="order-card-body">
                  <img
                    className="order-product-image"
                    src={getOrderItemImageUrl(order) || ORDER_PLACEHOLDER_IMG}
                    alt={order.name || "Product"}
                    onError={(e) => {
                      e.currentTarget.src = ORDER_PLACEHOLDER_IMG;
                    }}
                  />
                  <div className="order-details">
                    <h3 className="order-line-title">Product: {order.name}</h3>
                    <p className="order-line-meta">Description: {order.description}</p>
                    <p className="order-line-meta">Quantity: {order.quantity}</p>
                    <p className="order-line-meta">
                      Price per unit: ₹{Number(order.price_per_unit).toFixed(2)}
                    </p>
                    <p className="order-line-total">
                      Total: ₹{Number(order.total_price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
