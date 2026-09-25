import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

import "./StartSearching.css";

import leftHandPurses from "../../assets/images/left-hand-purses.png";
import rightHandPurses from "../../assets/images/right-hand-purses.png";

gsap.registerPlugin(TextPlugin);

function StartSearching() {
  const navigate = useNavigate();

  const [queryText, setQueryText] = useState("");
  const [status, setStatus] = useState("idle");

  const [activeTab, setActiveTab] = useState("text");

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const typingTextRef = useRef(null);
  const cursorRef = useRef(null);

  // Typewriter animation
  useEffect(() => {
    const words = ["STYLE", "VIBE", "AESTHETICS", "LOOK", "ATTIRE"];

    const text = typingTextRef.current;
    const cursor = cursorRef.current;

    const tl = gsap.timeline({
      repeat: -1,
    });

    words.forEach((word) => {
      tl.to(text, {
        duration: word.length * 0.15,
        text: word,
        ease: "none",
      })

        .to(
          {},
          {
            duration: 1,
          },
        )

        .to(text, {
          duration: word.length * 0.1,
          text: "",
          ease: "none",
        })

        .to(
          {},
          {
            duration: 0.3,
          },
        );
    });

    gsap.to(cursor, {
      opacity: 0,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: "steps(1)",
    });

    return () => {
      tl.kill();
      gsap.killTweensOf(cursor);
    };
  }, []);

  // Tab switching

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);

    // Clear previous search state
    setStatus("idle");
  };

  // Image selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // Remove image
  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Search
  const handleSearch = async (event) => {
    event?.preventDefault();

    if (activeTab === "text") {
      const query = queryText.trim();

      if (!query) return;

      setStatus("loading");

      navigate(`/products?query=${encodeURIComponent(query)}`);
    }

    if (activeTab === "image") {
      if (!selectedImage) return;

      console.log("Image search:", selectedImage);

      // API call will go here
      setStatus("loading");

      // Temporary
      setTimeout(() => {
        setStatus("idle");
      }, 1500);
    }
  };

  return (
    <div id="search" className="search-section">
      <img src={leftHandPurses} alt="Left Hand Purses" />

      <img src={rightHandPurses} alt="Right Hand Purses" />

      <div className="search-section__heading">
        <h1>
          <span className="search-section__white">
            DEFI
            <span className="search-section__dark-blue">N</span>
            <span className="search-section__red">E</span>
          </span>

          <span className="search-section__black">YOUR</span>

          <span className="search-section__black search-section__typing-word">
            <span ref={typingTextRef}></span>

            <span ref={cursorRef} className="search-section__typing-cursor" />
          </span>
        </h1>
      </div>

      <div className="search-section__panel">
        <h1 className="search-section__title">Search Products</h1>

        <p className="search-section__subtitle">
          Describe what you're looking for — we'll find the closest matches and
          explain why.
        </p>

        {/* Tabs */}

        <div className="search-section__tabs" role="tablist">
          <button
            type="button"
            className={`search-section__tab ${
              activeTab === "text" ? "search-section__tab--active" : ""
            }`}
            onClick={() => handleTabSwitch("text")}
            role="tab"
            aria-selected={activeTab === "text"}
          >
            <span>Text Search</span>
          </button>

          <button
            type="button"
            className={`search-section__tab ${
              activeTab === "image" ? "search-section__tab--active" : ""
            }`}
            onClick={() => handleTabSwitch("image")}
            role="tab"
            aria-selected={activeTab === "image"}
          >
            <span>Image Search</span>
          </button>
        </div>

        {/* TEXT SEARCH */}

        {activeTab === "text" && (
          <div className="search-section__tab-panel" role="tabpanel">
            <form className="search-section__form" onSubmit={handleSearch}>
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="e.g. black leather jacket"
                className="search-section__input"
                aria-label="Search products"
              />

              <button
                type="submit"
                className="search-section__submit"
                disabled={status === "loading" || !queryText.trim()}
              >
                {status === "loading" ? "Searching..." : "Search"}
              </button>
            </form>
          </div>
        )}

        {/* IMAGE SEARCH */}

        {activeTab === "image" && (
          <div className="search-section__tab-panel" role="tabpanel">
            <div className="search-section__image-upload">
              {!selectedImage ? (
                <label
                  htmlFor="image-upload-input"
                  className="search-section__image-upload-box"
                >
                  <span className="search-section__upload-icon">📷</span>

                  <span>Upload a clothing image</span>

                  <small>PNG, JPG or JPEG</small>
                </label>
              ) : (
                <div className="search-section__image-preview-container">
                  <img
                    src={imagePreview}
                    alt="Selected clothing"
                    className="search-section__image-preview"
                  />

                  <button
                    type="button"
                    className="search-section__remove-image"
                    onClick={handleImageRemove}
                  >
                    ×
                  </button>
                </div>
              )}

              <input
                id="image-upload-input"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleImageSelect}
                hidden
              />
            </div>

            {selectedImage && (
              <button
                type="button"
                className="search-section__image-search-btn"
                onClick={handleSearch}
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <span className="search-section__btn-spinner" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    <span>Search with this image</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StartSearching;
