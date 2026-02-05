import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderConfirmed.css";

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

    // Format for backend (yyyy-MM-dd)
    const backendDate = deliveryDate.toISOString().split("T")[0];

    // Format for UI
    const displayDate = deliveryDate.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    setEstimatedDelivery(displayDate);

    // Update timeline with estimated delivery
    setTimelineStatus((prev) => {
      const updated = [...prev];
      updated[4].date = displayDate;
      return updated;
    });

    // Save to backend
    saveDeliveryDate(orderId, backendDate);

    window.scrollTo(0, 0);
  }, [orderId]);

  const saveDeliveryDate = async (orderId, deliveryDate) => {
    try {
      setSaving(true);

      const response = await fetch(
        `http://localhost:8080/api/admin/orders/${orderId}`,
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
            We couldn't find any order information. Please try placing an order first.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate("/")}
            style={{ 
              padding: "12px 30px", 
              fontSize: "1rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              color: "white",
              borderRadius: "8px",
              cursor: "pointer"
            }}
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
        {/* Compact Header */}
        <div className="order-header" style={{ marginBottom: "30px", paddingBottom: "25px" }}>
        <div className="order-header">
  <div className="tick-container">
    <div className="success-icon">✓</div>
  </div>
  <div className="confirmation-text">
    <h1>Order Confirmed!</h1>
    <p>Thank you for your purchase! Your order has been placed successfully and is being processed.</p>
  </div>
</div>
        </div>

        {/* Order Details Grid */}
        <div className="order-details-grid">
          <div className="detail-card">
            <div className="detail-label">Order ID</div>
            <div className="detail-value">#{orderId}</div>
          </div>

          <div className="detail-card">
            <div className="detail-label">Order Date</div>
            <div className="detail-value">
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })}
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-label">Est. Delivery</div>
            <div className="detail-value">
              {estimatedDelivery || "Calculating..."}
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-label">Total Amount</div>
            <div className="detail-value amount">₹{totalPrice.toLocaleString()}</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="order-content-grid">
          {/* Delivery Address */}
          <div className="order-section">
            <h3>📍 Delivery Address</h3>
            <div className="address-details">
              <p className="address-name">{address.fullName}</p>
              <p>{address.streetAddress}</p>
              <p>
                {address.city}, {address.state} - {address.postalCode}
              </p>
              <p>{address.country}</p>
              <p className="address-phone">📞 {address.phoneNumber}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="order-section">
            <h3>📦 Order Summary</h3>
            <div className="items-list">
              {cartItems.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <p className="item-name">{item.name || item.title}</p>
                    <p className="item-brand">{item.brand || "Brand"}</p>
                  </div>
                  <div className="item-qty">Qty: {item.quantity}</div>
                  <div className="item-price">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
              
              <div className="order-item-total">
                <span>Total Amount:</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="order-timeline">
          <h3>📋 Order Status Timeline</h3>
          <div className="timeline">
            {timelineStatus.map((status, index) => (
              <div 
                key={index} 
                className={`timeline-item ${status.active ? "active" : ""}`}
              >
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <p className="timeline-title">{status.title}</p>
                  <p className="timeline-date">{status.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons - Narrower */}
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          marginBottom: "18px",
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate("/")}
            style={{
              flex: "0 0 auto",
              minWidth: "160px",
              padding: "12px 20px"
            }}
          >
            🛍️ Continue Shopping
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleTrackOrder}
            style={{
              flex: "0 0 auto",
              minWidth: "160px",
              padding: "12px 20px"
            }}
          >
            📍 Track Order
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleDownloadInvoice}
            style={{
              flex: "0 0 auto",
              minWidth: "160px",
              padding: "12px 20px"
            }}
          >
            🖨️ Download Invoice
          </button>
        </div>

        {/* Info Box */}
        <div className="order-info">
          <p>
            📧 A confirmation email has been sent to your registered email address.
          </p>
          <p>
            💬 For any queries, contact our customer support or check your order status in the Orders section.
          </p>
        </div>

        {/* Saving Indicator */}
        {saving && (
          <div style={{ 
            textAlign: "center", 
            marginTop: "15px",
            padding: "10px",
            background: "rgba(102, 126, 234, 0.1)",
            borderRadius: "8px",
            color: "#667eea",
            fontWeight: "600"
          }}>
            💾 Saving delivery information...
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmed;