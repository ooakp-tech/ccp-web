import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { MediaPlaceholder } from '../components/MediaPlaceholder'
import { PATHS, PLACEHOLDER_ROUTES } from '../routes/paths'

/** Creator PDF p.6-7, screens #1-#6, in order. */
const SLIDES = [
  'Earn $15K+ monthly. Join the elite creators on VELVET FX.',
  'Next-gen tech built to make content creation effortless',
  'Creators keep 85% for 3 months, 5% referral bonus',
  'Cutting-edge AI tools built to skyrocket your income',
  'Refer top creators and boost your earnings instantly',
  'Secure global payouts. Get paid fast worldwide',
]

/**
 * ASSUMPTION: the PDF says "Manual/Automatic carousel" without a timing; 5 s
 * per slide, stopping for good as soon as the creator uses an arrow, a dot or
 * a swipe, pausing while hovered or focused, and off for reduced motion.
 */
const AUTO_ADVANCE_MS = 5000
const SWIPE_MIN_PX = 40

/**
 * Creator PDF p.6-7: /myprofile right after "Confirm your account" (and after
 * Google sign-up). "Start Monetizing" opens the Referrals step (p.8 right);
 * "Close" goes to the creator home (p.8 centre).
 */
export function CreatorOnboardingPage() {
  const [index, setIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(
    () => !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  )
  const [paused, setPaused] = useState(false)
  const swipeStartX = useRef<number | null>(null)
  const last = SLIDES.length - 1

  const goTo = useCallback(
    (next: number) => {
      setAutoPlay(false) // the creator took over
      setIndex(Math.max(0, Math.min(last, next)))
    },
    [last],
  )

  useEffect(() => {
    if (!autoPlay || paused) return
    // Stops on the last slide, where the mockup shows no right arrow.
    if (index === last) return
    const timer = setTimeout(() => setIndex((current) => Math.min(last, current + 1)), AUTO_ADVANCE_MS)
    return () => clearTimeout(timer)
  }, [autoPlay, paused, index, last])

  const onPointerDown = (event: PointerEvent) => {
    swipeStartX.current = event.clientX
  }
  const onPointerUp = (event: PointerEvent) => {
    if (swipeStartX.current === null) return
    const dx = event.clientX - swipeStartX.current
    swipeStartX.current = null
    if (Math.abs(dx) >= SWIPE_MIN_PX) goTo(index + (dx < 0 ? 1 : -1))
  }

  return (
    <div className="screen onboarding">
      <header className="onboarding__header">
        <BrandLogo variant="horizontal" onLight className="onboarding__logo" />
      </header>

      <main className="onboarding__body">
        <section
          className="carousel"
          aria-roledescription="carousel"
          aria-label="What VELVET FX offers creators"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div
            className="carousel__viewport"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (swipeStartX.current = null)}
          >
            <ol className="carousel__track" style={{ transform: `translateX(-${index * 100}%)` }}>
              {SLIDES.map((title, slide) => (
                <li
                  key={title}
                  className="carousel__slide"
                  aria-roledescription="slide"
                  aria-label={`${slide + 1} of ${SLIDES.length}`}
                  aria-hidden={slide !== index}
                >
                  <MediaPlaceholder className="carousel__photo" />
                  <h1 className="carousel__title">{title}</h1>
                </li>
              ))}
            </ol>
          </div>

          <div className="carousel__controls">
            <button
              type="button"
              className="carousel__arrow"
              onClick={() => goTo(index - 1)}
              aria-label="Previous slide"
              hidden={index === 0}
            >
              <Icon name="chevron-left" size={20} />
            </button>
            <div className="carousel__dots">
              {SLIDES.map((title, slide) => (
                <button
                  key={title}
                  type="button"
                  className="carousel__dot"
                  aria-label={`Go to slide ${slide + 1}`}
                  aria-current={slide === index ? 'true' : undefined}
                  onClick={() => goTo(slide)}
                />
              ))}
            </div>
            <button
              type="button"
              className="carousel__arrow"
              onClick={() => goTo(index + 1)}
              aria-label="Next slide"
              hidden={index === last}
            >
              <Icon name="chevron-right" size={20} />
            </button>
          </div>
          {/* Announces manual changes only; automatic ones would interrupt screen readers. */}
          <p className="visually-hidden" aria-live={autoPlay ? 'off' : 'polite'}>
            Slide {index + 1} of {SLIDES.length}: {SLIDES[index]}
          </p>
        </section>

        <p className="onboarding__legal">
          By joining VELVET FX as a creator, you confirm your agreement to our{' '}
          <Link to={PLACEHOLDER_ROUTES.terms.path}>Terms &amp; Conditions</Link>,{' '}
          <Link to={PLACEHOLDER_ROUTES.acceptableUse.path}>Acceptable Use Policy</Link>, and{' '}
          <Link to={PLACEHOLDER_ROUTES.privacy.path}>Privacy Policy</Link>.
        </p>
      </main>

      <footer className="onboarding__actions">
        <Button to={PATHS.creatorReferral} block>
          Start Monetizing
        </Button>
        <Button to={PATHS.home} variant="outline" block>
          Close
        </Button>
      </footer>
    </div>
  )
}
