import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderConfirmed.css";

/* =======================
   BACKEND BASE URL
======================= */
const BASE_URL = import.meta.env.VITE_API_URL;

const OrderConfirmed = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    cartItems = [],
    totalPrice = 0,
    address = {},
    orderId = null,
  } = location.state || {};

  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [saving, setSaving] = useState(false);
  const [timelineStatus, setTimelineStatus] = useState([
    { title: "Order Placed", date: new Date().toLocaleDateString("en-IN"), active: true },
    { title: "Order Confirmed", date: "Pending", active: false },
    { title: "Shipped", date: "Pending", active: false },
    { title: "Out for Delivery", date: "Pending", active: false },
    { title: "Delivered", date: "Pending", active: false },
  ]);

  useEffect(() => {
    if (!orderId) return;

    // Generate delivery date (5–7 days)
    const deliveryDate = new Date();
    const daysToAdd = Math.floor(Math.random() * 3) + 5;
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);

    const backendDate = deliveryDate.toISOString().split("T")[0];

    const displayDate = deliveryDate.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    setEstimatedDelivery(displayDate);

    setTimelineStatus((prev) => {
      const updated = [...prev];
      updated[4].date = displayDate;
      return updated;
    });

    saveDeliveryDate(orderId, backendDate);
    window.scrollTo(0, 0);
  }, [orderId]);

  const saveDeliveryDate = async (orderId, deliveryDate) => {
    try {
      setSaving(true);

      const response = await fetch(
        `${BASE_URL}/api/admin/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ deliveryDate }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save delivery date");
      }
    } catch (err) {
      console.error("Delivery date save failed:", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTrackOrder = () => {
    navigate("/orders", { state: { orderId } });
  };

  const handleDownloadInvoice = () => {
    window.print();
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="order-error-container" style={{ marginTop: "100px" }}>
        <div className="error-box">
          <h3>❌ No Order Details Found</h3>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            We couldn't find any order information. Please place an order first.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmed-container" style={{ marginTop: "80px" }}>
      <div className="order-wrapper">

        {/* HEADER */}
        <div className="order-header">
          <div className="tick-container">
            <div className="success-icon">✓</div>
          </div>
          <div className="confirmation-text">
            <h1>Order Confirmed!</h1>
            <p>Your order has been placed successfully.</p>
          </div>
        </div>

        {/* ORDER INFO */}
        <div className="order-details-grid">
          <div className="detail-card">
            <div className="detail-label">Order ID</div>
            <div className="detail-value">#{orderId}</div>
          </div>

          <div className="detail-card">
            <div className="detail-label">Order Date</div>
            <div className="detail-value">
              {new Date().toLocaleDateString("en-IN")}
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-label">Est. Delivery</div>
            <div className="detail-value">
              {estimatedDelivery || "Calculating..."}
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-label">Total</div>
            <div className="detail-value amount">₹{totalPrice}</div>
          </div>
        </div>

        {/* ADDRESS */}
        <div className="order-section">
          <h3>📍 Delivery Address</h3>
          <p>{address.fullName}</p>
          <p>{address.street}</p>
          <p>{address.city}, {address.state} - {address.zipCode}</p>
          <p>{address.country}</p>
          <p>📞 {address.phoneNumber}</p>
        </div>

        {/* ITEMS */}
        <div className="order-section">
          <h3>📦 Order Summary</h3>
          {cartItems.map((item, i) => (
            <div key={i} className="order-item">
              <span>{item.name}</span>
              <span>Qty: {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="order-actions">
          <button onClick={() => navigate("/")}>🛍 Continue Shopping</button>
          <button onClick={handleTrackOrder}>📍 Track Order</button>
          <button onClick={handleDownloadInvoice}>🖨 Download Invoice</button>
        </div>

        {saving && <p style={{ textAlign: "center" }}>💾 Saving delivery info...</p>}
      </div>
    </div>
  );
};

export default OrderConfirmed;
