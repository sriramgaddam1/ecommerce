import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../axios";
import "./Account.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* =========================
   GRADIENT AVATAR
========================= */
const generateGradientFromString = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = hash % 360;
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1},70%,60%), hsl(${h2},70%,50%))`;
};

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("profile");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     AUTH CHECK
  ========================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("userId");

    if (!token || !id) {
      navigate("/login");
      return;
    }

    setUsername(localStorage.getItem("username") || "");
    setEmail(localStorage.getItem("userEmail") || "");
    setUserId(id);

    setProfilePhoto(`${BASE_URL}/api/auth/user/${id}/photo`);

    fetchOrders(id);
  }, [navigate]);

  /* =========================
     TAB ROUTE SYNC
  ========================= */
  useEffect(() => {
    if (location.pathname.includes("orders")) setActiveTab("orders");
    else setActiveTab("profile");
  }, [location]);

  /* =========================
     FETCH ORDERS
  ========================= */
  const fetchOrders = async (id) => {
    try {
      const res = await API.get(`/auth/user/${id}/orders`);
      setOrders(res.data || []);
    } catch {
      toast.error("Failed to load orders");
    }
  };

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>My Account</h1>
        <p className="greeting">Welcome back, {username}!</p>
      </div>

      <div className="account-wrapper">
        {/* SIDEBAR */}
        <div className="account-sidebar">
          <div className="sidebar-user-card">
            <div className="user-avatar">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "";
                    setProfilePhoto(null);
                  }}
                />
              ) : (
                <div
                  className="avatar-initial"
                  style={{ background: generateGradientFromString(username) }}
                >
                  {username?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <h3>{username}</h3>
            <p>{email}</p>
          </div>

          <nav className="sidebar-menu">
            <button
              className={`menu-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              My Profile
            </button>

            <button
              className={`menu-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              My Orders
            </button>

            <button className="menu-item logout-menu" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </div>

        {/* CONTENT */}
        <div className="account-content">
          {/* PROFILE */}
          {activeTab === "profile" && (
            <div className="tab-content">
              <h2>Profile</h2>
              <p><b>Username:</b> {username}</p>
              <p><b>Email:</b> {email}</p>
            </div>
          )}

          {/* ORDERS */}
          {activeTab === "orders" && (
            <div className="tab-content">
              <h2>My Orders</h2>

              {orders.length === 0 ? (
                <p>No orders yet</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <h4>Order #{order.id}</h4>
                    <p>Status: {order.status}</p>
                    <p>Total: ₹{order.totalPrice}</p>
                    <button
                      onClick={() =>
                        navigate(`/account/orders/${order.id}`)
                      }
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
