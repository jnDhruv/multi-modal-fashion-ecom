import React, { useEffect, useRef, useState, useCallback } from 'react'
import './Hero.css'

const FRAME_COUNT = 253
const FRAME_PREFIX = '/frames/ezgif-frame-'
const FRAME_EXT = '.jpg'
const SCROLL_MULTIPLIER = 4.2

const frameSrc = (i) =>
  `${FRAME_PREFIX}${String(i).padStart(3, '0')}${FRAME_EXT}`

const BEATS = [
  {
    from: 0.0,
    to: 0.1,
    eyebrow: 'AI FASHION DISCOVERY',
    title: 'Style, understood.',
    body: 'A search engine for how you actually shop — no filters, no guesswork.',
  },
  {
    from: 0.17,
    to: 0.32,
    eyebrow: 'NATURAL LANGUAGE SEARCH',
    title: 'Describe it.',
    body: '"Something silky for a warm evening." Type what you\u2019re picturing, we\u2019ll find it.',
  },
  {
    from: 0.4,
    to: 0.55,
    eyebrow: 'IMAGE SEARCH',
    title: 'Or simply show us.',
    body: 'Upload a photo of a piece you love — our vision model finds what matches.',
  },
  {
    from: 0.63,
    to: 0.78,
    eyebrow: 'CLIP RETRIEVAL',
    title: 'Style, not just tags.',
    body: 'Every fabric, cut and mood is embedded and searchable — beyond keywords.',
  },
  {
    from: 0.85,
    to: 0.97,
    eyebrow: 'GEMINI AI STYLE NOTES',
    title: 'StyleAI curates. Instantly.',
    body: 'Every result arrives with an AI-written note on why it fits your search.',
  },
]

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

function beatOpacity(progress, from, to, fade = 0.045) {
  if (progress < from - fade || progress > to + fade) return 0
  if (progress < from) return (progress - (from - fade)) / fade
  if (progress > to) return 1 - (progress - to) / fade
  return 1
}

