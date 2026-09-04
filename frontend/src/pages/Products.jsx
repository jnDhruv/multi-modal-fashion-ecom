
import Header from '../components/products/Header.jsx';
import ResultHeader from '../components/products/ResultHeader.jsx';
function Products() {
  const products = {
    userQuery: "default",
    numberOfItems: 0,
  }; // Replace with the actual user query if available
  return (
    <>
        <Header />
        <ResultHeader products={products} />  
    </>
  );
}

export default Products;