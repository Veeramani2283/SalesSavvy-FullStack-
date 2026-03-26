import React from "react";
import "./assets/styles.css";
import AdminDashboard from "./AdminDashboard";

function Dashboard({ username, setUser }) {
  return (
    <AdminDashboard
      username={username}
      onLogoutSuccess={() => setUser && setUser(null)}
    />
  );
}

export default Dashboard;