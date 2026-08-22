import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import './App.css'


function App() {
  const [activeSection, setActiveSection] = useState('home')

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId)

    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const el = document.getElementById(sectionId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'search', 'home']
      const scrollY = window.scrollY + 100

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId)
        if (el && scrollY >= el.offsetTop) {
          setActiveSection(sectionId)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="app">
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      <Hero onSearchClick={() => handleNavigate('search')} />

      <Home />

      <About />

      <footer className="app__footer">
        <div className="app__footer-inner">
          <div className="app__footer-brand">
            <span className="app__footer-logo">✦ StyleAI</span>
            <span className="app__footer-tagline">Fashion Discovery Engine</span>
          </div>
          <div className="app__footer-info">
            <p>Multi-Modal Product Search & Visual Discovery Engine</p>
            <p>B.Tech Final Year Project — Student D: LLM Integration + Full Stack</p>
          </div>
          <div className="app__footer-tech">
            <span>React</span>
            <span>·</span>
            <span>FastAPI</span>
            <span>·</span>
            <span>Gemini AI</span>
            <span>·</span>
            <span>CLIP</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
