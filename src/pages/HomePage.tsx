import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AccountDrawer, initialsOf } from '../components/AccountDrawer'
import { BottomNav } from '../components/BottomNav'
import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { Picture } from '../components/Picture'
import { useSession } from '../context/SessionContext'
import { PATHS, PLACEHOLDER_ROUTES } from '../routes/paths'
import { signOut } from '../services/api'
import type { User } from '../types'

// The mockup shows only the top of three unlabeled cards, so no names are invented.
const ELITE_CREATORS = ['home/elite-creator-01', 'home/elite-creator-02', 'home/elite-creator-03']

/**
 * PDF p.6 (centre): signed-in home with hero, "Elite Creators" and the tab bar.
 * The "Menu" tab opens the account drawer (PDF p.6 right); Logout ends the flow.
 */
export function HomePage({ user }: { user: User }) {
  const navigate = useNavigate()
  const { clearSession } = useSession()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const carouselRef = useRef<HTMLUListElement>(null)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  // Start on the middle card with its neighbours peeking in, as in the mockup.
  useLayoutEffect(() => {
    const carousel = carouselRef.current
    if (carousel) carousel.scrollLeft = (carousel.scrollWidth - carousel.clientWidth) / 2
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    clearSession()
    navigate(PATHS.landing)
  }

  return (
    <>
      <div className="home">
        <main className="home__scroll">
          <section className="home-hero">
            <div className="home-hero__photo">
              <Picture name="home/home-hero" alt="Creator in a straw hat holding a lemon." loading="eager" />
            </div>
            <BrandLogo variant="app-mark" className="app-mark" />
            <div className="home-hero__content">
              <h1>
                Create <span className="home-hero__soft">faster.</span>{' '}
                <span className="home-hero__accent">Earn smarter.</span>
              </h1>
              <p>The AI-powered platform built to solve creators&rsquo; biggest challenges.</p>
              <Button to={PLACEHOLDER_ROUTES.joinAsCreator.path} className="home-hero__cta">
                Join as a Creator
                <Icon name="chevron-right" size={20} />
              </Button>
            </div>
          </section>

          <section className="elite" aria-labelledby="elite-title">
            <h2 id="elite-title">Elite Creators</h2>
            <ul className="elite__track" ref={carouselRef}>
              {ELITE_CREATORS.map((name) => (
                <li key={name} className="elite__card">
                  <Picture name={name} alt="Content creator in a professional studio." />
                </li>
              ))}
            </ul>
          </section>
        </main>

        <BottomNav initials={initialsOf(user.displayName)} onOpenMenu={() => setDrawerOpen(true)} />
      </div>

      <AccountDrawer
        open={drawerOpen}
        user={user}
        loggingOut={loggingOut}
        onClose={closeDrawer}
        onLogout={handleLogout}
      />
    </>
  )
}
