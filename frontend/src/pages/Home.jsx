import React, { useState, useEffect, useRef } from 'react'
import SearchBar from '../components/SearchBar.jsx'
import ImageUploader from '../components/ImageUploader.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { generateStyleNotes } from '../services/api.js'
import './Home.css'

function Home() {
  const [query, setQuery]                 = useState('')           // Text search query
  const [selectedImage, setSelectedImage] = useState(null)         // File object
  const [imagePreview, setImagePreview]   = useState(null)         // Data URL for preview
  const [searchMode, setSearchMode]       = useState('text')       // 'text' | 'image'
  const [products, setProducts]           = useState([])           // Final enriched products
  const [loading, setLoading]             = useState(false)        // Overall loading
  const [loadingStage, setLoadingStage]   = useState('retrieving') // Loading stage
  const [error, setError]                 = useState(null)         // Error state
  const [errorType, setErrorType]         = useState('generic')    // Error type
  const [hasSearched, setHasSearched]     = useState(false)        // Has user searched?
  const [activeTab, setActiveTab]         = useState('text')       // Search tab UI

  const resultsRef = useRef(null)


  const handleImageSelect = (file) => {
    setSelectedImage(file)
    setSearchMode('image')
    setActiveTab('image')

    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setSearchMode('text')
    setActiveTab('text')
  }


  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    if (tab === 'text') {
      setSearchMode('text')
    } else {
      setSearchMode('image')
    }
  }


  const handleSearch = async (overrideQuery) => {
    const effectiveQuery = overrideQuery || query

    if (searchMode === 'text' && !effectiveQuery.trim()) {
      setError('Please enter a search query.')
      setErrorType('generic')
      return
    }
    if (searchMode === 'image' && !selectedImage) {
      setError('Please upload an image to search.')
      setErrorType('generic')
      return
    }

    setError(null)
    setLoading(true)
    setLoadingStage('retrieving')
    setProducts([])
    setHasSearched(true)

    try {
      setLoadingStage('retrieving')

      let retrievalResult

      if (searchMode === 'image' && selectedImage) {
        retrievalResult = await retrieveProductsByImage(selectedImage)
      } else {
        retrievalResult = await retrieveProducts(effectiveQuery || query, 8)
      }

      if (!retrievalResult.products || retrievalResult.products.length === 0) {
        setError('No products found for your search.')
        setErrorType('no_results')
        setLoading(false)
        return
      }

      setLoadingStage('generating')

      const styleNotesResult = await generateStyleNotes(
        retrievalResult.user_query,
        retrievalResult.products,
        searchMode
      )


      setLoadingStage('ready')
      await new Promise(r => setTimeout(r, 300))

      setProducts(styleNotesResult.products)

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)

    } catch (err) {
      setError(err.message || 'Search failed. Please try again.')
      setErrorType(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    handleSearch()
  }

  const handleClearResults = () => {
    setProducts([])
    setHasSearched(false)
    setError(null)
    setQuery('')
    handleImageRemove()
  }


  return (
    <main className="home" id="search">

      <section className="home__search-section">
        <div className="home__search-inner">

          <div className="home__section-label">
            <span className="home__section-dot" />
            <span>AI-Powered Fashion Search</span>
          </div>

          <h2 className="home__search-title">
            Find your perfect <span className="gradient-text">style</span>
          </h2>
          <p className="home__search-subtitle">
            Search using natural language or upload a clothing image
          </p>

          <div className="home__tabs" role="tablist">
            <button
              className={`home__tab ${activeTab === 'text' ? 'home__tab--active' : ''}`}
              onClick={() => handleTabSwitch('text')}
              role="tab"
              aria-selected={activeTab === 'text'}
              aria-controls="tab-text"
            >
              <span>🔍</span>
              <span>Text Search</span>
            </button>
            <button
              className={`home__tab ${activeTab === 'image' ? 'home__tab--active' : ''}`}
              onClick={() => handleTabSwitch('image')}
              role="tab"
              aria-selected={activeTab === 'image'}
              aria-controls="tab-image"
            >
              <span>📷</span>
              <span>Image Search</span>
            </button>
          </div>

          {activeTab === 'text' && (
            <div
              className="home__tab-panel"
              id="tab-text"
              role="tabpanel"
            >
              <SearchBar
                query={query}
                onQueryChange={setQuery}
                onSearch={handleSearch}
                loading={loading}
                searchMode={searchMode}
              />
            </div>
          )}

          {activeTab === 'image' && (
            <div
              className="home__tab-panel"
              id="tab-image"
              role="tabpanel"
            >
              <ImageUploader
                selectedImage={selectedImage}
                imagePreview={imagePreview}
                onImageSelect={handleImageSelect}
                onImageRemove={handleImageRemove}
              />

              {selectedImage && (
                <div className="home__image-search-btn-wrap">
                  <button
                    className="home__image-search-btn"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="home__btn-spinner" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <span>🔍</span>
                        <span>Search with this image</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      <div ref={resultsRef}>

        {loading && <Loading stage={loadingStage} />}

        {!loading && error && (
          <div className="home__error-wrap">
            <ErrorMessage
              type={errorType}
              message={error}
              onRetry={errorType !== 'no_results' ? handleRetry : undefined}
            />
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <ProductGrid
              products={products}
              query={searchMode === 'text' ? query : `Image search: ${selectedImage?.name || ''}`}
              searchMode={searchMode}
            />

            <div className="home__clear-wrap">
              <button
                className="home__clear-btn"
                onClick={handleClearResults}
              >
                ✕ Clear Results
              </button>
            </div>
          </>
        )}

        {!loading && !error && hasSearched && products.length === 0 && (
          <div className="home__empty">
            <div className="home__empty-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try a different search query or upload a different image.</p>
          </div>
        )}
      </div>

    </main>
  )
}

export default Home
