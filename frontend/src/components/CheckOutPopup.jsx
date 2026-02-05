import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './CheckOutPopup.css';

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice, handleCheckout }) => {
  return (
    <div className="checkoutPopup">
      <Modal 
        show={show} 
        onHide={handleClose}
        dialogClassName="checkout-modal-dialog"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Checkout</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <div className="checkout-items">
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-item">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="cart-item-image"
                />
                <div className="item-details">
                  <p className="item-name"><strong>{item.name}</strong></p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: ₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
            
            <div className="checkout-total">
              Total: ₹{totalPrice}
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCheckout}>
            Confirm Purchase
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CheckoutPopup;
