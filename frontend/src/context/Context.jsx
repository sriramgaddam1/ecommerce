import axios from "../axios";
import { useState, useEffect, createContext, useCallback } from "react";

const AppContext = createContext({
    data: [],
    isError: "",
    cart: [],
    isAuthenticated: false,
    addToCart: () => {},
    removeFromCart: () => {},
    updateQuantity: () => {},
    clearCart: () => {},
    refreshData: () => {},
});

export const AppProvider = ({ children }) => {
    const [data, setData] = useState([]);
    const [isError, setIsError] = useState("");

    /* --------------------------------
       AUTH STATE
    -------------------------------- */
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => !!localStorage.getItem("token")
    );

    useEffect(() => {
        const syncAuth = () =>
            setIsAuthenticated(!!localStorage.getItem("token"));
        window.addEventListener("userLoggedIn", syncAuth);
        window.addEventListener("userLoggedOut", syncAuth);
        return () => {
            window.removeEventListener("userLoggedIn", syncAuth);
            window.removeEventListener("userLoggedOut", syncAuth);
        };
    }, []);

    /* --------------------------------
       CART (PERSISTED) - SAFE VERSION
    -------------------------------- */
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem("cart");
            if (!saved) return [];
            
            const parsed = JSON.parse(saved);
            
            // CRITICAL: Ensure it's actually an array
            if (Array.isArray(parsed)) {
                console.log("✅ Cart loaded from localStorage:", parsed.length, "items");
                return parsed;
            } else {
                console.warn("⚠️ Cart in localStorage is not an array:", parsed);
                localStorage.removeItem("cart"); // Clear corrupted data
                return [];
            }
        } catch (error) {
            console.error("❌ Error parsing cart from localStorage:", error);
            localStorage.removeItem("cart"); // Clear corrupted data
            return [];
        }
    });

    useEffect(() => {
        try {
            if (Array.isArray(cart)) {
                localStorage.setItem("cart", JSON.stringify(cart));
            } else {
                console.error("❌ Attempted to save non-array cart:", cart);
                setCart([]); // Reset to empty array
            }
        } catch (error) {
            console.error("❌ Error saving cart to localStorage:", error);
        }
    }, [cart]);

    /* --------------------------------
       CART ACTIONS - SAFE VERSION
    -------------------------------- */
    const addToCart = (product) => {
        setCart((prev) => {
            if (!Array.isArray(prev)) {
                console.error("❌ Cart is not an array in addToCart:", prev);
                return [{ ...product, quantity: 1 }];
            }

            const existing = prev.find((i) => i.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? {
                              ...item,
                              quantity: Math.min(
                                  item.quantity + 1,
                                  item.stockQuantity || 999
                              ),
                          }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId, delta) => {
        setCart((prev) => {
            if (!Array.isArray(prev)) {
                console.error("❌ Cart is not an array in updateQuantity:", prev);
                return [];
            }

            return prev.map((item) =>
                item.id === productId
                    ? {
                          ...item,
                          quantity: Math.max(
                              1,
                              Math.min(
                                  item.quantity + delta,
                                  item.stockQuantity || 999
                              )
                          ),
                      }
                    : item
            );
        });
    };

    const removeFromCart = (productId) => {
        setCart((prev) => {
            if (!Array.isArray(prev)) {
                console.error("❌ Cart is not an array in removeFromCart:", prev);
                return [];
            }
            return prev.filter((i) => i.id !== productId);
        });
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("cart");
    };

    /* --------------------------------
       FETCH PRODUCTS (STABLE)
    -------------------------------- */
    const refreshData = useCallback(async () => {
        try {
            const res = await axios.get("/products");
            
            // Ensure data is always an array
            if (Array.isArray(res.data)) {
                setData(res.data);
            } else if (res.data?.products && Array.isArray(res.data.products)) {
                setData(res.data.products);
            } else {
                console.warn("⚠️ Products response is not an array:", res.data);
                setData([]);
            }
        } catch (err) {
            console.error("❌ Error fetching products:", err);
            setIsError(err.message);
            setData([]);
        }
    }, []);

    useEffect(() => {
        refreshData(); // fetch ONCE on app load
    }, [refreshData]);

    // Debug log on every render
    console.log("🔍 Context State:", {
        cart: cart,
        cartIsArray: Array.isArray(cart),
        cartLength: Array.isArray(cart) ? cart.length : "NOT ARRAY",
        data: Array.isArray(data) ? `${data.length} products` : "NOT ARRAY",
    });

    return (
        <AppContext.Provider
            value={{
                data,
                isError,
                cart,
                isAuthenticated,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                refreshData,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;
