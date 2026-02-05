import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import AppContext from "../context/Context";
import "./Payment.css";
import axios from "axios";

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ ONLY address selected from Address page
    const { cartItems = [], totalPrice = 0, address = null } = location.state || {};

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

    useEffect(() => {
        const id = localStorage.getItem("userId");
        setUserId(id || "");
        if (id) fetchPaymentMethods(id);
    }, []);

    const fetchPaymentMethods = async (id) => {
        try {
            const resp = await axios.get(
                `http://localhost:8080/api/auth/user/${id}/payment-methods`
            );

            setPaymentMethods(resp.data || []);

            const def = (resp.data || []).find(p => p.isDefault);
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

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        setCardDetails(prev => ({ ...prev, [name]: value }));
    };

    const validateCardDetails = () => {
        if (!cardDetails.cardNumber || !cardDetails.cardName ||
            !cardDetails.expiryDate || !cardDetails.cvv) {
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
            items: cartItems.map(ci => ({
                productId: ci.id,
                name: ci.name,
                price: ci.price,
                quantity: ci.quantity,
            })),
            totalPrice,
            addressJson: JSON.stringify(address), // ✅ FIX
            paymentMethod,
            userId,
        };

        const token = localStorage.getItem("token");

        const resp = await axios.post(
            `http://localhost:8080/api/auth/user/${userId}/orders`,
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
                orderId: order.id || "ORD-" + Date.now(),
            },
        });
    } catch (err) {
        console.error("Order creation failed", err);
        toast.error("Payment failed or could not save order. Please try again.");
    } finally {
        setIsProcessing(false);
    }
};


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

    return (
        <div className="payment-container" style={{ marginTop: "80px" }}>
            <div className="payment-wrapper">
                <div className="payment-content">

                    {/* ORDER SUMMARY */}
                    <div className="payment-summary">
                        <h3>Order Summary</h3>

                        <div className="summary-section">
                            <h5>Delivery Address</h5>
                            {address ? (
                                <div className="chosen-address">
                                    <p><strong>{address.fullName}</strong></p>
                                    <p>{address.street}</p>
                                    <p>{address.city}, {address.state} {address.zipCode}</p>
                                    <p>{address.country}</p>
                                    <p>📞 {address.phoneNumber}</p>
                                </div>
                            ) : (
                                <p>No address selected</p>
                            )}
                        </div>

                        <div className="summary-section">
                            <h5>Items</h5>
                            {cartItems.map(item => (
                                <div key={item.id} className="summary-item">
                                    <div className="summary-item-left">
                                        <img
                                            src={`http://localhost:8080/api/product/${item.id}/image`}
                                            alt={item.name}
                                            className="summary-item-img"
                                        />
                                        <span className="summary-item-name">{item.name} × {item.quantity}</span>
                                    </div>
                                    <span className="summary-item-price">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className="summary-total">
                            <h4>Total: ₹{totalPrice}</h4>
                        </div>
                    </div>

                    {/* PAYMENT SECTION */}
                    <div className="payment-form-section">
                        <h3>Payment Method</h3>

                        <form onSubmit={handlePayment}>
                            <div className="payment-methods">

                                {/* SAVED CARDS */}
                                {paymentMethods.map(pm => (
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

                                {/* NEW CARD */}
                                <label className="method-option">
                                    <input
                                        type="radio"
                                        value="card"
                                        checked={paymentMethod === "card" && !selectedPaymentId}
                                        onChange={() => {
                                            setPaymentMethod("card");
                                            setSelectedPaymentId(null);
                                            setCardDetails({
                                                cardNumber: "",
                                                cardName: "",
                                                expiryDate: "",
                                                cvv: "",
                                            });
                                        }}
                                    />
                                    💳 Credit / Debit Card
                                </label>

                                {/* UPI */}
                                <label className="method-option">
                                    <input
                                        type="radio"
                                        value="upi"
                                        checked={paymentMethod === "upi"}
                                        onChange={() => setPaymentMethod("upi")}
                                    />
                                    📱 UPI
                                </label>

                                {/* NET BANKING */}
                                <label className="method-option">
                                    <input
                                        type="radio"
                                        value="netbanking"
                                        checked={paymentMethod === "netbanking"}
                                        onChange={() => setPaymentMethod("netbanking")}
                                    />
                                    🏦 Net Banking
                                </label>

                                {/* WALLET */}
                                <label className="method-option">
                                    <input
                                        type="radio"
                                        value="wallet"
                                        checked={paymentMethod === "wallet"}
                                        onChange={() => setPaymentMethod("wallet")}
                                    />
                                    💰 Wallet
                                </label>
                                     {/* CASH ON DELIVERY */}
                                <label className="method-option">
                                    <input
                                        type="radio"
                                        value="cod"
                                        checked={paymentMethod === "cod"}
                                        onChange={() => {
                                            setPaymentMethod("cod");
                                            setSelectedPaymentId(null);
                                        }}
                                    />
                                    🚚 Cash on Delivery
                                </label>
                            </div>
                               

                            {/* CARD FORM */}
                            {paymentMethod === "card" && (
                                <div className="card-form">
                                    <h5>Card Details</h5>

                                    <input
                                        type="text"
                                        name="cardName"
                                        placeholder="Cardholder Name"
                                        value={cardDetails.cardName}
                                        onChange={handleCardChange}
                                        className="form-control"
                                    />

                                    <input
                                        type="text"
                                        name="cardNumber"
                                        placeholder="1234 5678 9012 3456"
                                        value={cardDetails.cardNumber}
                                        onChange={handleCardChange}
                                        className="form-control"
                                    />

                                    <div className="form-row">
                                        <input
                                            type="text"
                                            name="expiryDate"
                                            placeholder="MM/YY"
                                            value={cardDetails.expiryDate}
                                            onChange={handleCardChange}
                                            className="form-control"
                                        />
                                        <input
                                            type="password"
                                            name="cvv"
                                            placeholder="CVV"
                                            value={cardDetails.cvv}
                                            onChange={handleCardChange}
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* UPI */}
                            {paymentMethod === "upi" && (
                                <div className="other-payment">
                                    <h5>UPI</h5>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="yourname@upi"
                                    />
                                </div>
                            )}

                            {/* NET BANKING */}
                            {paymentMethod === "netbanking" && (
                                <div className="other-payment">
                                    <h5>Net Banking</h5>
                                    <select className="form-control">
                                        <option>Select Bank</option>
                                        <option>SBI</option>
                                        <option>HDFC</option>
                                        <option>ICICI</option>
                                        <option>Axis</option>
                                    </select>
                                </div>
                            )}

                            {/* WALLET */}
                            {paymentMethod === "wallet" && (
                                <div className="other-payment">
                                    <h5>Wallet</h5>
                                    <select className="form-control">
                                        <option>Select Wallet</option>
                                        <option>Google Pay</option>
                                        <option>PhonePe</option>
                                        <option>Paytm</option>
                                        <option>Amazon Pay</option>
                                    </select>
                                </div>
                            )}
                       {paymentMethod === "cod" && (
    <div className="other-payment cod-payment">
        <h5>Cash on Delivery</h5>
        <p>
            Pay <strong>₹{totalPrice}</strong> when the order is delivered.
        </p>
    </div>
)}


                            <div className="button-group">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate(-1)}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={isProcessing}
                                >
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
