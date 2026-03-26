import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./assets/styles.css";

function AdminLoginPage({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:9090/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Validate admin by hitting an admin-protected endpoint.
        try {
          const testRes = await fetch(
            "http://localhost:9090/admin/buisness/overall",
            { method: "GET", credentials: "include" }
          );
          if (testRes.ok) {
            setUser(data.username || data.user?.name || username);
            navigate("/admindashboard");
          } else {
            // Forcefully log out UI session if not admin
            try {
              await fetch("http://localhost:9090/api/auth/logout", {
                method: "POST",
                credentials: "include",
              });
            } catch {
              // ignore
            }
            setUser?.(null);
            setError("Access denied. Only admin users can log in here.");
          }
        } catch {
          // If test call fails due to network, keep error generic
          setError("Could not verify admin access. Try again.");
        }
      } else {
        setError(data.message || "Admin login failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-bg">
        <div className="auth-bg-blue" />
        <div className="auth-bg-orange" />
        <div className="admin-auth-decoration">
          <div className="cart-icon" aria-hidden="true">
            🔒
          </div>
        </div>
      </div>

      <div className="admin-auth-card">
        <h2 className="admin-auth-heading">Admin Portal</h2>
        <p className="admin-auth-subtitle">Enter as Admin</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="admin-username" className="auth-label">
            Username
          </label>
          <input
            id="admin-username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input"
            required
          />

          <label htmlFor="admin-password" className="auth-label">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />

          <button type="submit" className="admin-auth-button" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Enter As Admin"}
          </button>
        </form>

        {error && <p className="auth-error">{error}</p>}

        <p className="auth-switch">
          Not Admin?{" "}
          <Link className="auth-link" to="/">
            Login as Customer
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLoginPage;

