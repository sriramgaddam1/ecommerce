import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import AppContext from "../context/Context";
import "./Payment.css";
import axios from "axios";

/* =======================
   BACKEND BASE URL
======================= */
const BASE_URL = import.meta.env.VITE_API_URL;

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Data from Address page
  const { cartItems = [], totalPrice = 0, address = null } =
    location.state || {};

  const { clearCart } = useContext(AppContext);

  const [userId, setUserId] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  /* =======================
     INIT USER + PAYMENTS
  ======================= */
  useEffect(() => {
    const id = localStorage.getItem("userId");
    setUserId(id || "");
    if (id) fetchPaymentMethods(id);
  }, []);

  const fetchPaymentMethods = async (id) => {
    try {
      const resp = await axios.get(
        `${BASE_URL}/api/auth/user/${id}/payment-methods`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setPaymentMethods(resp.data || []);

      const def = (resp.data || []).find((p) => p.isDefault);
      if (def) {
        setSelectedPaymentId(def.id);
        setPaymentMethod("card");
        setCardDetails({
          cardNumber: def.cardNumber || "",
          cardName: def.cardholderName || "",
          expiryDate:
            def.expiryMonth && def.expiryYear
              ? `${def.expiryMonth}/${def.expiryYear}`
              : "",
          cvv: "",
        });
      }
    } catch (err) {
      console.error("Error fetching payment methods", err);
    }
  };

  /* =======================
     CARD HANDLING
  ======================= */
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({ ...prev, [name]: value }));
  };

  const validateCardDetails = () => {
    if (
      !cardDetails.cardNumber ||
      !cardDetails.cardName ||
      !cardDetails.expiryDate ||
      !cardDetails.cvv
    ) {
      toast.error("Please fill all card details ❌");
      return false;
    }

    if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ""))) {
      toast.error("Card number must be 16 digits ❌");
      return false;
    }

    if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      toast.error("CVV must be 3–4 digits ❌");
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      toast.error("Expiry must be MM/YY ❌");
      return false;
    }

    return true;
  };

  /* =======================
     PLACE ORDER
  ======================= */
  const handlePayment = async (e) => {
    e.preventDefault();

    if (!address) {
      toast.error("Please select a delivery address ❌");
      return;
    }

    if (paymentMethod === "card" && !validateCardDetails()) return;

    setIsProcessing(true);

    try {
      const payload = {
        items: cartItems.map((ci) => ({
          productId: ci.id,
          name: ci.name,
          price: ci.price,
          quantity: ci.quantity,
        })),
        totalPrice,
        addressJson: JSON.stringify(address),
        paymentMethod,
        userId,
      };

      const token = localStorage.getItem("token");

      const resp = await axios.post(
        `${BASE_URL}/api/auth/user/${userId}/orders`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const order = resp.data || {};

      toast.success("Payment successful 🎉");
      clearCart();

      navigate("/order-confirmed", {
        state: {
          cartItems,
          totalPrice,
          address,
          orderId: order.id,
        },
      });
    } catch (err) {
      console.error("Order creation failed", err);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  /* =======================
     EMPTY CART GUARD
  ======================= */
  if (!cartItems.length) {
    return (
      <div className="payment-container" style={{ marginTop: "100px" }}>
        <h3>No items to checkout</h3>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  /* =======================
     UI
  ======================= */
  return (
    <div className="payment-container" style={{ marginTop: "80px" }}>
      <div className="payment-wrapper">
        <div className="payment-content">

          {/* ORDER SUMMARY */}
          <div className="payment-summary">
            <h3>Order Summary</h3>

            <div className="summary-section">
              <h5>Delivery Address</h5>
              <div className="chosen-address">
                <p><strong>{address.fullName}</strong></p>
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
                <p>{address.country}</p>
                <p>📞 {address.phoneNumber}</p>
              </div>
            </div>

            <div className="summary-section">
              <h5>Items</h5>
              {cartItems.map((item) => (
                <div key={item.id} className="summary-item">
                  <div className="summary-item-left">
                    <img
                      src={`${BASE_URL}/api/product/${item.id}/image`}
                      alt={item.name}
                      className="summary-item-img"
                    />
                    <span>{item.name} × {item.quantity}</span>
                  </div>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="summary-total">
              <h4>Total: ₹{totalPrice}</h4>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="payment-form-section">
            <h3>Payment Method</h3>

            <form onSubmit={handlePayment}>
              <div className="payment-methods">

                {paymentMethods.map((pm) => (
                  <label key={pm.id} className="method-option">
                    <input
                      type="radio"
                      checked={selectedPaymentId === pm.id}
                      onChange={() => {
                        setSelectedPaymentId(pm.id);
                        setPaymentMethod("card");
                        setCardDetails({
                          cardNumber: pm.cardNumber || "",
                          cardName: pm.cardholderName || "",
                          expiryDate:
                            pm.expiryMonth && pm.expiryYear
                              ? `${pm.expiryMonth}/${pm.expiryYear}`
                              : "",
                          cvv: "",
                        });
                      }}
                    />
                    💳 {pm.cardType} ending {pm.cardNumber?.slice(-4)}
                  </label>
                ))}

                <label className="method-option">
                  <input
                    type="radio"
                    checked={paymentMethod === "cod"}
                    onChange={() => {
                      setPaymentMethod("cod");
                      setSelectedPaymentId(null);
                    }}
                  />
                  🚚 Cash on Delivery
                </label>
              </div>

              <div className="button-group">
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                  Back
                </button>
                <button type="submit" className="btn btn-success" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : `Pay ₹${totalPrice}`}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Payment;
