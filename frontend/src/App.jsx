import "./App.css";
import React, { useState } from "react";
import Home from "./components/Home";
import Navbar from "./components/NavBar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import SearchResults from "./components/SearchResults";
import Address from "./components/Address";
import Payment from "./components/Payment";
import OrderConfirmed from "./components/OrderConfirmed";
import Auth from "./components/Auth";
import Account from "./components/Account";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/Context.jsx";
import UpdateProduct from "./components/UpdateProduct";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderDetails from "./components/OrderDetails";

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("❌ Error caught in ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'red' }}>
                    <h1>Something went wrong</h1>
                    <pre>{this.state.error?.toString()}</pre>
                    <button onClick={() => window.location.reload()}>Reload Page</button>
                </div>
            );
        }
        return this.props.children;
    }
}

function App() {
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };
    
    const addToCart = (product) => {
        const existingProduct = cart.find((item) => item.id === product.id);
        if (existingProduct) {
            setCart(
                cart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };
    
    return (
        <ErrorBoundary>
            <AppProvider>
                <BrowserRouter>
                    <ErrorBoundary>
                        <Navbar onSelectCategory={handleCategorySelect} />
                    </ErrorBoundary>
                    
                    {/* ✅ TOASTS */}
                    <ToastContainer
                        position="bottom-right"
                        autoClose={2000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        pauseOnHover
                        draggable
                        theme="light"
                    />
                    
                    <Routes>
                        <Route path="/login" element={<Auth />} />
                        <Route path="/account/profile" element={<Account />} />
                        <Route path="/account/addresses" element={<Account />} />
                        <Route path="/account/payments" element={<Account />} />
                        <Route path="/account/orders" element={<Account />} />
                        <Route path="/account/orders/:orderId" element={<OrderDetails />} />
                        <Route path="/account/support" element={<Account />} />
                        <Route
                            path="/"
                            element={
                                <Home
                                    addToCart={addToCart}
                                    selectedCategory={selectedCategory}
                                />
                            }
                        />
                        <Route path="/add_product" element={<AddProduct />} />
                        <Route path="/product" element={<Product />} />
                        <Route path="/product/:id" element={<Product />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/product/update/:id" element={<UpdateProduct />} />
                        <Route path="/search" element={<SearchResults />} />
                        <Route path="/address" element={<Address />} />
                        <Route path="/payment" element={<Payment />} />
                        <Route path="/order-confirmed" element={<OrderConfirmed />} />
                    </Routes>
                </BrowserRouter>
            </AppProvider>
        </ErrorBoundary>
    );
}

export default App;
