import React from 'react'
import ProductCard from './ProductCard.jsx'
import './ProductGrid.css'


function ProductGrid({ products, query, searchMode }) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="product-grid-section" id="results" aria-label="Search Results">

      <div className="product-grid__header">
        <div className="product-grid__header-left">
          <h2 className="product-grid__title">Recommended Products</h2>
          {query && (
            <p className="product-grid__query">
              Results for: <span className="product-grid__query-text">{query}</span>
              {searchMode === 'image' && (
                <span className="product-grid__mode-badge">📷 Image Search</span>
              )}
            </p>
          )}
        </div>
        <div className="product-grid__stats">
          <span className="product-grid__count">{products.length}</span>
          <span className="product-grid__count-label">products found</span>
        </div>
      </div>

      <div className="product-grid__ai-legend">
        <span className="product-grid__ai-legend-icon">✨</span>
        <span>Each product includes an AI Style Note explaining why it matches your search</span>
      </div>

      <div className="product-grid__grid" role="list">
        {products.map((product, index) => (
          <div key={product.id} role="listitem">
            <ProductCard
              product={product}
              index={index}
            />
          </div>
        ))}
      </div>

    </section>
  )
}

export default ProductGrid
