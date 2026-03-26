import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function ProfileDropdown({ username = "", email = "", onLogoutSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const isLoggedIn = Boolean(
    username && String(username).trim() && username !== "Guest"
  );

  const initials = useMemo(() => {
    const name = (username || "U").trim();
    if (!isLoggedIn) return "?";
    return name ? name[0].toUpperCase() : "U";
  }, [username, isLoggedIn]);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen((o) => !o);

  const handleOrdersClick = () => {
    setIsOpen(false);
    navigate("/orders");
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch("http://localhost:9090/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        onLogoutSuccess?.();
        setIsOpen(false);
        window.location.replace("/");
      } else {
        console.error("Logout failed", response.status);
      }
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  return (
    <div className="profile-dropdown" ref={containerRef}>
      <button
        type="button"
        className="profile profile-trigger"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="profile-text">
          {isLoggedIn ? (
            <div className="profile-name">{username}</div>
          ) : (
            <div className="profile-name">Account</div>
          )}
        </div>
        <span className="profile-chevron" aria-hidden="true">
          {isOpen ? "▴" : "▾"}
        </span>
      </button>
      {isOpen && (
        <div className="dropdown-menu" role="menu">
          <div className="dropdown-user-info">
            <div className="dropdown-user-info-label">Your information</div>
            {isLoggedIn ? (
              <>
                <p className="dropdown-user-info-row">
                  <span className="dropdown-user-info-key">Username</span>
                  <span className="dropdown-user-info-value">{username}</span>
                </p>
                <p className="dropdown-user-info-row">
                  <span className="dropdown-user-info-key">Email</span>
                  <span className="dropdown-user-info-value">
                    {email || "—"}
                  </span>
                </p>
              </>
            ) : (
              <p className="dropdown-user-info-guest">
                Sign in to save orders and use your cart with your account.
              </p>
            )}
          </div>
          <div className="dropdown-divider" />
          {!isLoggedIn ? (
            <Link
              className="dropdown-item dropdown-item-link"
              role="menuitem"
              to="/"
              onClick={() => setIsOpen(false)}
            >
              Sign in
            </Link>
          ) : null}
          {isLoggedIn ? (
            <button type="button" className="dropdown-item" role="menuitem" disabled>
              Profile
            </button>
          ) : null}
          <button
            type="button"
            className="dropdown-item"
            role="menuitem"
            onClick={handleOrdersClick}
          >
            Orders
          </button>
          {isLoggedIn ? (
            <button
              type="button"
              className="dropdown-item dropdown-item-danger"
              role="menuitem"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
