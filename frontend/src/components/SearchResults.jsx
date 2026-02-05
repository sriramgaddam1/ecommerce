import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Home.css";

/* ✅ BACKEND URL */
const BASE_URL = import.meta.env.VITE_API_URL;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("q");

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        /* 🔹 SEARCH API */
        const res = await axios.get(
          `${BASE_URL}/api/products/search?keyword=${keyword}`
        );

        /* 🔹 FETCH IMAGES */
        const updated = await Promise.all(
          res.data.map(async (product) => {
            try {
              const imgRes = await axios.get(
                `${BASE_URL}/api/product/${product.id}/image`,
                { responseType: "blob" }
              );

              return {
                ...product,
                imageUrl: URL.createObjectURL(imgRes.data),
              };
            } catch {
              return { ...product, imageUrl: "" };
            }
          })
        );

        setProducts(updated);
        setIsError(false);
      } catch (error) {
        console.error("Search error:", error);
        setIsError(true);
        toast.error("Failed to search products ❌");
      } finally {
        setIsLoading(false);
      }
    };

    if (keyword) {
      fetchSearchResults();
    }
  }, [keyword]);

  if (isLoading) {
    return (
      <h2 className="text-center" style={{ padding: "18rem" }}>
        Loading search results...
      </h2>
    );
  }

  if (isError) {
    return (
      <h2 className="text-center" style={{ padding: "18rem" }}>
        Error loading search results
      </h2>
    );
  }

  return (
    <div
      className="grid"
      style={{
        marginTop: "64px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        padding: "20px",
      }}
    >
      <h2 style={{ gridColumn: "1 / -1" }}>
        Search Results for "{keyword}"
      </h2>

      {products.length === 0 ? (
        <h3 style={{ gridColumn: "1 / -1" }} className="text-center">
          No products found matching "{keyword}"
        </h3>
      ) : (
        products.map((product) => (
          <div
            className="card mb-3"
            key={product.id}
            style={{
              width: "280px",
              borderRadius: "10px",
              backgroundColor: product.productAvailable ? "#fff" : "#ccc",
            }}
          >
            <a
              href={`/product/${product.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            </a>

            <div className="card-body" style={{ padding: "10px" }}>
              <h5>{product.name.toUpperCase()}</h5>
              <i style={{ fontSize: "0.8rem" }}>~ {product.brand}</i>
              <hr className="hr-line" />
              <p style={{ fontSize: "0.85rem", color: "#666" }}>
                {product.description}
              </p>
              <h5>₹{product.price}</h5>

              <button
                className="btn-hover color-9"
                style={{ marginTop: "10px" }}
                disabled={!product.productAvailable}
              >
                {product.productAvailable ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SearchResults;
