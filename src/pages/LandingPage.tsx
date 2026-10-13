import { useCallback, useState } from 'react'
import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { Picture } from '../components/Picture'
import { PublicMenu } from '../components/PublicMenu'
import { PATHS, PLACEHOLDER_ROUTES } from '../routes/paths'

/**
 * PDF p.3 (left): landing screen - the user picks the type of sign-up.
 * The "Menu" button opens the public navigation overlay (PDF p.3 right).
 */
export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <>
      <div className="screen landing">
        <div className="landing__bg">
          <Picture name="landing/landing-hero" alt="Fashion creator wearing a colorful headscarf." loading="eager" />
        </div>

        <header className="landing__header">
          <span className="landing__brand">
            <BrandLogo variant="app-mark" className="landing__mark" alt="" />
            <BrandLogo variant="wordmark" className="landing__wordmark" />
          </span>
          <button
            type="button"
            className="chip-button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
          >
            Menu
            <Icon name="menu" size={18} />
          </button>
        </header>

        <main className="landing__content">
          <h1 className="landing__title">
            <span>Create more.</span>
            <span className="landing__title-accent">Connect deeper.</span>
          </h1>
          <p className="landing__copy">
            Powerful AI tools help creators grow faster, while fans unlock exclusive access to the creators they love.
          </p>
          <div className="landing__actions">
            <Button to={PLACEHOLDER_ROUTES.joinAsCreator.path} shape="rounded" className="landing__cta-creator">
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
