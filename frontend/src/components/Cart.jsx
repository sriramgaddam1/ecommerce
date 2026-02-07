import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

import AppContext from "../context/Context";
import CheckoutPopup from "./CheckOutPopup";
import "./Cart.css";

/* ✅ BACKEND BASE URL */
const BASE_URL = import.meta.env.VITE_API_URL;

const Cart = () => {
  const navigate = useNavigate();

  const {
    cart = [],
    removeFromCart,
    updateQuantity,
    isAuthenticated,
  } = useContext(AppContext) || {};

  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showModal, setShowModal] = useState(false);

  console.log("🛒 Cart component - cart:", cart, "isArray:", Array.isArray(cart));

  /* -------------------------------
     AUTH GUARD
  ------------------------------- */
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning("Please login to view your cart 🔐");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  /* -------------------------------
     SYNC CART + IMAGE URL (FIXED)
  ------------------------------- */
  useEffect(() => {
    if (!Array.isArray(cart)) {
      console.warn("Cart is not an array:", cart);
      setCartItems([]);
      return;
    }

    const items = cart.map((item) => ({
      ...item,
      imageUrl: `${BASE_URL}/api/product/${item.id}/image`,
    }));
    setCartItems(items);
  }, [cart]);

  /* -------------------------------
     TOTAL PRICE
  ------------------------------- */
  useEffect(() => {
    if (!Array.isArray(cartItems)) {
      setTotalPrice(0);
      return;
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cartItems]);

  /* -------------------------------
     QUANTITY HANDLERS
  ------------------------------- */
  const increaseQty = (id) => updateQuantity && updateQuantity(id, 1);
  const decreaseQty = (id) => updateQuantity && updateQuantity(id, -1);

  /* -------------------------------
     REMOVE ITEM
  ------------------------------- */
  const handleRemove = (id) => {
    if (removeFromCart) {
      removeFromCart(id);
      toast.info("Item removed 🗑️");
    }
  };

  /* -------------------------------
     CHECKOUT
  ------------------------------- */
  const handleCheckout = () => {
    toast.success("Proceeding to address... 🚚");
    setShowModal(false);

    navigate("/address", {
      state: { cartItems, totalPrice },
    });
  };

  /* -------------------------------
     UI
  ------------------------------- */
  return (
    <div className="cart-container">
      <div className="shopping-cart">
        <h2 className="title">Shopping Bag</h2>

        {!Array.isArray(cartItems) || cartItems.length === 0 ? (
          <div className="cart-empty">
            <h4>Your cart is empty</h4>
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                {/* IMAGE */}
                <div className="cart-left">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="cart-item-image"
                    onError={(e) => {
                      e.currentTarget.src = "/no-image.png";
                    }}
                  />
                </div>

                {/* NAME */}
                <div className="cart-center">
                  <div className="brand">{item.brand}</div>
                  <div className="name">{item.name}</div>
                </div>

                {/* QTY + PRICE */}
                <div className="cart-right">
                  <div className="quantity">
                    <button onClick={() => decreaseQty(item.id)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQty(item.id)}>+</button>
                  </div>

                  <div className="price">
                    ₹{item.price * item.quantity}
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(item.id)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}

            <div className="total">Total: ₹{totalPrice}</div>

            <Button
              className="checkout-btn"
              onClick={() => setShowModal(true)}
            >
              Checkout
            </Button>
          </>
        )}
      </div>

      <CheckoutPopup
        show={showModal}
        handleClose={() => setShowModal(false)}
        cartItems={cartItems}
        totalPrice={totalPrice}
        handleCheckout={handleCheckout}
      />
    </div>
  );
};

export default Cart;
