import "./ProductCard.css";

import { useState, useRef } from "react";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

import "./ProductCard.css";

gsap.registerPlugin(TextPlugin);

function ProductCard({ data, filteredProducts, total }) {
  const products = data.products;
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const styleNoteRefs = useRef([]);

  const handleMouseEnter = (index, styleNote) => {
    const element = styleNoteRefs.current[index];

    if (!element) return;

    // Stop any previous animation
    gsap.killTweensOf(element);

    // Clear text first
    gsap.set(element, {
      text: "",
    });

    // Typewriter animation
    gsap.to(element, {
      duration: styleNote.length * 0.02,
      text: styleNote,
      ease: "none",
    });
  };

  const handleMouseLeave = (index) => {
    const element = styleNoteRefs.current[index];

    if (!element) return;

    // Stop typing
    gsap.killTweensOf(element);

    // Clear text
    gsap.to(element, {
      duration: 0.15,
      text: "",
      ease: "none",
    });
  };

  return (
    <>
      {products.map((product, index) => {
        return (
          <div
            className={`product-card ${index == 0 && hoveredIndex != null && hoveredIndex !== 0 ? `first-card-normal`: ``}`}
            key={index}
            onMouseEnter={() =>{ 
                handleMouseEnter(index, product.style_note);
                setHoveredIndex(index);
            }}
            onMouseLeave={() => {
                handleMouseLeave(index);
                setHoveredIndex(0)
            }}
          >
            <div className="product-image">
              <img src={product.image_url} alt="" />
            </div>

            <div className="about-product">
              <div className="brand-text">
                <h2>{product.brand_name}</h2>
              </div>

              <p className="product-name">{product.product_display_name}</p>

              <p className="product-price">
                <span className="actual-price">INR {product.price}</span>

                <span className="discounted-price">
                  INR {product.discounted_price}
                </span>
              </p>
            </div>

            <div className="style-note-container">
              <p
                className="style-note"
                ref={(el) => {
                  styleNoteRefs.current[index] = el;
                }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}

export default ProductCard;
