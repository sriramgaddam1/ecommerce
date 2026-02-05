import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "../context/Context";
import axios from "axios";
import { toast } from "react-toastify";
import "./Product.css";

/* ✅ BACKEND URL */
const BASE_URL = import.meta.env.VITE_API_URL;

const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, refreshData } =
    useContext(AppContext);

  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/product/${id}`
        );
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product ❌");
      }
    };

    fetchProduct();
  }, [id]);

  /* ---------------- DELETE PRODUCT ---------------- */
  const deleteProduct = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/product/${id}`);
      removeFromCart(id);
      refreshData();

      toast.success("Product deleted successfully 🗑️");
      navigate("/");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product ❌");
    }
  };

  /* ---------------- ADD TO CART ---------------- */
  const handleAddToCart = () => {
    addToCart(product);
    toast.success("Product added to cart 🛒");
  };

  if (!product) {
    return (
      <h2 className="text-center" style={{ padding: "10rem" }}>
        Loading...
      </h2>
    );
  }

  return (
    <div className="containers" style={{ display: "flex" }}>
      {/* IMAGE */}
      <img
        className="left-column-img"
        src={`${BASE_URL}/api/product/${id}/image`}
        alt={product.name}
        style={{ width: "50%", height: "auto" }}
      />

      {/* DETAILS */}
      <div className="right-column" style={{ width: "50%" }}>
        <div className="product-description">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{product.category}</span>
            <h6>
              Listed :
              <i> {new Date(product.releaseDate).toLocaleDateString()}</i>
            </h6>
          </div>

          <h1>{product.name}</h1>
          <i>{product.brand}</i>

          <p style={{ fontWeight: "bold" }}>PRODUCT DESCRIPTION :</p>
          <p>{product.description}</p>
        </div>

        <div className="product-price">
          <span>{"₹" + product.price}</span>

          <button
            className={`cart-btn ${
              !product.productAvailable ? "disabled-btn" : ""
            }`}
            onClick={handleAddToCart}
            disabled={!product.productAvailable}
          >
            {product.productAvailable ? "Add to cart" : "Out of Stock"}
          </button>

          <h6>
            Stock Available :
            <i style={{ color: "green", fontWeight: "bold" }}>
              {product.stockQuantity}
            </i>
          </h6>
        </div>
      </div>
    </div>
  );
};

export default Product;
