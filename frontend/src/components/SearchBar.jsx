import React, { useState, useRef } from "react";
import "./SearchBar.css";


function SearchBar({ query, onQueryChange, onSearch, loading, searchMode }) {
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const suggestions = [
    "black oversized hoodie for winter",
    "white cotton summer dress",
    "slim fit denim jacket men",
    "casual floral boho top women",
    "grey streetwear jogger pants",
    "navy blue sporty jacket unisex",
    "red flannel shirt autumn casual",
    "beige linen summer shirt men",
  ];

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      onSearch();
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onQueryChange(suggestion);
    setShowSuggestions(false);
    setTimeout(() => onSearch(suggestion), 50);
  };

  const filteredSuggestions =
    query.length > 0
      ? suggestions.filter(
          (s) => s.toLowerCase().includes(query.toLowerCase()) && s !== query,
        )
      : suggestions.slice(0, 5);

  return (
    <div className="searchbar">
      {searchMode === "image" && (
        <div className="searchbar__mode-badge">
          <span>📷</span>
          <span>Image Search Active</span>
        </div>
      )}

      <div
        className={`searchbar__container ${focused ? "searchbar__container--focused" : ""}`}
      >
        <div className="searchbar__icon" aria-hidden="true">
          🔍
        </div>

        <input
          ref={inputRef}
          type="text"
          className="searchbar__input"
          placeholder="Search for clothes... e.g. 'black oversized hoodie for winter'"
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setShowSuggestions(e.target.value.length >= 0);
          }}
          onFocus={() => {
            setFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => {
            setFocused(false);
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          onKeyDown={handleKeyDown}
          disabled={loading}
          aria-label="Search for fashion products"
          aria-expanded={showSuggestions}
          autoComplete="off"
        />

        {query && !loading && (
          <button
            className="searchbar__clear"
            onClick={() => {
              onQueryChange("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}

        <button
          className="searchbar__btn"
          onClick={() => {
            onSearch();
            setShowSuggestions(false);
          }}
          disabled={loading || (!query.trim() && searchMode !== "image")}
          aria-label="Search"
        >
          {loading ? (
            <span className="searchbar__spinner" aria-hidden="true" />
          ) : (
            <span>Search</span>
          )}
        </button>
      </div>

      {showSuggestions && !loading && (
        <div className="searchbar__suggestions" role="listbox">
          {filteredSuggestions.length > 0 && (
            <>
              <div className="searchbar__suggestions-label">
                {query.length > 0 ? "Suggestions" : "Try these searches"}
              </div>
              {filteredSuggestions.map((s, i) => (
                <button
                  key={i}
                  className="searchbar__suggestion-item"
                  onMouseDown={() => handleSuggestionClick(s)}
                  role="option"
                >
                  <span className="searchbar__suggestion-icon">🔍</span>
                  <span>{s}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {!focused && !query && (
        <p className="searchbar__hint">
          Try: &ldquo;black oversized hoodie for winter&rdquo; or upload an
          image below
        </p>
      )}
    </div>
  );
}

export default SearchBar;
