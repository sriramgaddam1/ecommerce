// import React, { useContext, useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";
// import AppContext from "../Context/Context";
// import unplugged from "../assets/unplugged.png";
// import { toast } from "react-toastify";
// import "./Home.css";

// const Home = ({ selectedCategory }) => {
//     const { data, isError, isLoading, addToCart, refreshData } = useContext(AppContext);
//     const [products, setProducts] = useState([]);

//     useEffect(() => {
//         refreshData();
//     }, []);

//     useEffect(() => {
//         if (!data || data.length === 0) {
//             setProducts([]);
//             return;
//         }

//         const fetchImages = async () => {
//             const updated = await Promise.all(
//                 data.map(async (product) => {
//                     try {
//                         const res = await axios.get(
//                             `http://localhost:8080/api/product/${product.id}/image`,
//                             { responseType: "blob" }
//                         );
//                         return {
//                             ...product,
//                             imageUrl: URL.createObjectURL(res.data),
//                         };
//                     } catch {
//                         return { ...product, imageUrl: "" };
//                     }
//                 })
//             );
//             setProducts(updated);
//         };

//         fetchImages();
//     }, [data]);

//     const filteredProducts = selectedCategory
//         ? products.filter((p) => p.category === selectedCategory)
//         : products;

//     if (isError) {
//         return (
//             <h2 className="text-center" style={{ padding: "18rem" }}>
//                 <img src={unplugged} alt="Error" width="100" height="100" />
//             </h2>
//         );
//     }

//     if (isLoading) {
//         return (
//             <h2 className="text-center" style={{ padding: "18rem" }}>
//                 Loading products...
//             </h2>
//         );
//     }

//     const handleAddToCart = (product) => {
//         if (!product.productAvailable) {
//             toast.warning("Product is out of stock 🚫");
//             return;
//         }
//         addToCart(product);
//         toast.success(`${product.name} added to cart 🛒 `);
//     };

//     return (
//         <div
//             className="grid"
//             style={{
//                 marginTop: "64px",
//                 display: "grid",
//                 gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
//                 gap: "20px",
//                 padding: "20px",
//             }}
//         >
//             {filteredProducts.length === 0 ? (
//                 <h2 className="text-center">No Products Available</h2>
//             ) : (
//                 filteredProducts.map((product) => (
//                     <div
//                         className="card mb-3"
//                         key={product.id}
//                         style={{
//                             width: "280px",
//                             borderRadius: "10px",
//                             backgroundColor: product.productAvailable ? "#fff" : "#ccc",
//                         }}
//                     >
//                         {/* ✅ ONLY IMAGE + TEXT INSIDE LINK */}
//                         <Link
//                             to={`/product/${product.id}`}
//                             style={{ textDecoration: "none", color: "inherit" }}
//                         >
//                             <img
//                                 src={product.imageUrl}
//                                 alt={product.name}
//                                 style={{
//                                     width: "100%",
//                                     height: "150px",
//                                     objectFit: "cover",
//                                     borderRadius: "10px",
//                                 }}
//                             />
//                         </Link>

//                         {/* ✅ BUTTON OUTSIDE LINK */}
//                         <div className="card-body" style={{ padding: "10px" }}>
//                             <h5>{product.name.toUpperCase()}</h5>
//                             <i style={{ fontSize: "0.8rem" }}>~ {product.brand}</i>
//                             <hr className="hr-line" />
//                             <h5>₹{product.price}</h5>

//                             <button
//                                 className="btn-hover color-9"
//                                 style={{ marginTop: "10px" }}
//                                 disabled={!product.productAvailable}
//                                 onClick={() => handleAddToCart(product)}
//                             >
//                                 {product.productAvailable ? "Add to Cart" : "Out of Stock"}
//                             </button>
//                         </div>
//                     </div>
//                 ))
//             )}
//         </div>
//     );
// };

// export default Home;
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import AppContext from "../context/Context";
import unplugged from "../assets/unplugged.png";
import "./Home.css";

const Home = ({ selectedCategory }) => {
    const navigate = useNavigate();

    const {
        data,
        isError,
        isLoading,
        addToCart,
        isAuthenticated,
    } = useContext(AppContext);

    const [products, setProducts] = useState([]);

    /* --------------------------------
       FETCH IMAGES ONLY
    -------------------------------- */
    useEffect(() => {
        if (!data || data.length === 0) {
            setProducts([]);
            return;
        }

        const fetchImages = async () => {
            const updated = await Promise.all(
                data.map(async (product) => {
                    try {
                        const res = await axios.get(
                            `http://localhost:8080/api/product/${product.id}/image`,
                            { responseType: "blob" }
                        );
                        return {
                            ...product,
                            imageUrl: URL.createObjectURL(res.data),
                        };
                    } catch {
                        return { ...product, imageUrl: "" };
                    }
                })
            );
            setProducts(updated);
        };

        fetchImages();
    }, [data]);

    const filteredProducts = selectedCategory
        ? products.filter((p) => p.category === selectedCategory)
        : products;

    if (isError) {
        return (
            <h2 className="text-center" style={{ padding: "18rem" }}>
                <img src={unplugged} alt="Error" width="100" height="100" />
            </h2>
        );
    }

    const handleAddToCart = (product) => {
        if (!isAuthenticated) {
            toast.warning("Please login to add items to cart 🔐");
            navigate("/login");
            return;
        }

        if (!product.productAvailable) {
            toast.warning("Product is out of stock 🚫");
            return;
        }

        addToCart(product);
        toast.success(`${product.name} added to cart 🛒`);
    };

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
            {filteredProducts.length === 0 ? (
                <h2 className="text-center">No Products Available</h2>
            ) : (
                filteredProducts.map((product) => (
                    <div
                        className="card mb-3"
                        key={product.id}
                        style={{
                            width: "280px",
                            borderRadius: "10px",
                            backgroundColor: product.productAvailable
                                ? "#fff"
                                : "#ccc",
                        }}
                    >
                        <Link
                            to={`/product/${product.id}`}
                            style={{
                                textDecoration: "none",
                                color: "inherit",
                            }}
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
                        </Link>

                        <div className="card-body" style={{ padding: "10px" }}>
                            <h5>{product.name.toUpperCase()}</h5>
                            <i style={{ fontSize: "0.8rem" }}>
                                ~ {product.brand}
                            </i>
                            <hr className="hr-line" />
                            <h5>₹{product.price}</h5>

                            <button
                                className="btn-hover color-9"
                                style={{ marginTop: "10px" }}
                                disabled={!product.productAvailable}
                                onClick={() => handleAddToCart(product)}
                            >
                                {product.productAvailable
                                    ? "Add to Cart"
                                    : "Out of Stock"}
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Home;
