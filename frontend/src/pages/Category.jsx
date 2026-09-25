import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import "./Category.css";

const CATEGORY_QUERIES = {
  Boots: "boots",
  Corset: "corset",
  Skirt: "skirts",
  Bag: "handbag",
  Accessories: "fashion accessories",
};

function Category() {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const category =
    categoryName?.charAt(0).toUpperCase() +
    categoryName?.slice(1).toLowerCase();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const query = CATEGORY_QUERIES[category] || category;

        const response = await fetch("https://ss99dh14-8000.inc1.devtunnels.ms/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query_text: query,
            top_k: 30,
            // notes_top_k: 0,
            apply_rerank: false,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        console.log("Backend response:", data);

        setProducts(data.products || []);
        const countResponse = await fetch(
  `http://127.0.0.1:8000/category-count/${encodeURIComponent(category)}`
);

if (countResponse.ok) {
  const countData = await countResponse.json();

  console.log("Category count:", countData);

  setTotalCount(countData.count);
}
      } catch (err) {
        console.error(err);
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  return (
    <div className="category-page">

      {/* ================= NAVBAR ================= */}

      <header className="category-header">
        <div className="header-inner">

          <div
            className="brand-logo"
            onClick={() => navigate("/")}
          >
            ATTIRELY
          </div>

          <div className="header-icons">

            {/* SEARCH */}
            <button className="nav-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6.5" />
                <line x1="16" y1="16" x2="21" y2="21" />
              </svg>
            </button>

            {/* HOME */}
            <button
              className="nav-icon"
              onClick={() => navigate("/")}
            >
              <svg viewBox="0 0 24 24">
                <path d="M3 11.5L12 4l9 7.5" />
                <path d="M5.5 10.5V20h13v-9.5" />
                <path d="M9.5 20v-5.5h5V20" />
              </svg>
            </button>

            {/* BAG */}
            <button className="nav-icon">
              <svg viewBox="0 0 24 24">
                <path d="M6 8h12l1 12H5L6 8z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
            </button>

          </div>
        </div>
      </header>


      {/* ================= CATEGORY HEADER ================= */}

      <section className="category-top">

        <div className="category-info">

          <h1>
            {category} collection
          </h1>

          <p>
            {loading
              ? "Loading..."
              : `${totalCount} items found`}
          </p>

        </div>


        <button className="filter-button">
          <span>Filters</span>
          <span className="filter-arrow">›</span>
        </button>

      </section>


      <div className="category-divider"></div>


      {/* ================= PRODUCTS ================= */}

      <main className="product-section">

        {loading && (
          <div className="loading">
            Loading products...
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="no-products">
            No matching products found.
          </div>
        )}


        <div className="product-grid">

          {products.map((product) => (

            <article
              className="product-card"
              key={product.id}
            >

              {/* IMAGE FROM DATASET */}
              <div className="product-image-wrapper">

                <img
                  src={product.image_url}
                  alt={product.product_display_name}
                  className="product-image"
                />

              </div>


              {/* PRODUCT INFORMATION */}

              <div className="product-info">

                <p className="product-brand">
                  {product.brand_name || "Brand"}
                </p>

                <p className="product-name">
                  {product.product_display_name || "Product"}
                </p>

                <p className="product-price">
                  INR{" "}
                  {product.discounted_price ||
                    product.price ||
                    "—"}
                </p>

              </div>


              {/* ACTIONS */}

              <div className="product-actions">

                <button aria-label="Wishlist">
                  ♡
                </button>

                <button aria-label="Add to bag">
                  ♧
                </button>

              </div>

            </article>

          ))}

        </div>

      </main>

    </div>
  );
}

export default Category;