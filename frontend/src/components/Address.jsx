import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import "./Address.css";

const Address = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems = [], totalPrice = 0 } = location.state || {};

    const [theme] = useState(() => {
        const storedTheme = localStorage.getItem("theme");
        return storedTheme ? storedTheme : "light-theme";
    });

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [showSaved, setShowSaved] = useState(false);
    const [userId, setUserId] = useState("");

    const [address, setAddress] = useState({
        fullName: "",
        phoneNumber: "",
        streetAddress: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
    });

    // Load saved addresses from backend (fallback to localStorage)
    useEffect(() => {
        const id = localStorage.getItem("userId");
        setUserId(id || "");
        if (id) {
            fetchSavedAddresses(id);
        } else {
            const saved = localStorage.getItem("previousAddresses");
            if (saved) setSavedAddresses(JSON.parse(saved));
        }
    }, []);

    const fetchSavedAddresses = async (id) => {
        try {
            const resp = await axios.get(`http://localhost:8080/api/auth/user/${id}/addresses`);
            setSavedAddresses(resp.data || []);
        } catch (err) {
            console.error("Error fetching saved addresses:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const selectSavedAddress = (addr) => {
        setAddress((prev) => ({
            ...prev,
            fullName: addr.fullName || prev.fullName,
            phoneNumber: addr.phoneNumber || prev.phoneNumber,
            streetAddress: addr.street || addr.streetAddress || prev.streetAddress,
            city: addr.city || prev.city,
            state: addr.state || prev.state,
            postalCode: addr.zipCode || addr.postalCode || prev.postalCode,
            country: addr.country || prev.country,
        }));
        setShowSaved(false);
        toast.info("Saved address selected ✅");
    };

    const useSavedAddress = (addr) => {
        const mapped = {
            fullName: addr.fullName,
            phoneNumber: addr.phoneNumber,
            streetAddress: addr.street || addr.streetAddress || "",
            city: addr.city,
            state: addr.state,
            postalCode: addr.zipCode || addr.postalCode || "",
            country: addr.country || "",
        };

        navigate("/payment", {
            state: { cartItems, totalPrice, address: mapped },
        });
    };

   const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Validation
    if (
        !address.fullName ||
        !address.phoneNumber ||
        !address.streetAddress ||
        !address.city ||
        !address.state ||
        !address.postalCode ||
        !address.country
    ) {
        toast.error("Please fill all address fields ❌");
        return;
    }

    if (!/^\d{10}$/.test(address.phoneNumber)) {
        toast.error("Phone number must be 10 digits ❌");
        return;
    }

    // ✅ Map form address → Payment page format
    const mappedAddress = {
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        street: address.streetAddress,   // ✅ IMPORTANT
        city: address.city,
        state: address.state,
        zipCode: address.postalCode,      // ✅ IMPORTANT
        country: address.country,
    };

    toast.success("Address confirmed ✅");

    // ✅ Continue to payment with FORM address only
    navigate("/payment", {
        state: {
            cartItems,
            totalPrice,
            address: mappedAddress,
        },
    });
};


    return (
        <div className="address-container" style={{ marginTop: "80px" }}>
            <div className="address-wrapper">
                <h2>Delivery Address</h2>
                <p style={{ color: "#666", marginBottom: "20px" }}>
                    Total Amount: <strong>₹{totalPrice}</strong>
                </p>

                {/* Saved Addresses Button */}
                {savedAddresses.length > 0 && (
                    <button
                        className="btn-previous-addresses"
                        onClick={() => setShowSaved(!showSaved)}
                    >
                        {showSaved ? "✕ Hide Saved Addresses" : "+ Use Saved Address"}
                    </button>
                )}

                {/* Saved Addresses List */}
                {showSaved && savedAddresses.length > 0 && (
                    <div className="previous-addresses-container">
                        <h5>Saved Addresses</h5>
                        {savedAddresses.map((addr, index) => (
                            <div key={index} className="previous-address-card">
                                <div className="address-preview">
                                    <p className="addr-name">{addr.fullName}</p>
                                    <p className="addr-text">{addr.street || addr.streetAddress}</p>
                                    <p className="addr-text">
                                        {addr.city}, {addr.state} {addr.zipCode || addr.postalCode}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="use-btn" onClick={() => useSavedAddress(addr)}>Use</button>
                                    <button className="use-btn" onClick={() => selectSavedAddress(addr)}>Fill Form</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="address-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="fullName"
                                value={address.fullName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number *</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={address.phoneNumber}
                                onChange={handleChange}
                                placeholder="10 digit mobile number"
                                className="form-control"
                                maxLength="10"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Street Address *</label>
                        <input
                            type="text"
                            name="streetAddress"
                            value={address.streetAddress}
                            onChange={handleChange}
                            placeholder="House No., Building Name"
                            className="form-control"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City *</label>
                            <input
                                type="text"
                                name="city"
                                value={address.city}
                                onChange={handleChange}
                                placeholder="Enter city"
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>State *</label>
                            <input
                                type="text"
                                name="state"
                                value={address.state}
                                onChange={handleChange}
                                placeholder="Enter state"
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Postal Code *</label>
                            <input
                                type="text"
                                name="postalCode"
                                value={address.postalCode}
                                onChange={handleChange}
                                placeholder="6 digit postal code"
                                className="form-control"
                                maxLength="6"
                            />
                        </div>

                        <div className="form-group">
                            <label>Country *</label>
                            <input
                                type="text"
                                name="country"
                                value={address.country}
                                onChange={handleChange}
                                placeholder="Enter country"
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="button-group">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate("/cart")}
                        >
                            Back to Cart
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Continue to Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Address;
