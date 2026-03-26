import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./assets/styles.css";

function RegistrationPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!role) {
      setError("Please select a role.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:9090/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, role }),
      });

      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (text) setError(response.ok ? "Registration failed." : text.slice(0, 200));
        else setError(response.ok ? "Registration failed." : `Server error (${response.status}).`);
        setLoading(false);
        return;
      }

      if (response.ok) {
        navigate("/", { replace: true });
      } else {
        setError(data.message || data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError("Cannot reach server. Is the backend running on http://localhost:9090?");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-blue" />
        <div className="auth-bg-orange" />
        <div className="auth-decoration">
          <div className="cart-icon" aria-hidden="true">🛒</div>
        </div>
      </div>
      <div className="auth-card register-container">
        <h2 className="auth-heading">Register</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="reg-username" className="auth-label">
            Username
          </label>
          <input
            id="reg-username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input"
            required
          />
          <label htmlFor="reg-email" className="auth-label">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />
          <label htmlFor="reg-password" className="auth-label">
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
          <label htmlFor="reg-role" className="auth-label">
            Role
          </label>
          <select
            id="reg-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="auth-input auth-select"
            required
          >
            <option value="">Select your role</option>
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Signing up…" : "Sign Up"}
          </button>
        </form>
        {error && <p className="auth-error">{error}</p>}
        <p className="auth-switch">
          Already a user?{" "}
          <Link className="auth-link" to="/">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegistrationPage;

