import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import "./Address.css";

/* ✅ BACKEND BASE URL */
const BASE_URL = import.meta.env.VITE_API_URL;

const Address = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems = [], totalPrice = 0 } = location.state || {};

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

  /* ======================
     LOAD SAVED ADDRESSES
  ====================== */
  useEffect(() => {
    const id = localStorage.getItem("userId");
    setUserId(id || "");

    if (id) {
      fetchSavedAddresses(id);
    }
  }, []);

  const fetchSavedAddresses = async (id) => {
    try {
      const resp = await axios.get(
        `${BASE_URL}/api/auth/user/${id}/addresses`
      );
      
      console.log("📍 Address API Response:", resp?.data);
      
      // Handle both array and object wrapper formats (Spring Boot)
      let data = [];
      if (Array.isArray(resp?.data)) {
        data = resp.data;
      } else if (resp?.data?.addresses && Array.isArray(resp.data.addresses)) {
        data = resp.data.addresses;
      } else if (resp?.data) {
        console.warn("Addresses response is not an array:", resp.data);
      }
      
      setSavedAddresses(data);
    } catch (err) {
      console.error("Error fetching saved addresses:", err);
      setSavedAddresses([]);
    }
  };

  /* ======================
     FORM HANDLERS
  ====================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectSavedAddress = (addr) => {
    setAddress({
      fullName: addr.fullName || "",
      phoneNumber: addr.phoneNumber || "",
      streetAddress: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.zipCode || "",
      country: addr.country || "",
    });

    setShowSaved(false);
    toast.info("Saved address selected ✅");
  };

  const useSavedAddress = (addr) => {
    navigate("/payment", {
      state: {
        cartItems,
        totalPrice,
        address: {
          fullName: addr.fullName,
          phoneNumber: addr.phoneNumber,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zipCode,
          country: addr.country,
        },
      },
    });
  };

  /* ======================
     SUBMIT ADDRESS
  ====================== */
  const handleSubmit = (e) => {
    e.preventDefault();

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

    navigate("/payment", {
      state: {
        cartItems,
        totalPrice,
        address: {
          fullName: address.fullName,
          phoneNumber: address.phoneNumber,
          street: address.streetAddress,
          city: address.city,
          state: address.state,
          zipCode: address.postalCode,
          country: address.country,
        },
      },
    });
  };

  return (
    <div className="address-container" style={{ marginTop: "80px" }}>
      <div className="address-wrapper">
        <h2>Delivery Address</h2>
        <p>Total Amount: <strong>₹{totalPrice}</strong></p>

        {Array.isArray(savedAddresses) && savedAddresses.length > 0 && (
          <button
            className="btn-previous-addresses"
            onClick={() => setShowSaved(!showSaved)}
          >
            {showSaved ? "✕ Hide Saved Addresses" : "+ Use Saved Address"}
          </button>
        )}

        {showSaved && Array.isArray(savedAddresses) && savedAddresses.length > 0 && (
          <div className="previous-addresses-container">
            {savedAddresses.map((addr) => (
              <div key={addr.id} className="previous-address-card">
                <p><strong>{addr.fullName}</strong></p>
                <p>{addr.street}</p>
                <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                <button onClick={() => useSavedAddress(addr)}>Use</button>
                <button onClick={() => selectSavedAddress(addr)}>Fill Form</button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="address-form">
          <input name="fullName" placeholder="Full Name" onChange={handleChange} value={address.fullName} />
          <input name="phoneNumber" placeholder="Phone Number" onChange={handleChange} value={address.phoneNumber} />
          <input name="streetAddress" placeholder="Street" onChange={handleChange} value={address.streetAddress} />
          <input name="city" placeholder="City" onChange={handleChange} value={address.city} />
          <input name="state" placeholder="State" onChange={handleChange} value={address.state} />
          <input name="postalCode" placeholder="Postal Code" onChange={handleChange} value={address.postalCode} />
          <input name="country" placeholder="Country" onChange={handleChange} value={address.country} />

          <div className="button-group">
            <button type="button" onClick={() => navigate("/cart")}>
              Back to Cart
            </button>
            <button type="submit">
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Address;
