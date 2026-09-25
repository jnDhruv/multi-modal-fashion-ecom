import Header from "../components/products/Header.jsx";
import ResultHeader from "../components/products/ResultHeader.jsx";
import ProductsGrid from "../components/products/ProductsGrid.jsx";
import axios from "axios";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";

function Products() {
  const [searchParams] = useSearchParams();

  const userQuery =
    searchParams.get("query") || "vintage cheetah print shawl";

  const [data, setData] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products whenever search query changes
  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post("https://ss99dh14-8000.inc1.devtunnels.ms/search", {
          query_text: userQuery,
          top_k: 30,
          notes_top_k: 8,
        });

        setData(response.data);

        // Reset filters whenever a new search is performed
        setFilteredProducts(response.data.products);
      } catch (error) {
        console.error("Search failed:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [userQuery]);

  // Apply filters
  const handleApplyFilters = (filters) => {
    if (!data) return;

    const filtered = data.products.filter((product) => {
      const categoryMatch =
        filters.category.length === 0 ||
        filters.category.includes(product.article_type);

      const colorMatch =
        filters.color.length === 0 ||
        filters.color.includes(product.base_colour);

      const fabricMatch =
        filters.fabric.length === 0 ||
        filters.fabric.includes(product.fabric);

      const seasonMatch =
        filters.season.length === 0 ||
        filters.season.includes(product.season);

      const usageMatch =
        filters.usage.length === 0 ||
        filters.usage.includes(product.usage);

      const genderMatch =
        filters.gender.length === 0 ||
        filters.gender.includes(product.gender);

      const brandMatch =
        filters.brand.length === 0 ||
        filters.brand.includes(product.brand_name);

      const productPrice =
        product.discounted_price ?? product.price;

      const priceMatch =
        productPrice >= filters.minPrice &&
        productPrice <= filters.maxPrice;

      return (
        categoryMatch &&
        colorMatch &&
        fabricMatch &&
        seasonMatch &&
        usageMatch &&
        genderMatch &&
        brandMatch &&
        priceMatch
      );
    });

    setFilteredProducts(filtered);
  };

  // Loading state
  if (loading) {
    return (
      <div className="products-loading">
        <h2>Finding your style...</h2>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="products-error">
        <h2>Something went wrong.</h2>
        <p>We couldn't find products for "{userQuery}".</p>
      </div>
    );
  }

  // Safety check
  if (!data) {
    return null;
  }

  return (
    <>
      <Header />

      <ResultHeader
        total={filteredProducts.length}
        products={data.products}
        userQuery={data.query}
        onApplyFilters={handleApplyFilters}
      />

      <ProductsGrid
        data={{
          ...data,
          products: filteredProducts,
          total: filteredProducts.length,
        }}
      />
    </>
  );
}

export default Products;