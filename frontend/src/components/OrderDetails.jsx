import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./OrderDetails.css";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  /* =========================
     FETCH ORDER DETAILS
  ========================= */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(
          `/api/auth/user/${userId}/orders/${orderId}`
        );
        setOrder(res.data);
      } catch (err) {
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  /* =========================
     CANCEL ORDER
  ========================= */
  const handleConfirmCancel = async () => {
    try {
      setCancelling(true);
      await api.put(
        `/api/auth/user/${userId}/orders/${orderId}/cancel`
      );
      const updated = await api.get(
        `/api/auth/user/${userId}/orders/${orderId}`
      );
      setOrder(updated.data);
      setShowConfirmModal(false);
    } catch {
      setError("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel =
    order?.status &&
    ["PLACED", "PENDING", "CONFIRMED"].includes(
      order.status.toUpperCase()
    );

  if (loading) {
    return <div className="order-details-container">Loading...</div>;
  }

  if (error) {
    return <div className="order-details-container">{error}</div>;
  }

  if (!order) return null;

  const address = order.addressJson
    ? JSON.parse(order.addressJson)
    : {};

  return (
    <div className="order-details-container">
      {/* HEADER */}
      <div className="order-header">
        <h1>Order Details</h1>
        <span className={`status-pill ${order.status.toLowerCase()}`}>
          {order.status}
        </span>
      </div>

      <div className="order-wrapper">
        {/* LEFT CARD */}
        <div className="card">
          <h2 className="order-number">
            Order #{order.orderNumber || order.id}
          </h2>

          <div className="section">
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p>
              <strong>Payment:</strong>{" "}
              {order.paymentMethod.charAt(0).toUpperCase() +
                order.paymentMethod.slice(1)}
            </p>
          </div>

          <div className="section">
            <h3>Delivery Address</h3>
            <p>{address.fullName}</p>
            <p>{address.street}</p>
            <p>{address.city}, {address.state} {address.zipCode}</p>
            <p>{address.country}</p>
          </div>

          <div className="section">
            <h3>Items</h3>
            {order.items.map((item) => (
              <div key={item.id} className="item-row">
                <span>{item.name} × {item.quantity}</span>
                <span>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="card right-card">
          <h3>Order Total</h3>

          <div className="total-box">
            ₹{order.totalPrice.toFixed(2)}
          </div>

          <div className="section">
            <h4>Payment Method</h4>
            <span className="badge">
              {order.paymentMethod}
            </span>
          </div>

          <div className="section">
            <h4>Status</h4>
            <span className="status-light">
              {order.status}
            </span>
          </div>

          {/* DELIVERY DATE */}
          <div className="section">
            <h4>Delivery Date</h4>
            <p className="delivery-date">
              {order.deliveryDate
                ? new Date(order.deliveryDate).toLocaleDateString()
                : "Expected in 3–5 business days"}
            </p>
          </div>

          {canCancel && (
            <button
              className="cancel-btn"
              onClick={() => setShowConfirmModal(true)}
              disabled={cancelling}
            >
              Cancel Order
            </button>
          )}

          {/* ACTION BUTTONS INSIDE RIGHT CARD */}
          <div className="card-actions">
            <button
              className="back-btn"
              onClick={() => navigate("/account/orders")}
            >
              ← Back to Orders
            </button>

            <button
              className="shop-btn"
              onClick={() => navigate("/")}
            >
              Continue Shopping →
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cancel Order?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirmModal(false)}>
                No
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
