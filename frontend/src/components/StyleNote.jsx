import React, { useState } from 'react'
import './StyleNote.css'

function StyleNote({ note, available = true }) {
  const [expanded, setExpanded] = useState(false)

  const MAX_LENGTH = 160
  const isLong = note && note.length > MAX_LENGTH
  const displayNote = isLong && !expanded
    ? note.slice(0, MAX_LENGTH).trim() + '...'
    : note

  if (!available || !note) {
    return (
      <div className="style-note style-note--unavailable">
        <div className="style-note__header">
          <span className="style-note__icon">✨</span>
          <span className="style-note__label">AI Style Note</span>
        </div>
        <p className="style-note__unavailable-text">
          AI explanation unavailable for this product.
        </p>
      </div>
    )
  }

  return (
    <div className="style-note">
      {/* Header */}
      <div className="style-note__header">
        <div className="style-note__header-left">
          <span className="style-note__icon" aria-hidden="true">✨</span>
          <span className="style-note__label">AI Style Note</span>
        </div>
        <span className="style-note__badge">Gemini</span>
      </div>

      <p className="style-note__text">
        {displayNote}
      </p>

      {isLong && (
        <button
          className="style-note__expand-btn"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? '↑ Show less' : '↓ Read more'}
        </button>
      )}
    </div>
  )
}

export default StyleNote
