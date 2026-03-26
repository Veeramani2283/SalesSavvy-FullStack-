import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "./Footer";
import AdminHeader from "./AdminHeader";

const BASE_URL = "http://localhost:9090";

function extractTotal(report) {
  if (!report || typeof report !== "object") return null;
  return (
    report.totalBusiness ??
    report.totalBusinessValue ??
    report.totalRevenue ??
    report.totalSales ??
    report.totalAmount ??
    report.total_price ??
    report.totalPrice ??
    null
  );
}

function extractCategorySales(report) {
  if (!report || typeof report !== "object") return {};
  const raw =
    report.categorySales ??
    report.category_sales ??
    report.categorySalesMap ??
    report.categorySalesData ??
    report.categorySale ??
    null;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw;
  return {};
}

export default function AdminDashboard({ username, onLogoutSuccess }) {
  const navigate = useNavigate();
  const cards = useMemo(
    () => [
      { key: "addProduct", title: "Add Product", description: "Create product listings", disabled: true },
      { key: "deleteProduct", title: "Delete Product", description: "Remove product listings", disabled: true },
      { key: "modifyUser", title: "Modify User", description: "Update user details and roles", disabled: true },
      { key: "viewUser", title: "View User Details", description: "Fetch user details by user id", disabled: true },
      { key: "monthlyBusiness", title: "Monthly Business", description: "Revenue and category sales per month" },
      { key: "dailyBusiness", title: "Daily Business", description: "Revenue and category sales for a date" },
      { key: "yearlyBusiness", title: "Yearly Business", description: "Annual revenue and category sales per year" },
      { key: "overallBusiness", title: "Overall Business", description: "Total revenue and category sales overall" },
    ],
    []
  );

  const [modalType, setModalType] = useState(null);
  const [modalResponse, setModalResponse] = useState(null);
  const [modalError, setModalError] = useState("");

  const [adminChecking, setAdminChecking] = useState(true);
  const [adminGuardMessage, setAdminGuardMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const checkAdmin = async () => {
      setAdminGuardMessage("");
      try {
        const res = await fetch(`${BASE_URL}/admin/buisness/overall`, {
          method: "GET",
          credentials: "include",
        });

        if (cancelled) return;

        if (res.ok) {
          setAdminChecking(false);
          return;
        }

        if (res.status === 403) {
          navigate("/adminlogin", { replace: true });
          return;
        }

        setAdminGuardMessage("Access denied. Only admin users can access this page.");
        setAdminChecking(false);
      } catch {
        if (cancelled) return;
        setAdminGuardMessage("Could not verify admin access. Try again.");
        setAdminChecking(false);
      }
    };

    checkAdmin();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const resetModal = () => {
    setModalResponse(null);
    setModalError("");
  };

  const closeModal = () => {
    setModalType(null);
    resetModal();
  };

  const openModal = (type) => {
    setModalType(type);
    resetModal();
  };

  const fetchBusiness = async (type) => {
    setModalError("");
    setModalResponse(null);
    try {
      let url = "";
      if (type === "monthlyBusiness") {
        url = `${BASE_URL}/admin/buisness/monthly?month=${month}&year=${year}`;
      } else if (type === "dailyBusiness") {
        url = `${BASE_URL}/admin/buisness/daily?date=${encodeURIComponent(date)}`;
      } else if (type === "yearlyBusiness") {
        url = `${BASE_URL}/admin/buisness/yearly?year=${year}`;
      } else if (type === "overallBusiness") {
        url = `${BASE_URL}/admin/buisness/overall`;
      }

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          raw.slice(0, 220) ||
          res.statusText ||
          `Request failed (${res.status})`;
        if (res.status === 403) {
          throw new Error("Forbidden: Admin access required");
        }
        throw new Error(msg);
      }
      setModalResponse(data);
    } catch (e) {
      setModalError(e?.message || "Failed to fetch business data.");
    }
  };

  const categorySales = extractCategorySales(modalResponse);
  const total = extractTotal(modalResponse);
  const hasResult = Boolean(modalResponse && typeof modalResponse === "object");

  return (
    <div className="admin-dashboard-wrap">
      <AdminHeader username={username} onLogoutSuccess={onLogoutSuccess} />

      {adminChecking ? (
        <main className="admin-main">
          <p className="orders-status">Checking admin access...</p>
        </main>
      ) : adminGuardMessage ? (
        <main className="admin-main">
          <div className="orders-retry-box">
            <p className="orders-status">{adminGuardMessage}</p>
          </div>
        </main>
      ) : (
      <main className="admin-main">
        <h1 className="admin-title">Admin Dashboard</h1>

        <div className="admin-cards-grid">
          {cards.map((card) => (
            <div
              key={card.key}
              className={`admin-card ${card.disabled ? "admin-card-disabled" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (card.disabled) openModal(card.key);
                else openModal(card.key);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  if (!card.disabled) openModal(card.key);
                }
              }}
            >
              <div className="admin-card-content">
                <h3 className="admin-card-title">{card.title}</h3>
                <p className="admin-card-desc">{card.description}</p>
                {card.disabled ? (
                  <span className="admin-card-note">Coming soon</span>
                ) : (
                  <span className="admin-card-note">Click to view</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      )}

      <Footer />

      {modalType && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) closeModal();
          }}
        >
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {modalType === "monthlyBusiness" && "Monthly Business"}
                {modalType === "dailyBusiness" && "Daily Business"}
                {modalType === "yearlyBusiness" && "Yearly Business"}
                {modalType === "overallBusiness" && "Overall Business"}
                {["addProduct", "deleteProduct", "modifyUser", "viewUser"].includes(modalType)
                  ? "Not implemented yet"
                  : ""}
              </h2>
              <button type="button" className="admin-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            {["addProduct", "deleteProduct", "modifyUser", "viewUser"].includes(modalType) ? (
              <div className="admin-modal-body">
                <p className="admin-modal-text">
                  This admin action UI needs the related backend endpoints (add/delete/modify/view).
                  Share those controllers/paths and I&apos;ll wire it up.
                </p>
              </div>
            ) : (
              <div className="admin-modal-body">
                {(modalType === "monthlyBusiness" || modalType === "yearlyBusiness") && (
                  <div className="admin-modal-form">
                    {modalType === "monthlyBusiness" && (
                      <>
                        <label className="admin-form-label" htmlFor="month">
                          Month (1-12)
                        </label>
                        <input
                          id="month"
                          className="admin-form-input"
                          type="number"
                          min={1}
                          max={12}
                          value={month}
                          onChange={(e) => setMonth(Number(e.target.value))}
                        />
                      </>
                    )}
                    <label className="admin-form-label" htmlFor="year">
                      Year
                    </label>
                    <input
                      id="year"
                      className="admin-form-input"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                    />
                  </div>
                )}

                {modalType === "dailyBusiness" && (
                  <div className="admin-modal-form">
                    <label className="admin-form-label" htmlFor="date">
                      Date
                    </label>
                    <input
                      id="date"
                      className="admin-form-input"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                )}

                {modalType === "overallBusiness" && (
                  <p className="admin-modal-text">Click below to fetch overall business summary.</p>
                )}

                <div className="admin-modal-actions">
                  <button
                    type="button"
                    className="admin-modal-primary"
                    onClick={() => fetchBusiness(modalType)}
                  >
                    Fetch
                  </button>
                  <button type="button" className="admin-modal-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                </div>

                {modalError && <p className="admin-modal-error">{modalError}</p>}

                {hasResult && !modalError && (
                  <div className="admin-modal-result">
                    <div className="admin-result-row">
                      <span className="admin-result-key">Total Business</span>
                      <span className="admin-result-value">
                        {total == null ? "—" : Number(total).toFixed(2)}
                      </span>
                    </div>

                    {Object.keys(categorySales).length > 0 && (
                      <div className="admin-result-categories">
                        <h3 className="admin-result-title">Category Sales</h3>
                        <div className="admin-result-cat-grid">
                          {Object.entries(categorySales).map(([k, v]) => (
                            <div key={k} className="admin-result-cat-item">
                              <div className="admin-result-cat-name">{k}</div>
                              <div className="admin-result-cat-value">
                                {typeof v === "number" ? v.toFixed(2) : v}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

