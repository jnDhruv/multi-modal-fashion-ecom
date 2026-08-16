import React from 'react'
import './Loading.css'

/**
 * Loading Component
 * ──────────────────
 * Shows multi-step loading progress with:
 * - Step-by-step status messages
 * - Animated skeleton cards
 * - Stages: Retrieving → AI Processing → Ready
 */
function Loading({ stage = 'retrieving' }) {
  // Different messages for different loading stages
  const stages = {
    retrieving: {
      icon: '🔍',
      title: 'Finding relevant products...',
      description: 'Searching the fashion catalog for products matching your query',
      step: 1,
    },
    generating: {
      icon: '✨',
      title: 'Generating AI Style Notes...',
      description: 'Gemini AI is analyzing why each product matches your search',
      step: 2,
    },
    ready: {
      icon: '✅',
      title: 'Results ready!',
      description: 'Loading your personalized fashion recommendations',
      step: 3,
    },
  }

  const current = stages[stage] || stages.retrieving

  return (
    <div className="loading" role="status" aria-live="polite" aria-label={current.title}>
      {/* Status Card */}
      <div className="loading__status-card">
        {/* Progress Steps */}
        <div className="loading__steps">
          {Object.values(stages).map((s, i) => (
            <div
              key={i}
              className={`loading__step ${
                s.step < current.step ? 'loading__step--done' :
                s.step === current.step ? 'loading__step--active' :
                'loading__step--pending'
              }`}
            >
              <div className="loading__step-dot">
                {s.step < current.step ? '✓' : s.step}
              </div>
              <span className="loading__step-label">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Current Status */}
        <div className="loading__current">
          <div className="loading__icon">{current.icon}</div>
          <div className="loading__text">
            <p className="loading__title">{current.title}</p>
            <p className="loading__description">{current.description}</p>
          </div>
          <div className="loading__spinner" aria-hidden="true" />
        </div>
      </div>

      {/* Skeleton Product Cards */}
      <div className="loading__skeletons" aria-hidden="true">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="loading__skeleton-card">
            <div className="skeleton loading__skeleton-image" />
            <div className="loading__skeleton-content">
              <div className="skeleton loading__skeleton-title" />
              <div className="loading__skeleton-tags">
                <div className="skeleton loading__skeleton-tag" />
                <div className="skeleton loading__skeleton-tag" />
                <div className="skeleton loading__skeleton-tag" />
              </div>
              <div className="skeleton loading__skeleton-price" />
              <div className="loading__skeleton-note">
                <div className="skeleton loading__skeleton-note-header" />
                <div className="skeleton loading__skeleton-note-text" />
                <div className="skeleton loading__skeleton-note-text loading__skeleton-note-text--short" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Loading
