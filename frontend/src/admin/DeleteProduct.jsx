import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const DeleteProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const deleteProduct = async () => {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/product/${id}`
        );
        toast.success("Product deleted successfully");
        navigate("/admin/products");
      } catch (error) {
        toast.error("Failed to delete product");
        navigate("/admin/products");
      }
    };
    deleteProduct();
  }, [id, navigate]);

  return (
    <div className="delete-product">
      <h2>Deleting product...</h2>
    </div>
  );
};

export default DeleteProduct;
