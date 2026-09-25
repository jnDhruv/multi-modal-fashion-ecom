import Header from "../components/products/Header.jsx";
import ResultHeader from "../components/products/ResultHeader.jsx";
import ProductsGrid from "../components/products/ProductsGrid.jsx";
import ProductsError from "../components/products/ProductsError.jsx";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";

function Products() {
  const [searchParams] = useSearchParams();

  const userQuery =
    searchParams.get("query") || "vintage cheetah print shawl";

  const [data, setData] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post("https://ss99dh14-8000.inc1.devtunnels.ms/search", {
        query_text: userQuery,
        top_k: 30,
        notes_top_k: 8,
      });

      setData(response.data);
      setFilteredProducts(response.data.products);
    } catch (err) {
      console.error("Search failed:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

      const productPrice = product.discounted_price ?? product.price;
      const priceMatch =
        productPrice >= filters.minPrice && productPrice <= filters.maxPrice;

      return (
        categoryMatch && colorMatch && fabricMatch && seasonMatch &&
        usageMatch && genderMatch && brandMatch && priceMatch
      );
    });

    setFilteredProducts(filtered);
  };

  return (
    <>
      <Header />

      {error ? (
        <ProductsError userQuery={userQuery} onRetry={fetchProducts} />
      ) : (
        <>
          {!loading && data && (
            <ResultHeader
              total={filteredProducts.length}
              products={data.products}
              userQuery={data.query}
              onApplyFilters={handleApplyFilters}
            />
          )}

          <ProductsGrid
            loading={loading}
            data={
              loading
                ? null
                : {
                    ...data,
                    products: filteredProducts,
                    total: filteredProducts.length,
                  }
            }
          />
        </>
      )}
    </>
  );
}

export default Products;