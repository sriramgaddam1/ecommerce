import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../axios";
import { toast } from "react-toastify";
import "./Auth.css";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({
        identifier: "",
        password: "",
    });

    const [signupData, setSignupData] = useState({
        username: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
    });

    // Handle login input change
    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle signup input change
    const handleSignupChange = (e) => {
        const { name, value } = e.target;
        setSignupData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle login submission
    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        if (!loginData.identifier || !loginData.password) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const response = await API.post("/auth/login", {
                username: loginData.identifier,
                password: loginData.password,
            });

            // Store token and user info
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("userId", response.data.userId);
                localStorage.setItem("username", response.data.username);
                localStorage.setItem("userEmail", response.data.email);
                localStorage.setItem("userRole", response.data.role);

                // Fetch and store user profile photo
                try {
                    const profileResponse = await API.get(`/auth/user/${response.data.userId}/profile`);
                    if (profileResponse.data.profilePhotoBase64) {
                        localStorage.setItem("profilePhoto", profileResponse.data.profilePhotoBase64);
                    }
                } catch (profileError) {
                    console.log("Could not fetch profile photo:", profileError);
                }

                // Update axios header with token
                API.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

                // Dispatch custom event to update Navbar
                window.dispatchEvent(new Event("userLoggedIn"));
            }

            toast.success("Login successful!");
            navigate("/");
        } catch (error) {
            console.error("Login error:", error);
            toast.error(
                error.response?.data?.message || "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    // Handle signup submission
    const handleSignupSubmit = async (e) => {
        e.preventDefault();

        if (
            !signupData.username ||
            !signupData.email ||
            !signupData.password ||
            !signupData.confirmPassword
        ) {
            toast.error("Please fill in all fields");
            return;
        }

        if (signupData.password !== signupData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (signupData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            const response = await API.post("/auth/register", {
                username: signupData.username,
                email: signupData.email,
                password: signupData.password,
                phoneNumber: signupData.phoneNumber,
            });

            toast.success("Account created successfully! Please log in.");
            setIsLogin(true);
            setSignupData({
                username: "",
                email: "",
                phoneNumber: "",
                password: "",
                confirmPassword: "",
            });
            setLoginData({
                identifier: signupData.email,
                password: "",
            });
        } catch (error) {
            console.error("Signup error:", error);
            toast.error(
                error.response?.data?.message ||
                "Signup failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-toggle">
                    <button
                        className={`toggle-btn ${isLogin ? "active" : ""}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`toggle-btn ${!isLogin ? "active" : ""}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Sign Up
                    </button>
                </div>

                {isLogin ? (
                    // LOGIN FORM
                    <form onSubmit={handleLoginSubmit} className="auth-form">
                        <h2>Welcome Back</h2>
                        <p className="auth-subtitle">
                            Sign in to your account to continue shopping
                        </p>

                        <div className="form-group">
                            <label htmlFor="login-identifier">Email / Username / Mobile</label>
                            <input
                                type="text"
                                id="login-identifier"
                                name="identifier"
                                value={loginData.identifier}
                                onChange={handleLoginChange}
                                placeholder="Email, username or mobile number"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="login-password">Password</label>
                            <input
                                type="password"
                                id="login-password"
                                name="password"
                                value={loginData.password}
                                onChange={handleLoginChange}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <div className="form-options">
                            <label className="remember">
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="#" className="forgot-password">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        <p className="auth-footer">
                            Don't have an account?{" "}
                            <button
                                type="button"
                                className="switch-btn"
                                onClick={() => setIsLogin(false)}
                            >
                                Sign up here
                            </button>
                        </p>
                    </form>
                ) : (
                    // SIGNUP FORM
                    <form onSubmit={handleSignupSubmit} className="auth-form">
                        <h2>Create Account</h2>
                        <p className="auth-subtitle">
                            Join us and start shopping today
                        </p>

                        <div className="form-group">
                            <label htmlFor="signup-username">Full Name</label>
                            <input
                                type="text"
                                id="signup-username"
                                name="username"
                                value={signupData.username}
                                onChange={handleSignupChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="signup-email">Email Address</label>
                            <input
                                type="email"
                                id="signup-email"
                                name="email"
                                value={signupData.email}
                                onChange={handleSignupChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="signup-phone">Mobile Number (optional)</label>
                            <input
                                type="tel"
                                id="signup-phone"
                                name="phoneNumber"
                                value={signupData.phoneNumber}
                                onChange={handleSignupChange}
                                placeholder="Enter your mobile number"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="signup-password">Password</label>
                            <input
                                type="password"
                                id="signup-password"
                                name="password"
                                value={signupData.password}
                                onChange={handleSignupChange}
                                placeholder="Create a password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm-password">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirm-password"
                                name="confirmPassword"
                                value={signupData.confirmPassword}
                                onChange={handleSignupChange}
                                placeholder="Confirm your password"
                                required
                            />
                        </div>

                        <div className="terms">
                            <input type="checkbox" id="terms" required />
                            <label htmlFor="terms">
                                I agree to the Terms & Conditions
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Sign Up"}
                        </button>

                        <p className="auth-footer">
                            Already have an account?{" "}
                            <button
                                type="button"
                                className="switch-btn"
                                onClick={() => setIsLogin(true)}
                            >
                                Login here
                            </button>
                        </p>
                    </form>
                )}
            </div>

            <div className="auth-banner">
                <div className="banner-content">
                    <h1>Welcome to ShopHub</h1>
                    <p>Your favorite online shopping destination</p>
                    <div className="banner-features">
                        <div className="feature">
                            <span className="feature-icon">🚚</span>
                            <p>Fast Delivery</p>
                        </div>
                        <div className="feature">
                            <span className="feature-icon">💳</span>
                            <p>Secure Payment</p>
                        </div>
                        <div className="feature">
                            <span className="feature-icon">✅</span>
                            <p>Easy Returns</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
