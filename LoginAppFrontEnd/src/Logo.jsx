import React from "react";
import { Link } from "react-router-dom";

export default function Logo({ to = "/customerhome" } = {}) {
  return (
    <Link to={to} className="brand">
      <span className="brand-mark" aria-hidden="true">
        S
      </span>
      <span className="brand-name">SalesSavvy</span>
    </Link>
  );
}

