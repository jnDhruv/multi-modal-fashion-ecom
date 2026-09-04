import filterArrow from "../../assets/icons/filter-arrow.svg";
import "./ResultHeader.css";

function ResultHeader({ products }) {
  console.log(products);
  return (
    <div className="result-header-container">
      <div className="result-header-text">
        <h3>
          Showing results for{" "}
          <span className="span-red">"{products.userQuery}"</span>
        </h3>
        <p className="result-count">{products.numberOfItems} items found</p>
      </div>

      <div className="result-header-filter">
        <button className="filter-button">
          <h2>Filters</h2>
        </button>
        <button className="arrow-button">
            <img src={filterArrow} alt="filter-arrow" />
        </button>
      </div>
    </div>
  );
}

export default ResultHeader;
