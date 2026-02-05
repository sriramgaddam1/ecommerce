import React, { useState } from "react";
import axios from "axios";
import "../components/AddProduct.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    productAvailable: false,
  });
  const [image, setImage] = useState(null);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };
const submitHandler = (event) => {
  event.preventDefault();

  const formData = new FormData();
  formData.append("imageFile", image);
  formData.append(
    "product",
    new Blob([JSON.stringify(product)], {
      type: "application/json",
    })
  );

  axios
    .post(
      `${import.meta.env.VITE_API_URL}/api/product`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    .then(() => {
      toast.success("Product added successfully");
      navigate("/admin/products");
    })
    .catch(() => {
      toast.error("Error adding product");
    });
};

  return (
    <div className="container">
      <div className="center-container">
        <form className="row g-3 pt-5" onSubmit={submitHandler}>
          {/* ...form fields... */}
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
