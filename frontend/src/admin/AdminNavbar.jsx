import React from "react";
import { Link } from "react-router-dom";
import "./AdminNavbar.css";

const AdminNavbar = () => (
  <nav className="admin-navbar">
    <Link to="/admin">Dashboard</Link>
    <Link to="/admin/orders">Orders</Link>
    <Link to="/admin/users">Users</Link>
    <Link to="/admin/products">Products</Link>
    <Link to="/admin/products/add">Add Product</Link>
  </nav>
);

export default AdminNavbar;
