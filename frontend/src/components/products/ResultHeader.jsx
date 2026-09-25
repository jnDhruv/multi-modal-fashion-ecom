import filterArrow from "../../assets/icons/filter-arrow.svg";
import HandleFilter from "./HandleFilter";
import "./ResultHeader.css";

function ResultHeader({
  total,
  userQuery,
  products,
  onApplyFilters,
}) {

  return (
    <div className="result-header-container">
      <div className="result-header-text">
        <h3>
          Showing results for{" "}
          <span className="span-red">"{userQuery}"</span>
        </h3>
        <p className="result-count">{total} items found</p>
      </div>

      <div className="result-header-filter">
        <HandleFilter
          products={products}
          onApply={onApplyFilters}
        />
        <button className="arrow-button">
            <img src={filterArrow} alt="filter-arrow" />
        </button>
      </div>
    </div>
  );
}

export default ResultHeader;
