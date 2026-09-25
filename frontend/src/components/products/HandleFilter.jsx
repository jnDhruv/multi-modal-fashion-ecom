import { useEffect, useMemo, useState } from "react";
import "./HandleFilter.css";

function HandleFilter({ products, onApply }) {
  const [isOpen, setIsOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: [],
    color: [],
    fabric: [],
    season: [],
    usage: [],
    gender: [],
    brand: [],
    minPrice: 0,
    maxPrice: 10000,
  });

  const [draftFilters, setDraftFilters] = useState(filters);

 useEffect(() => {
    if (isOpen) {
        document.documentElement.classList.add("filter-open");
        document.body.classList.add("filter-open");
    } else {
        document.documentElement.classList.remove("filter-open");
        document.body.classList.remove("filter-open");
    }

    return () => {
        document.documentElement.classList.remove("filter-open");
        document.body.classList.remove("filter-open");
    };
}, [isOpen]);

  /*
   * Create filter options dynamically from the products.
   * This means you don't have to manually maintain the options.
   */
  const filterOptions = useMemo(() => {
    const getUnique = (key) => {
      return [
        ...new Set(
          products
            .map((product) => product[key])
            .filter(
              (value) => value !== null && value !== undefined && value !== "",
            ),
        ),
      ].sort();
    };

    return {
      category: getUnique("article_type"),
      color: getUnique("base_colour"),
      fabric: getUnique("fabric"),
      season: getUnique("season"),
      usage: getUnique("usage"),
      gender: getUnique("gender"),
      brand: getUnique("brand_name"),
    };
  }, [products]);

  /*
   * Find the highest product price so the slider
   * adapts to the actual dataset.
   */
  const highestPrice = useMemo(() => {
    if (!products.length) return 10000;

    return Math.ceil(
      Math.max(
        ...products.map((product) => product.discounted_price || product.price),
      ),
    );
  }, [products]);

  useEffect(() => {
    setDraftFilters((prev) => ({
      ...prev,
      maxPrice: highestPrice,
    }));
  }, [highestPrice]);

  /*
   * Open filter panel
   */
  const handleOpen = () => {
    setDraftFilters(filters);
    setIsOpen(true);
  };

  /*
   * Close filter panel
   */
  const handleClose = () => {
    setIsOpen(false);
  };

  /*
   * Checkbox handling
   */
  const handleCheckbox = (filterName, value) => {
    setDraftFilters((prev) => {
      const currentValues = prev[filterName];

      const alreadySelected = currentValues.includes(value);

      return {
        ...prev,
        [filterName]: alreadySelected
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  /*
   * Price slider
   */
  const handleMinPrice = (event) => {
    const value = Number(event.target.value);

    setDraftFilters((prev) => ({
      ...prev,
      minPrice: Math.min(value, prev.maxPrice),
    }));
  };

  const handleMaxPrice = (event) => {
    const value = Number(event.target.value);

    setDraftFilters((prev) => ({
      ...prev,
      maxPrice: Math.max(value, prev.minPrice),
    }));
  };

  /*
   * Clear everything
   */
  const handleClear = () => {
    const clearedFilters = {
      category: [],
      color: [],
      fabric: [],
      season: [],
      usage: [],
      gender: [],
      brand: [],
      minPrice: 0,
      maxPrice: highestPrice,
    };

    setDraftFilters(clearedFilters);
    setFilters(clearedFilters);

    onApply(clearedFilters);
  };

  /*
   * Apply filters
   */
  const handleApply = () => {
    setFilters(draftFilters);
    onApply(draftFilters);
    setIsOpen(false);
  };

  /*
   * Number of currently active filters
   */
  const activeFilterCount =
    filters.category.length +
    filters.color.length +
    filters.fabric.length +
    filters.season.length +
    filters.usage.length +
    filters.gender.length +
    filters.brand.length +
    (filters.minPrice > 0 ? 1 : 0) +
    (filters.maxPrice < highestPrice ? 1 : 0);

  /*
   * Render checkbox group
   */
  const renderOptions = (filterName, options) => {
    return (
      <div className="filter-options">
        {options.map((option) => (
          <label className="filter-option" key={option}>
            <input
              type="checkbox"
              checked={draftFilters[filterName].includes(option)}
              onChange={() => handleCheckbox(filterName, option)}
            />

            <span>{option}</span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* FILTER BUTTON */}
      <button className="filter-button" onClick={handleOpen}>
        <h2>
          Filters
          {activeFilterCount > 0 && (
            <span className="filter-count">{activeFilterCount}</span>
          )}
        </h2>
      </button>

      {/* DARK OVERLAY */}
      {isOpen && <div className="filter-overlay" onClick={handleClose} />}

      {/* SIDE PANEL */}
      <aside className={`filter-panel ${isOpen ? "filter-panel-open" : ""}`}>
        {/* HEADER */}
        <div className="filter-panel-header">
          <h2>Filters</h2>

          <button className="filter-close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        {/* CONTENT */}
        <div className="filter-panel-content">
          {/* CATEGORY */}
          <section className="filter-section">
            <h3>Category</h3>

            {renderOptions("category", filterOptions.category)}
          </section>

          {/* COLOR */}
          <section className="filter-section">
            <h3>Color</h3>

            {renderOptions("color", filterOptions.color)}
          </section>

          {/* PRICE */}
          <section className="filter-section">
            <h3>Price</h3>

            <div className="price-values">
              <span>₹{draftFilters.minPrice}</span>
              <span>₹{draftFilters.maxPrice}</span>
            </div>

            <div className="price-sliders">
              <input
                type="range"
                min="0"
                max={highestPrice}
                value={draftFilters.minPrice}
                onChange={handleMinPrice}
              />

              <input
                type="range"
                min="0"
                max={highestPrice}
                value={draftFilters.maxPrice}
                onChange={handleMaxPrice}
              />
            </div>
          </section>

          {/* FABRIC */}
          {filterOptions.fabric.length > 0 && (
            <section className="filter-section">
              <h3>Fabric</h3>

              {renderOptions("fabric", filterOptions.fabric)}
            </section>
          )}

          {/* SEASON */}
          <section className="filter-section">
            <h3>Season</h3>

            {renderOptions("season", filterOptions.season)}
          </section>

          {/* OCCASION */}
          <section className="filter-section">
            <h3>Usage</h3>

            {renderOptions("usage", filterOptions.usage)}
          </section>

          {/* GENDER */}
          <section className="filter-section">
            <h3>Gender</h3>

            {renderOptions("gender", filterOptions.gender)}
          </section>

          {/* BRAND */}
          <section className="filter-section">
            <h3>Brand</h3>

            {renderOptions("brand", filterOptions.brand)}
          </section>
        </div>

        {/* FOOTER */}
        <div className="filter-panel-footer">
          <button className="clear-filter-button" onClick={handleClear}>
            Clear All
          </button>

          <button className="apply-filter-button" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  );
}

export default HandleFilter;