function Hero({ onSearchClick }) {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const imagesRef = useRef([])
  const currentFrameRef = useRef(0)
  const targetFrameRef = useRef(0)
  const rafRef = useRef(null)
  const activeRef = useRef(true)
  const beatEls = useRef([])
  const scrollDotRef = useRef(null)
  const progressBarRef = useRef(null)
  const vignetteRef = useRef(null)

  const [loadProgress, setLoadProgress] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let loaded = 0
    const imgs = new Array(FRAME_COUNT)

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image()
      img.decoding = 'async'
      img.src = frameSrc(i)
      const onDone = () => {
        loaded += 1
        if (!cancelled) {
          setLoadProgress(Math.round((loaded / FRAME_COUNT) * 100))
          if (loaded === FRAME_COUNT) setReady(true)
        }
      }
      img.onload = onDone
      img.onerror = onDone
      imgs[i - 1] = img
    }

    imagesRef.current = imgs
    return () => {
      cancelled = true
    }
  }, [])

  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    const img = imagesRef.current[index]
    if (!canvas || !ctx || !img || !img.complete || !img.naturalWidth) return

    const cw = canvas.width
    const ch = canvas.height
    const canvasRatio = cw / ch
    const imgRatio = img.naturalWidth / img.naturalHeight

    let sx, sy, sw, sh
    if (imgRatio > canvasRatio) {
      sh = img.naturalHeight
      sw = sh * canvasRatio
      sx = (img.naturalWidth - sw) / 2
      sy = 0
    } else {
      sw = img.naturalWidth
      sh = sw / canvasRatio
      sx = 0
      sy = (img.naturalHeight - sh) / 2
    }

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, cw, ch)
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)
  }, [])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(window.innerWidth * dpr)
    canvas.height = Math.round(window.innerHeight * dpr)
    ctxRef.current = canvas.getContext('2d')
    drawFrame(Math.round(currentFrameRef.current))
  }, [drawFrame])

  const updateFromScroll = useCallback(() => {
    const section = sectionRef.current
    if (!section) return

    const rect = section.getBoundingClientRect()
    const total = rect.height - window.innerHeight
    const progress = clamp(total > 0 ? -rect.top / total : 0, 0, 1)

    targetFrameRef.current = progress * (FRAME_COUNT - 1)

    beatEls.current.forEach((el, i) => {
      if (!el) return
      const beat = BEATS[i]
      const op = beatOpacity(progress, beat.from, beat.to)
      el.style.opacity = op.toFixed(3)
      el.style.transform = `translateY(${(1 - op) * 16}px)`
      el.style.pointerEvents = op > 0.5 ? 'auto' : 'none'
    })

    if (scrollDotRef.current) {
      scrollDotRef.current.style.opacity = clamp(1 - progress * 18, 0, 1).toFixed(3)
    }

    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${progress})`
    }

    if (vignetteRef.current) {
      vignetteRef.current.style.opacity = clamp(progress > 0.82 ? (progress - 0.82) / 0.18 : 0, 0, 1).toFixed(3)
    }
  }, [])

  useEffect(() => {
    if (!ready) return

    resizeCanvas()
    updateFromScroll()

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ease = prefersReducedMotion ? 1 : 0.14

    const tick = () => {
      if (activeRef.current) {
        updateFromScroll()
        const diff = targetFrameRef.current - currentFrameRef.current
        if (Math.abs(diff) > 0.02) {
          currentFrameRef.current += diff * ease
        } else {
          currentFrameRef.current = targetFrameRef.current
        }
        drawFrame(Math.round(currentFrameRef.current))
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    const io = new IntersectionObserver(
      ([entry]) => {
        activeRef.current = entry.isIntersecting
      },
      { threshold: 0 }
    )
    if (sectionRef.current) io.observe(sectionRef.current)

    window.addEventListener('resize', resizeCanvas)

    return () => {
      cancelAnimationFrame(rafRef.current)
      io.disconnect()
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [ready, resizeCanvas, updateFromScroll, drawFrame])

  return (
    <section
      className="hero"
      id="home"
      ref={sectionRef}
      style={{ height: `${SCROLL_MULTIPLIER * 100}vh` }}
    >
      <div className="hero__sticky">
        <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />

        {!ready && (
          <div className="hero__loader">
            <span className="hero__loader-mark">✦</span>
            <div className="hero__loader-track">
              <div
                className="hero__loader-fill"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="hero__loader-pct">{loadProgress}%</span>
          </div>
        )}

        <div className="hero__beats">
          {BEATS.map((beat, i) => (
            <div
              key={i}
              ref={(el) => (beatEls.current[i] = el)}
              className="hero__beat"
              style={{ opacity: 0 }}
            >
              <div className="hero__beat-eyebrow">
                <span className="hero__beat-dot" />
                {beat.eyebrow}
              </div>
              <h1 className="hero__beat-title">{beat.title}</h1>
              <p className="hero__beat-body">{beat.body}</p>
              {i === 0 && (
                <div className="hero__beat-actions">
                  <button className="hero__btn hero__btn--primary" onClick={onSearchClick}>
                    <span>Start Searching</span>
                    <span className="hero__btn-arrow">→</span>
                  </button>
                  <button className="hero__btn hero__btn--ghost" onClick={onSearchClick}>
                    Upload an image
                  </button>
                </div>
              )}
              {i === BEATS.length - 1 && (
                <div className="hero__beat-actions">
                  <button className="hero__btn hero__btn--primary" onClick={onSearchClick}>
                    <span>Try it now</span>
                    <span className="hero__btn-arrow">→</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div ref={vignetteRef} className="hero__vignette" style={{ opacity: 0 }} />

        <div className="hero__progress-track">
          <div ref={progressBarRef} className="hero__progress-fill" />
        </div>
      </div>
    </section>
  )
}

export default Hero
