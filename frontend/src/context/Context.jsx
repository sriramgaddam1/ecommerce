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
       CART (PERSISTED)
    -------------------------------- */
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    /* --------------------------------
       CART ACTIONS
    -------------------------------- */
    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? {
                              ...item,
                              quantity: Math.min(
                                  item.quantity + 1,
                                  item.stockQuantity
                              ),
                          }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId, delta) => {
        setCart((prev) =>
            prev.map((item) =>
                item.id === productId
                    ? {
                          ...item,
                          quantity: Math.max(
                              1,
                              Math.min(
                                  item.quantity + delta,
                                  item.stockQuantity
                              )
                          ),
                      }
                    : item
            )
        );
    };

    const removeFromCart = (productId) => {
        setCart((prev) => prev.filter((i) => i.id !== productId));
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
            setData(res.data);
        } catch (err) {
            setIsError(err.message);
        }
    }, []);

    useEffect(() => {
        refreshData(); // fetch ONCE on app load
    }, [refreshData]);

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
