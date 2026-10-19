import { Link } from 'react-router-dom'
import { PATHS, PLACEHOLDER_ROUTES } from '../routes/paths'
import { BrandLogo } from './BrandLogo'
import { Button } from './Button'
import { useOverlay } from './useOverlay'

export const MENU_LINKS = [
  PLACEHOLDER_ROUTES.about,
  PLACEHOLDER_ROUTES.highlights,
  PLACEHOLDER_ROUTES.photographers,
  PLACEHOLDER_ROUTES.videomakers,
  PLACEHOLDER_ROUTES.locations,
  PLACEHOLDER_ROUTES.blog,
  PLACEHOLDER_ROUTES.referAndEarn,
  PLACEHOLDER_ROUTES.support,
]

interface PublicMenuProps {
  open: boolean
  onClose: () => void
}

/** Full-screen public navigation opened by the landing "Menu" button (PDF p.3 right). */
export function PublicMenu({ open, onClose }: PublicMenuProps) {
  const closeRef = useOverlay<HTMLButtonElement>(open, onClose)
  if (!open) return null

  return (
    <div className="public-menu" role="dialog" aria-modal="true" aria-label="Menu">
      <header className="public-menu__header">
        <BrandLogo variant="horizontal" onLight className="public-menu__logo" />
        <button ref={closeRef} type="button" className="chip-button chip-button--solid" onClick={onClose}>
          Close
        </button>
      </header>

      <nav className="public-menu__nav" aria-label="Main">
        <ul>
          {MENU_LINKS.map((link) => (
            <li key={link.path}>
              <Link to={link.path}>{link.title}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="public-menu__footer">
        <Button to={PATHS.signUp} variant="outline" size="sm">
          Sign up as a Fan
        </Button>
        <Button to={PATHS.signIn} variant="primary" size="sm">
          Login
        </Button>
        <Button to={PATHS.creatorSignUp} variant="brand" size="sm">
          Join as a Creator
        </Button>
      </footer>
    </div>
  )
}
