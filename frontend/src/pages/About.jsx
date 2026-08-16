import React from 'react'
import './About.css'

function About() {
  return (
    <section className="about" id="about">
      <div className="about__container">

        <div className="about__header">
          <div className="about__label">
            <span className="about__label-dot" />
            <span>Project Overview</span>
          </div>
          <h2 className="about__title">
            Multi-Modal Product Search<br />
            <span className="gradient-text">& Visual Discovery Engine</span>
          </h2>
          <p className="about__description">
            A collaborative AI system where four student modules work together to deliver
            intelligent fashion discovery powered by computer vision and Machine learning.
          </p>
        </div>

      </div>
    </section>
  )
}

export default About
