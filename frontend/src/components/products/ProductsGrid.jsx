import "./ProductsGrid.css";
import ProductCard from "./ProductCard";


function ProductsGrid({data}){
    
    
    return (
        <div className="products-grid">
            <ProductCard data={data}/>
        </div>
    )
}

export default ProductsGrid;