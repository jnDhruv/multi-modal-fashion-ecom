import "./ProductsGrid.css";
import ProductCard from "./ProductCard";


function ProductsGrid({data, filteredProducts, total}){
    
    
    return (
        <div className="products-grid">
            <ProductCard data={data} filteredProducts={filteredProducts} total={total}/>
        </div>
    )
}

export default ProductsGrid;