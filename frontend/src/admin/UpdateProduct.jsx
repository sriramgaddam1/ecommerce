import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../components/UpdateProduct.css";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [updateProduct, setUpdateProduct] = useState({
    id: null,
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    releaseDate: "",
    productAvailable: false,
    stockQuantity: "",
  });
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
            `http://localhost:8080/api/product/${id}`
        );
        setUpdateProduct(res.data);
        setImagePreview(
            `http://localhost:8080/api/product/${id}/image`
        );
      } catch (error) {
        toast.error("Failed to load product");
      }
    };
    fetchProduct();
  }, [id]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      if (image) {
        formData.append("imageFile", image);
      }
      formData.append(
          "product",
          new Blob([JSON.stringify(updateProduct)], {
            type: "application/json",
          })
      );
      await axios.put(
          `http://localhost:8080/api/product/${id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Product updated successfully");
      navigate("/admin/products");
    } catch (error) {
      toast.error("Failed to update product");
    }
  };
  return (
    <div className="update-product">
      <h2>Update Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={updateProduct.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={updateProduct.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="brand">Brand</label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={updateProduct.brand}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={updateProduct.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={updateProduct.category}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="releaseDate">Release Date</label>
          <input
            type="date"
            id="releaseDate"
            name="releaseDate"
            value={updateProduct.releaseDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="productAvailable">Available</label>
          <input
            type="checkbox"
            id="productAvailable"
            name="productAvailable"
            checked={updateProduct.productAvailable}
            onChange={(e) =>
                setUpdateProduct((prev) => ({
                  ...prev,
                  productAvailable: e.target.checked,
                }))
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="stockQuantity">Stock Quantity</label>
          <input
            type="number"
            id="stockQuantity"
            name="stockQuantity"
            value={updateProduct.stockQuantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image">Image</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Image preview" />
            </div>
          )}
        </div>
        <button type="submit" className="btn">
          Update Product
        </button>
      </form>
    </div>
  );
};

export default UpdateProduct;
