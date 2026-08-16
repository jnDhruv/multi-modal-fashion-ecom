import React, { useState } from 'react'
import StyleNote from './StyleNote.jsx'
import './ProductCard.css'

/**
 * ProductCard Component
 * ──────────────────────
 * Displays a single fashion product with:
 * - Product image with hover effects
 * - Product metadata (title, category, color, fit, etc.)
 * - Price in Indian Rupees
 * - AI Style Note from Gemini
 *
 * This is the main output of Student D's full-stack pipeline.
 */
function ProductCard({ product, index = 0 }) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  // Format price in Indian Rupees
  const formatPrice = (price) => {
    if (price === null || price === undefined) return null
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Category badge is a single flat ink color across every category —
  // kept as a function (rather than a constant) so per-category styling
  // can be reintroduced later without touching the render logic below.
  const getCategoryColor = () => '#0a0a0a'

  // Placeholder image if the original fails
  const fallbackImage = `https://images.pexels.com/photos/2108816/pexels-photo-2108816.png?auto=compress&cs=tinysrgb&fit=crop&h=600&w=400`

  // Stagger animation delay based on index
  const delayClass = `delay-${Math.min(index + 1, 8)}`

  const categoryBg = getCategoryColor(product.category)

  return (
    <article
      className={`product-card animate-fade-in-up ${delayClass}`}
      aria-label={`Product: ${product.title}`}
    >
      {/* ─── Image Section ─────────────────────────────────── */}
      <div className="product-card__image-wrap">
        {/* Skeleton while loading */}
        {!imgLoaded && !imgError && (
          <div className="product-card__image-skeleton skeleton" aria-hidden="true" />
        )}

        <img
          src={imgError ? fallbackImage : (product.image_url || fallbackImage)}
          alt={product.title}
          className={`product-card__image ${imgLoaded ? 'product-card__image--loaded' : ''}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgError(true); setImgLoaded(true) }}
          loading="lazy"
        />

        {/* Overlay on hover */}
        <div className="product-card__image-overlay" aria-hidden="true" />

        {/* Category Badge on image */}
        {product.category && (
          <span
            className="product-card__category-badge"
            style={{ '--badge-color': categoryBg }}
          >
            {product.category}
          </span>
        )}

        {/* Similarity Score Badge */}
        {product.similarity_score != null && (
          <span className="product-card__score-badge">
            {Math.round(product.similarity_score * 100)}% match
          </span>
        )}
      </div>

      {/* ─── Info Section ──────────────────────────────────── */}
      <div className="product-card__info">
        {/* Title */}
        <h3 className="product-card__title">{product.title}</h3>

        {/* Metadata Tags */}
        <div className="product-card__tags" aria-label="Product attributes">
          {product.color && (
            <span className="product-card__tag">
              <span className="product-card__tag-dot" />
              {product.color}
            </span>
          )}
          {product.fit && (
            <span className="product-card__tag">{product.fit}</span>
          )}
          {product.material && (
            <span className="product-card__tag">{product.material}</span>
          )}
          {product.season && (
            <span className="product-card__tag">{product.season}</span>
          )}
          {product.gender && (
            <span className="product-card__tag product-card__tag--gender">
              {product.gender}
            </span>
          )}
        </div>

        {/* Style Tag (Casual/Formal/Streetwear etc) */}
        {product.style && (
          <div className="product-card__style">
            <span className="product-card__style-label">Style:</span>
            <span className="product-card__style-value">{product.style}</span>
          </div>
        )}

        {/* Price */}
        {product.price != null && (
          <div className="product-card__price">
            <span className="product-card__price-amount">
              {formatPrice(product.price)}
            </span>
          </div>
        )}

        {/* ─── AI Style Note ─────────────────────────────── */}
        <StyleNote
          note={product.style_note}
          available={product.ai_note_available !== false}
        />
      </div>
    </article>
  )
}

export default ProductCard
