import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Navbar.css";

/* =======================
   BACKEND BASE URL
======================= */
const BASE_URL = import.meta.env.VITE_API_URL;

/* =======================
   CATEGORIES - MOVED OUTSIDE COMPONENT
======================= */
const CATEGORIES = [
  "Laptop",
  "Headphone",
  "Mobile",
  "Electronics",
  "Toys",
  "Fashion",
  "Accessories",
];

/* =======================
   UTIL: AVATAR GRADIENT
======================= */
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

/* =======================
   ICONS
======================= */
const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
  </svg>
);

/* =======================
   NAVBAR
======================= */
const Navbar = ({ onSelectCategory }) => {
  const navigate = useNavigate();

  const getInitialTheme = () =>
    localStorage.getItem("theme") || "light-theme";

  const [theme, setTheme] = useState(getInitialTheme());
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [photoAvailable, setPhotoAvailable] = useState(true);

  /* =======================
     LOGIN CHECK
  ======================= */
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("username");
    const id = localStorage.getItem("userId");

    if (token && user && id) {
      setIsLoggedIn(true);
      setUsername(user);
      setUserId(id);
      setPhotoAvailable(true);
    } else {
      setIsLoggedIn(false);
      setUsername("");
      setUserId(null);
    }
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    checkLoginStatus();

    window.addEventListener("storage", checkLoginStatus);
    window.addEventListener("userLoggedIn", checkLoginStatus);
    window.addEventListener("userLoggedOut", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("userLoggedIn", checkLoginStatus);
      window.removeEventListener("userLoggedOut", checkLoginStatus);
    };
  }, []);

  /* =======================
     THEME TOGGLE
  ======================= */
  const toggleTheme = () => {
    const newTheme =
      theme === "dark-theme" ? "light-theme" : "dark-theme";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  /* =======================
     SEARCH
  ======================= */
  const handleChange = async (value) => {
    setInput(value);

    if (value.trim().length > 0) {
      setShowSearchResults(true);
      try {
        const response = await axios.get(
          `${BASE_URL}/api/products/search?keyword=${value}`
        );
        setSearchResults(response.data || []);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      }
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && input.trim()) {
      navigate(`/search?q=${encodeURIComponent(input)}`);
      setInput("");
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  /* =======================
     LOGOUT
  ======================= */
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUsername("");
    setUserId(null);
    setShowAccountMenu(false);

    window.dispatchEvent(new Event("userLoggedOut"));
    toast.success("Logged out successfully!");
    navigate("/");
  };

  const profilePhotoUrl = userId
    ? `${BASE_URL}/api/auth/user/${userId}/photo`
    : null;

  return (
    <header>
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">INVENTORY</a>

          <div className="collapse navbar-collapse">
            {/* LEFT */}
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link active" href="/">Home</a>
              </li>

              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="/"
                  data-bs-toggle="dropdown"
                >
                  Categories
                </a>
                <ul className="dropdown-menu">
                  {CATEGORIES.map((category) => (
                    <li key={category}>
                      <button
                        className="dropdown-item"
                        onClick={() => onSelectCategory(category)}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>

            {/* SEARCH */}
            <div className="navbar-search-center">
              <input
                className="form-control"
                type="search"
                placeholder="Search products..."
                value={input}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleSearchSubmit}
              />
            </div>

            {/* RIGHT */}
            <div className="d-flex align-items-center gap-3 ms-auto">
              <button className="theme-toggle-btn" onClick={toggleTheme}>
                {theme === "dark-theme" ? <SunIcon /> : <MoonIcon />}
              </button>

              <a href="/cart" className="nav-link">🛒</a>

              {isLoggedIn ? (
                <div className="account-section">
                  <button
                    className="account-btn"
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                  >
                    <div className="profile-avatar">
                      {photoAvailable ? (
                        <img
                          src={profilePhotoUrl}
                          alt={username}
                          onError={() => setPhotoAvailable(false)}
                        />
                      ) : (
                        <div
                          className="avatar-initial"
                          style={{
                            background: generateGradientFromString(username),
                          }}
                        >
                          {username?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>

                    <span className="username-text">{username}</span>
                  </button>

                  {showAccountMenu && (
                    <div className="account-dropdown">
                      <a href="/account/profile" className="dropdown-item">
                        My Profile
                      </a>
                      <hr className="dropdown-divider" />
                      <button
                        className="dropdown-item logout-btn"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <a href="/login" className="nav-link">Login</a>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
