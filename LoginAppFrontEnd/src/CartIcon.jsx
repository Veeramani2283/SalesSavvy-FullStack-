import React from "react";
import { Link } from "react-router-dom";

export function CartIcon({ count = 0 }) {
  return (
    <Link to="/cart" className="cart-link" aria-label="Cart">
      <span className="cart-emoji" aria-hidden="true">
        🛒
      </span>
      <span className="cart-count">{count}</span>
    </Link>
  );
}