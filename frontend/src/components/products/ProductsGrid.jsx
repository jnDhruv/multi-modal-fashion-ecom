import "./ProductsGrid.css";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";

function ProductsGrid({ data, filteredProducts, total, loading }) {
  return (
    <div className="products-grid">
      {loading ? (
        <ProductCardSkeleton count={8} />
      ) : (
        <ProductCard data={data} filteredProducts={filteredProducts} total={total} />
      )}
    </div>
  );
}

export default ProductsGrid;