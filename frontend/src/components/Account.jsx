import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import "./Account.css";

const BASE_URL = import.meta.env.VITE_API_URL;

const generateGradientFromString = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = hash % 360;
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg,
    hsl(${hue1}, 70%, 60%),
    hsl(${hue2}, 70%, 50%)
  )`;
};

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("profile");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    fullName: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    isDefault: false,
  });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardholderName: "",
    cardNumber: "",
    cardType: "Visa",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    isDefault: false,
  });

  /* ================= INIT ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const id = localStorage.getItem("userId");
    const user = localStorage.getItem("username");
    const mail = localStorage.getItem("userEmail");

    setUserId(id);
    setUsername(user);
    setNewUsername(user);
    setEmail(mail);

    if (id) {
      setProfilePhoto(`${BASE_URL}/api/auth/user/${id}/photo`);
      fetchProfile(id);
      fetchAddresses(id);
      fetchPaymentMethods(id);
      fetchOrders(id);
    }
  }, []);

  /* ================= API CALLS ================= */

  const fetchProfile = async (id) => {
    const res = await axios.get(`${BASE_URL}/api/auth/user/${id}/profile`);
    setFullName(res.data.fullName || "");
    setPhoneNumber(res.data.phoneNumber || "");
    setDateOfBirth(res.data.dateOfBirth || "");
  };

  const fetchOrders = async (id) => {
    const res = await axios.get(`${BASE_URL}/api/auth/user/${id}/orders`);
    setOrders(res.data || []);
  };

  const fetchAddresses = async (id) => {
    const res = await axios.get(`${BASE_URL}/api/auth/user/${id}/addresses`);
    setAddresses(res.data || []);
  };

  const fetchPaymentMethods = async (id) => {
    const res = await axios.get(`${BASE_URL}/api/auth/user/${id}/payment-methods`);
    setPaymentMethods(res.data || []);
  };

  /* ================= PROFILE ================= */

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await axios.put(`${BASE_URL}/api/auth/user/${userId}/profile`, {
        username: newUsername,
        fullName,
        phoneNumber,
        dateOfBirth,
      });

      if (photoFile) {
        const fd = new FormData();
        fd.append("file", photoFile);
        await axios.post(`${BASE_URL}/api/auth/user/${userId}/upload-photo`, fd);
        setProfilePhoto(`${BASE_URL}/api/auth/user/${userId}/photo?t=${Date.now()}`);
      }

      localStorage.setItem("username", newUsername);
      setUsername(newUsername);
      toast.success("Profile updated");
    } catch {
      toast.error("Profile update failed");
    }
    setLoading(false);
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ================= TAB HANDLING ================= */

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("orders")) setActiveTab("orders");
    else if (path.includes("addresses")) setActiveTab("addresses");
    else if (path.includes("payments")) setActiveTab("payments");
    else setActiveTab("profile");
  }, [location]);

  return (
    <div className="account-container">
      <h1>My Account</h1>
      <p>Welcome back, {username}</p>

      {activeTab === "profile" && (
        <div>
          <img
            src={profilePhoto}
            alt=""
            onError={() => setProfilePhoto(null)}
          />
          <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <button onClick={handleUpdateProfile} disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Account;
