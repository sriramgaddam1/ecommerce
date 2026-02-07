import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "./Account.css";
import API from "../axios";

const generateGradientFromString = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = hash % 360;
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 70%, 50%))`;
};

// Safe array renderer helper
const SafeList = ({ items = [], renderItem, emptyMessage = "No items found" }) => {
  if (!Array.isArray(items)) {
    console.error("SafeList received non-array:", items);
    return <div className="empty-message"><p>Error loading data</p></div>;
  }
  
  if (items.length === 0) {
    return <div className="empty-message"><p>{emptyMessage}</p></div>;
  }
  
  return <>{items.map(renderItem)}</>;
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
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Force array initialization
  const [orders, setOrders] = useState(() => []);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // Profile form states
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Address states - Force array
  const [addresses, setAddresses] = useState(() => []);
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

  // Payment states - Force array
  const [paymentMethods, setPaymentMethods] = useState(() => []);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    cardholderName: "",
    cardNumber: "",
    cardType: "Visa",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    isDefault: false,
  });

  console.log("🔍 Component Render - State Check:");
  console.log("addresses:", addresses, "isArray:", Array.isArray(addresses));
  console.log("orders:", orders, "isArray:", Array.isArray(orders));
  console.log("paymentMethods:", paymentMethods, "isArray:", Array.isArray(paymentMethods));

  const fetchOrders = async (id) => {
    try {
      const response = await API.get(`/auth/user/${id}/orders`);
      console.log("📦 Orders API Response:", response?.data);
      
      let data = [];
      if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (response?.data?.orders && Array.isArray(response.data.orders)) {
        data = response.data.orders;
      } else if (response?.data) {
        console.warn("Orders response is not an array:", response.data);
      }
      
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };

  const fetchAddresses = async (id) => {
    try {
      const response = await API.get(`/auth/user/${id}/addresses`);
      console.log("📍 Addresses API Response:", response?.data);
      
      let data = [];
      if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (response?.data?.addresses && Array.isArray(response.data.addresses)) {
        data = response.data.addresses;
      } else if (response?.data) {
        console.warn("Addresses response is not an array:", response.data);
      }
      
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setAddresses([]);
    }
  };

  const fetchPaymentMethods = async (id) => {
    try {
      const response = await API.get(`/auth/user/${id}/payment-methods`);
      console.log("💳 Payment Methods API Response:", response?.data);
      
      let data = [];
      if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (response?.data?.paymentMethods && Array.isArray(response.data.paymentMethods)) {
        data = response.data.paymentMethods;
      } else if (response?.data) {
        console.warn("Payment methods response is not an array:", response.data);
      }
      
      setPaymentMethods(data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      setPaymentMethods([]);
    }
  };

  const fetchUserProfile = async (id) => {
    try {
      const response = await API.get(`/auth/user/${id}/profile`);
      const { fullName, phoneNumber, dateOfBirth } = response.data || {};
      setFullName(fullName || "");
      setPhoneNumber(phoneNumber || "");
      setDateOfBirth(dateOfBirth || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("userId");

    if (!token || !id) {
      navigate("/login");
      return;
    }

    const user = localStorage.getItem("username");
    const userEmail = localStorage.getItem("userEmail");

    setUsername(user || "");
    setEmail(userEmail || "");
    setUserId(id || "");
    setNewUsername(user || "");

    // Don't set photo if it might fail
    if (id) {
      setProfilePhoto(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/user/${id}/photo`
      );
    }

    const loadData = async () => {
      try {
        await Promise.allSettled([
          fetchUserProfile(id),
          fetchAddresses(id),
          fetchPaymentMethods(id),
          fetchOrders(id),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes("/account/profile")) setActiveTab("profile");
    else if (pathname.includes("/account/addresses")) setActiveTab("addresses");
    else if (pathname.includes("/account/payments")) setActiveTab("payments");
    else if (pathname.includes("/account/orders")) setActiveTab("orders");
    else if (pathname.includes("/account/support")) setActiveTab("support");
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    if (!newUsername.trim()) {
      toast.error("Username cannot be empty");
      return;
    }
    setLoading(true);
    try {
      const profileData = {
        username: newUsername,
        fullName: fullName || newUsername,
        phoneNumber: phoneNumber || "",
        dateOfBirth: dateOfBirth || "",
      };
      await API.put(`/auth/user/${userId}/profile`, profileData);
      localStorage.setItem("username", newUsername);
      setUsername(newUsername);

      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        await API.post(`/auth/user/${userId}/upload-photo`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setProfilePhoto(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/user/${userId}/photo?t=${Date.now()}`
        );
        window.dispatchEvent(new Event("userLoggedIn"));
        setPhotoFile(null);
        setPhotoPreview(null);
      }
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveAddress = async () => {
    if (!addressForm.label || !addressForm.fullName || !addressForm.street || !addressForm.city) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      let endpoint = `/auth/user/${userId}/address`;
      let method = "post";
      if (editingAddressId) {
        endpoint = `/auth/user/${userId}/address/${editingAddressId}`;
        method = "put";
      }
      await API({ method, url: endpoint, data: addressForm });
      toast.success(editingAddressId ? "Address updated successfully!" : "Address added successfully!");
      setAddressForm({
        label: "", fullName: "", phoneNumber: "", street: "", city: "",
        state: "", zipCode: "", country: "", isDefault: false,
      });
      setShowAddressForm(false);
      setEditingAddressId(null);
      fetchAddresses(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving address");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await API.delete(`/auth/user/${userId}/address/${addressId}`);
      toast.success("Address deleted successfully!");
      fetchAddresses(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting address");
    }
  };

  const handleDefaultAddress = async (addressId) => {
    try {
      await API.put(`/auth/user/${userId}/address/${addressId}/default`);
      toast.success("Default address updated!");
      fetchAddresses(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating default address");
    }
  };

  const handleEditAddress = (address) => {
    setAddressForm(address);
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  };

  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSavePayment = async () => {
    if (!paymentForm.cardholderName || !paymentForm.cardNumber || !paymentForm.expiryMonth || !paymentForm.expiryYear) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (paymentForm.cardNumber.length < 13 || paymentForm.cardNumber.length > 19) {
      toast.error("Invalid card number");
      return;
    }
    setLoading(true);
    try {
      if (editingPaymentId) {
        toast.error("Editing payment methods is not supported yet");
        setLoading(false);
        return;
      }
      await API.post(`/auth/user/${userId}/payment-method`, paymentForm);
      toast.success("Payment method added successfully!");
      setPaymentForm({
        cardholderName: "", cardNumber: "", cardType: "Visa",
        expiryMonth: "", expiryYear: "", cvv: "", isDefault: false,
      });
      setShowPaymentForm(false);
      setEditingPaymentId(null);
      fetchPaymentMethods(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving payment method");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment method?")) return;
    try {
      await API.delete(`/auth/user/${userId}/payment-method/${paymentId}`);
      toast.success("Payment method deleted successfully!");
      fetchPaymentMethods(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting payment method");
    }
  };

  const handleDefaultPayment = async (paymentId) => {
    try {
      await API.put(`/auth/user/${userId}/payment-method/${paymentId}/default`);
      toast.success("Default payment method updated!");
      fetchPaymentMethods(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating default payment method");
    }
  };

  if (initialLoading) {
    return (
      <div className="account-container" style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' 
      }}>
        <div>Loading account data...</div>
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>My Account</h1>
        <p className="greeting">Welcome back, {username}!</p>
      </div>

      <div className="account-wrapper">
        {/* Sidebar */}
        <div className="account-sidebar">
          <div className="sidebar-user-card">
            <div className="user-avatar">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  setProfilePhoto(null);
                }} />
              ) : (
                <div className="avatar-initial" style={{ background: generateGradientFromString(username) }}>
                  {username?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <h3>{username}</h3>
            <p>{email}</p>
          </div>

          <nav className="sidebar-menu">
            <button className={`menu-item ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
              <i className="bi bi-person"></i> My Profile
            </button>
            <button className={`menu-item ${activeTab === "addresses" ? "active" : ""}`} onClick={() => setActiveTab("addresses")}>
              <i className="bi bi-geo-alt"></i> Addresses
            </button>
            <button className={`menu-item ${activeTab === "payments" ? "active" : ""}`} onClick={() => setActiveTab("payments")}>
              <i className="bi bi-credit-card"></i> Payment Methods
            </button>
            <button className={`menu-item ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
              <i className="bi bi-box"></i> My Orders
            </button>
            <button className={`menu-item ${activeTab === "support" ? "active" : ""}`} onClick={() => setActiveTab("support")}>
              <i className="bi bi-headset"></i> Customer Support
            </button>
            <button className="menu-item logout-menu" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="account-content">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="tab-content">
              <h2>Profile Information</h2>
              <div className="profile-form">
                <div className="photo-upload-section">
                  <div className="photo-preview-container">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="photo-preview" />
                    ) : profilePhoto ? (
                      <img src={profilePhoto} alt="Current" className="photo-preview" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; setProfilePhoto(null); }} />
                    ) : (
                      <div className="photo-placeholder">
                        <i className="bi bi-image"></i>
                        <p>No photo uploaded</p>
                      </div>
                    )}
                  </div>
                  <div className="photo-upload-controls">
                    <label htmlFor="photoInput" className="upload-btn">
                      <i className="bi bi-upload"></i> Upload Photo
                    </label>
                    <input id="photoInput" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoSelect} />
                    <p className="upload-info">JPG, PNG up to 5MB</p>
                  </div>
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={email} disabled />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Enter your phone number" />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </div>
                <button className="save-btn" onClick={handleUpdateProfile} disabled={loading}>
                  <i className="bi bi-check2"></i> {loading ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Saved Addresses</h2>
                <button className="add-btn" onClick={() => setShowAddressForm(true)}>
                  <i className="bi bi-plus-circle"></i> Add New Address
                </button>
              </div>

              {showAddressForm && (
                <div className="form-container">
                  <h3>{editingAddressId ? "Edit Address" : "Add New Address"}</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Address Label</label>
                      <input type="text" name="label" value={addressForm.label} onChange={handleAddressChange} placeholder="e.g., Home" />
                    </div>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input type="text" name="fullName" value={addressForm.fullName} onChange={handleAddressChange} />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="tel" name="phoneNumber" value={addressForm.phoneNumber} onChange={handleAddressChange} />
                    </div>
                    <div className="form-group full-width">
                      <label>Street Address</label>
                      <input type="text" name="street" value={addressForm.street} onChange={handleAddressChange} />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input type="text" name="city" value={addressForm.city} onChange={handleAddressChange} />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input type="text" name="state" value={addressForm.state} onChange={handleAddressChange} />
                    </div>
                    <div className="form-group">
                      <label>Zip Code</label>
                      <input type="text" name="zipCode" value={addressForm.zipCode} onChange={handleAddressChange} />
                    </div>
                    <div className="form-group">
                      <label>Country</label>
                      <input type="text" name="country" value={addressForm.country} onChange={handleAddressChange} />
                    </div>
                    <div className="form-group checkbox">
                      <input type="checkbox" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressChange} id="defaultAddress" />
                      <label htmlFor="defaultAddress">Set as default</label>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="save-btn" onClick={handleSaveAddress} disabled={loading}>
                      <i className="bi bi-check2"></i> {loading ? "Saving..." : "Save"}
                    </button>
                    <button className="cancel-btn" onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddressId(null);
                      setAddressForm({ label: "", fullName: "", phoneNumber: "", street: "", city: "", state: "", zipCode: "", country: "", isDefault: false });
                    }}>Cancel</button>
                  </div>
                </div>
              )}

              <div className="addresses-list">
                <SafeList 
                  items={addresses}
                  emptyMessage="No addresses saved yet."
                  renderItem={(address) => (
                    <div key={address.id} className="address-card">
                      <div className="address-header">
                        <h3>{address.label}</h3>
                        {address.isDefault && <span className="default-badge">Default</span>}
                      </div>
                      <p className="address-text"><strong>{address.fullName}</strong></p>
                      <p className="address-text">{address.street}</p>
                      <p className="address-text">{address.city}, {address.state} {address.zipCode}</p>
                      <p className="address-text">{address.country}</p>
                      <p className="address-text">Phone: {address.phoneNumber}</p>
                      <div className="address-actions">
                        <button onClick={() => handleEditAddress(address)}>Edit</button>
                        <button onClick={() => handleDeleteAddress(address.id)}>Delete</button>
                        {!address.isDefault && (
                          <button onClick={() => handleDefaultAddress(address.id)}>Set Default</button>
                        )}
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === "payments" && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Saved Payment Methods</h2>
                <button className="add-btn" onClick={() => setShowPaymentForm(!showPaymentForm)}>
                  <i className="bi bi-plus-circle"></i> Add Payment Method
                </button>
              </div>

              {showPaymentForm && (
                <div className="form-container">
                  <h3>Add New Payment Method</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Cardholder Name</label>
                      <input type="text" name="cardholderName" value={paymentForm.cardholderName} onChange={handlePaymentChange} />
                    </div>
                    <div className="form-group">
                      <label>Card Type</label>
                      <select name="cardType" value={paymentForm.cardType} onChange={handlePaymentChange}>
                        <option>Visa</option>
                        <option>Mastercard</option>
                        <option>American Express</option>
                        <option>Discover</option>
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label>Card Number</label>
                      <input type="text" name="cardNumber" value={paymentForm.cardNumber} onChange={handlePaymentChange} maxLength={19} />
                    </div>
                    <div className="form-group">
                      <label>Expiry Month</label>
                      <input type="text" name="expiryMonth" value={paymentForm.expiryMonth} onChange={handlePaymentChange} maxLength={2} />
                    </div>
                    <div className="form-group">
                      <label>Expiry Year</label>
                      <input type="text" name="expiryYear" value={paymentForm.expiryYear} onChange={handlePaymentChange} maxLength={2} />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input type="password" name="cvv" value={paymentForm.cvv} onChange={handlePaymentChange} maxLength={4} />
                    </div>
                    <div className="form-group checkbox">
                      <input type="checkbox" name="isDefault" checked={paymentForm.isDefault} onChange={handlePaymentChange} id="defaultPayment" />
                      <label htmlFor="defaultPayment">Set as default</label>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="save-btn" onClick={handleSavePayment} disabled={loading}>
                      <i className="bi bi-check2"></i> {loading ? "Saving..." : "Save"}
                    </button>
                    <button className="cancel-btn" onClick={() => {
                      setShowPaymentForm(false);
                      setPaymentForm({ cardholderName: "", cardNumber: "", cardType: "Visa", expiryMonth: "", expiryYear: "", cvv: "", isDefault: false });
                    }}>Cancel</button>
                  </div>
                </div>
              )}

              <div className="payments-list">
                <SafeList 
                  items={paymentMethods}
                  emptyMessage="No payment methods saved. Add one for faster checkout!"
                  renderItem={(method) => (
                    <div key={method.id} className="payment-card">
                      <div className="card-icon"><i className="bi bi-credit-card"></i></div>
                      <div className="card-details">
                        <h3>{method.cardType} Card</h3>
                        <p>Card ending in {method.cardNumber}</p>
                        <p className="expiry">Expires: {method.expiryMonth}/{method.expiryYear}</p>
                        <p className="cardholder">{method.cardholderName}</p>
                      </div>
                      <div className="card-actions">
                        {!method.isDefault && (
                          <button className="default-btn" onClick={() => handleDefaultPayment(method.id)}>Set as Default</button>
                        )}
                        {method.isDefault && <span className="default-badge">Default</span>}
                        <button className="delete-link" onClick={() => handleDeletePayment(method.id)}>Delete</button>
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="tab-content">
              <h2>My Orders</h2>
              <div className="orders-list">
                <SafeList 
                  items={orders}
                  emptyMessage="No orders yet."
                  renderItem={(order) => (
                    <div key={order.id || order.orderId} className="order-card">
                      <h3>Order #{order.id || order.orderId}</h3>
                      <p>Status: {order.status}</p>
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {/* Support Tab */}
          {activeTab === "support" && (
            <div className="tab-content">
              <h2>Customer Support</h2>
              <div className="support-container">
                <div className="support-card">
                  <div className="support-icon"><i className="bi bi-chat-dots"></i></div>
                  <h3>Live Chat</h3>
                  <p>Chat with our support team</p>
                  <button className="support-btn">Start Chat</button>
                </div>
                <div className="support-card">
                  <div className="support-icon"><i className="bi bi-envelope"></i></div>
                  <h3>Email Support</h3>
                  <p>We'll respond within 24 hours</p>
                  <button className="support-btn">Send Email</button>
                </div>
                <div className="support-card">
                  <div className="support-icon"><i className="bi bi-telephone"></i></div>
                  <h3>Phone Support</h3>
                  <p>Call us at 1-800-SHOP-NOW</p>
                  <button className="support-btn">Call Us</button>
                </div>
                <div className="support-card">
                  <div className="support-icon"><i className="bi bi-question-circle"></i></div>
                  <h3>FAQ</h3>
                  <p>Find answers to common questions</p>
                  <button className="support-btn">View FAQ</button>
                </div>
              </div>
              <div className="faq-section">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-item">
                  <h4>How do I track my order?</h4>
                  <p>You can track your order from the "My Orders" section.</p>
                </div>
                <div className="faq-item">
                  <h4>What is your return policy?</h4>
                  <p>We accept returns within 30 days of purchase.</p>
                </div>
                <div className="faq-item">
                  <h4>How long does delivery take?</h4>
                  <p>Standard delivery takes 3–5 business days.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
