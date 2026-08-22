import React, { useRef, useState } from 'react'
import './ImageUploader.css'


function ImageUploader({ selectedImage, imagePreview, onImageSelect, onImageRemove }) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragError, setDragError] = useState('')

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const MAX_SIZE_MB = 10

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setDragError('Please upload a JPG, PNG, or WebP image.')
      return false
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setDragError(`File too large. Max size is ${MAX_SIZE_MB}MB.`)
      return false
    }
    setDragError('')
    return true
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      onImageSelect(file)
    }
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && validateFile(file)) {
      onImageSelect(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false)
    }
  }

  const handleRemove = () => {
    onImageRemove()
    setDragError('')
  }

  if (imagePreview) {
    return (
      <div className="image-uploader image-uploader--preview">
        <div className="image-uploader__preview-container">
          <div className="image-uploader__preview-wrap">
            <img
              src={imagePreview}
              alt="Selected clothing for search"
              className="image-uploader__preview-img"
            />
            <div className="image-uploader__preview-overlay">
              <span className="image-uploader__preview-icon">📷</span>
            </div>
          </div>

          <div className="image-uploader__preview-info">
            <div className="image-uploader__preview-badge">
              <span>✓</span>
              <span>Image Selected</span>
            </div>
            <p className="image-uploader__preview-name">
              {selectedImage?.name || 'Selected image'}
            </p>
            {selectedImage?.size && (
              <p className="image-uploader__preview-size">
                {(selectedImage.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
            <p className="image-uploader__preview-hint">
              Click Search to find visually similar fashion products
            </p>

            <div className="image-uploader__preview-actions">
              <button
                className="image-uploader__btn image-uploader__btn--change"
                onClick={() => fileInputRef.current?.click()}
              >
                <span>🔄</span>
                <span>Change Image</span>
              </button>
              <button
                className="image-uploader__btn image-uploader__btn--remove"
                onClick={handleRemove}
              >
                <span>✕</span>
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="visually-hidden"
          aria-label="Change clothing image"
        />
      </div>
    )
  }

  return (
    <div className="image-uploader">
      <div
        className={`image-uploader__dropzone ${isDragging ? 'image-uploader__dropzone--dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        aria-label="Upload clothing image for visual search"
      >
        <div className="image-uploader__upload-icon" aria-hidden="true">
          {isDragging ? '🎯' : '📷'}
        </div>

        <div className="image-uploader__text">
          <p className="image-uploader__title">
            {isDragging ? 'Drop your image here' : 'Upload a clothing image'}
          </p>
          <p className="image-uploader__subtitle">
            Drag & drop or{' '}
            <span className="image-uploader__link">click to browse</span>
          </p>
          <p className="image-uploader__formats">
            Supports JPG, PNG, WebP — Max 10MB
          </p>
        </div>

        {dragError && (
          <p className="image-uploader__error" role="alert">
            ⚠️ {dragError}
          </p>
        )}
      </div>

      <div className="image-uploader__info">
        <p>📌 How image search works</p>
        <p>Your image will be sent to our CLIP retrieval model which finds visually similar fashion products from our catalog.</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="visually-hidden"
        aria-label="Upload clothing image"
      />
    </div>
  )
}

export default ImageUploader
