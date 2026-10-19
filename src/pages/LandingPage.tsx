import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { MENU_LINKS, PublicMenu } from '../components/PublicMenu'
import { PATHS, PLACEHOLDER_ROUTES } from '../routes/paths'

/**
 * PDF p.3 (left): landing screen - the user picks the type of sign-up.
 * The "Menu" button opens the public navigation overlay (PDF p.3 right).
 *
 * ASSUMPTION (2026-10-19, at the user's request): no photo. The screen uses the
 * sign-up page's look instead - white page, purple glow, centred stacked logo.
 *
 * ASSUMPTION (desktop, not in the PDF): wide screens show the menu links and
 * "Login" inline in the header; the "Menu" button stays until they fit.
 */
export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <>
      <div className="screen landing">
        <header className="landing__header">
          <nav className="landing__nav" aria-label="Main">
            {MENU_LINKS.map((link) => (
              <Link key={link.path} to={link.path}>
                {link.title}
              </Link>
            ))}
          </nav>
          <div className="landing__header-actions">
            <Button to={PATHS.signIn} variant="outline" size="sm" className="landing__login">
              Login
            </Button>
            <button
              type="button"
              className="chip-button landing__menu-button"
              onClick={() => setMenuOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
            >
              Menu
              <Icon name="menu" size={18} />
            </button>
          </div>
        </header>

        <main className="landing__content">
          <BrandLogo variant="stacked" onLight className="landing__logo" alt="VELVET FX - Premium content platform" />
          <h1 className="landing__title">
            <span>Create more.</span>
            <span className="landing__title-accent">Connect deeper.</span>
          </h1>
          <p className="landing__copy">
            Powerful AI tools help creators grow faster, while fans unlock exclusive access to the creators they love.
          </p>
          <div className="landing__actions">
            <Button
              to={PLACEHOLDER_ROUTES.joinAsCreator.path}
              variant="brand"
              shape="rounded"
              className="landing__cta-creator"
            >
              Join as a Creator
              <Icon name="arrow-right" size={20} />
            </Button>
            <Button to={PATHS.signUp} variant="outline" shape="rounded" className="landing__cta-fan">
              Sign Up as a Fan
            </Button>
          </div>
        </main>
      </div>

      <PublicMenu open={menuOpen} onClose={closeMenu} />
    </>
  )
}
