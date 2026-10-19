import { useLayoutEffect, useRef } from 'react'
import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { SignedInLayout } from '../components/SignedInLayout'
import { PLACEHOLDER_ROUTES } from '../routes/paths'
import type { User } from '../types'

// The mockup shows only the top of three unlabeled cards, so no names are invented.
// ASSUMPTION (2026-10-19): photos removed at the user's request; the cards are
// empty placeholder tiles until real creator content is wired in (the Delete
// Account PDF draws them the same way, as "CONTENT CREATOR PHOTO HERE").
const ELITE_CREATORS = ['home/elite-creator-01', 'home/elite-creator-02', 'home/elite-creator-03']

/**
 * PDF p.6 (centre): signed-in home with hero, "Elite Creators" and the tab bar.
 * The "Menu" tab opens the account drawer (PDF p.6 right); Logout ends the flow.
 */
export function HomePage({ user }: { user: User }) {
  const carouselRef = useRef<HTMLUListElement>(null)

  // Start on the middle card with its neighbours peeking in, as in the mockup.
  useLayoutEffect(() => {
    const carousel = carouselRef.current
    if (carousel) carousel.scrollLeft = (carousel.scrollWidth - carousel.clientWidth) / 2
  }, [])

  return (
    <SignedInLayout user={user} homeActive>
      <section className="home-hero">
        {/* ASSUMPTION (2026-10-19, at the user's request): no hero photo; the
            sign-up page's centred logo sits on the white, purple-glow page. */}
        <BrandLogo variant="stacked" onLight className="home-hero__logo" alt="VELVET FX - Premium content platform" />
        <div className="home-hero__content">
          <h1>
            Create <span className="home-hero__soft">faster.</span>{' '}
            <span className="home-hero__accent">Earn smarter.</span>
          </h1>
          <p>The AI-powered platform built to solve creators&rsquo; biggest challenges.</p>
          <Button to={PLACEHOLDER_ROUTES.joinAsCreator.path} variant="brand" className="home-hero__cta">
            Join as a Creator
            <Icon name="chevron-right" size={20} />
          </Button>
        </div>
      </section>

      <section className="elite" aria-labelledby="elite-title">
        <h2 id="elite-title">Elite Creators</h2>
        <ul className="elite__track" ref={carouselRef}>
          {ELITE_CREATORS.map((name) => (
            <li key={name} className="elite__card" aria-hidden="true" />
          ))}
        </ul>
      </section>
    </SignedInLayout>
  )
}
