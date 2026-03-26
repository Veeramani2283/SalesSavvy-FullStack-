import React from "react";
import Logo from "./Logo";

const BASE_URL = "http://localhost:9090";

export default function AdminHeader({ username, onLogoutSuccess }) {
  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore logout API errors; we still clear UI state below
    }

    onLogoutSuccess?.();
    // After admin logout, go back to admin login page (not customer home)
    window.location.replace("/adminlogin");
  };

  return (
    <header className="admin-header">
      <div className="header-content admin-header-content">
        <div className="admin-header-left">
          <Logo to="/admindashboard" />
          <span className="admin-portal-label">SalesSavvy's Admin</span>
        </div>

        <div className="admin-header-right">
          <span className="admin-user-name">{username || ""}</span>
          <button
            type="button"
            className="admin-logout-btn-simple"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

