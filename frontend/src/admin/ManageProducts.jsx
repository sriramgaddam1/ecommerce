import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:8080/api/products").then((resp) => {
      setProducts(resp.data || []);
    });
  }, []);
  return (
    <div className="manage-products">
      <h2>Manage Products</h2>
      <Link to="/admin/products/add" className="add-product-btn">Add Product</Link>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.brand}</td>
              <td>{p.category}</td>
              <td>₹{p.price}</td>
              <td>{p.stockQuantity}</td>
              <td>
                <Link to={`/admin/products/update/${p.id}`}>Edit</Link> |{' '}
                <Link to={`/admin/products/delete/${p.id}`}>Delete</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ManageProducts;
