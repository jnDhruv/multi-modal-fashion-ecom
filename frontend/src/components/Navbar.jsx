import React, { useState, useEffect } from 'react'
import './Navbar.css'

/**
 * Navbar Component
 * ─────────────────
 * Top navigation bar with:
 * - Brand logo
 * - Navigation links
 * - Sticky behavior with scroll blur effect
 */
function Navbar({ activeSection, onNavigate }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Add scroll listener to add blur effect when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { id: 'home',   label: 'Home' },
    { id: 'search', label: 'Search' },
    { id: 'about',  label: 'About' },
  ]

  const handleNavClick = (sectionId) => {
    onNavigate(sectionId)
    setMenuOpen(false)
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">

        {/* Brand Logo */}
        <button
          className="navbar__brand"
          onClick={() => handleNavClick('home')}
          aria-label="Go to homepage"
        >
          <div className="navbar__logo">
            <span className="navbar__logo-icon">✦</span>
            <span className="navbar__logo-text">StyleAI</span>
          </div>
          <span className="navbar__tagline">Fashion Discovery</span>
        </button>

        {/* Desktop Navigation Links */}
        <ul className="navbar__links" role="list">
          {navLinks.map(link => (
            <li key={link.id}>
              <button
                className={`navbar__link ${activeSection === link.id ? 'navbar__link--active' : ''}`}
                onClick={() => handleNavClick(link.id)}
              >
                {link.label}
                {activeSection === link.id && (
                  <span className="navbar__link-dot" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          className="navbar__cta"
          onClick={() => handleNavClick('search')}
        >
          <span>Try AI Search</span>
          <span className="navbar__cta-icon">→</span>
        </button>

        {/* Mobile Hamburger */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          {navLinks.map(link => (
            <button
              key={link.id}
              className={`navbar__mobile-link ${activeSection === link.id ? 'navbar__mobile-link--active' : ''}`}
              onClick={() => handleNavClick(link.id)}
            >
              {link.label}
            </button>
          ))}
          <button
            className="navbar__mobile-cta"
            onClick={() => handleNavClick('search')}
          >
            Try AI Search →
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
