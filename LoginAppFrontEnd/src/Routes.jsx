import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import RegistrationPage from "./RegistrationPage";
import CartPage from "./CartPage";
import Dashboard from "./Dashboard";
import CustomerHomePage from "./CustomerHomePage";
import OrdersPage from "./OrdersPage";
import AdminLoginPage from "./AdminLoginPage";

export default function AppRoutes({ user, setUser }) {
  return (
    <Routes>
      <Route path="/" element={<LoginPage setUser={setUser} />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/adminlogin" element={<AdminLoginPage setUser={setUser} />} />
      <Route path="/admin" element={<Navigate to="/adminlogin" replace />} />
      <Route
        path="/admindashboard"
        element={
          user ? (
            <Dashboard username={user} setUser={setUser} />
          ) : (
            <Navigate to="/adminlogin" replace />
          )
        }
      />
      <Route
        path="/customerhome"
        element={<CustomerHomePage setUser={setUser} />}
      />
      <Route path="/cart" element={<CartPage setUser={setUser} />} />
      <Route
        path="/orders"
        element={<OrdersPage setUser={setUser} sessionUser={user} />}
      />
      <Route
        path="/dashboard"
        element={
          <Navigate to="/admindashboard" replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
