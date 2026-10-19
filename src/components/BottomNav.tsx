import { Link } from 'react-router-dom'
import { PATHS, PLACEHOLDER_ROUTES } from '../routes/paths'
import { BrandLogo } from './BrandLogo'
import { Icon } from './Icon'

interface BottomNavProps {
  initials: string
  onOpenMenu: () => void
  /** True on the home screen; the settings screens show the bar with no tab selected. */
  homeActive?: boolean
}

/**
 * Signed-in tab bar on the home screen (PDF p.6 centre) and the settings screens
 * (Delete Account PDF p.5). "Menu" opens the account drawer.
 * On desktop the same items are laid out as a top bar with the logo (see desktop.css).
 */
export function BottomNav({ initials, onOpenMenu, homeActive = true }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      <Link className="bottom-nav__brand" to={PATHS.home}>
        <BrandLogo variant="horizontal" onLight />
      </Link>
      {homeActive ? (
        <span className="bottom-nav__item is-active" aria-current="page">
          {/* Filled variant of the pack's home icon; the mockup fills the active tab. */}
          <svg className="bottom-nav__home" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2.6 2.9 10.2a1 1 0 0 0-.4.8V20a1.5 1.5 0 0 0 1.5 1.5h4.5v-6.2h7v6.2H20a1.5 1.5 0 0 0 1.5-1.5V11a1 1 0 0 0-.4-.8L12 2.6Z"
            />
          </svg>
          <span>Home</span>
          <span className="bottom-nav__dot" aria-hidden="true" />
        </span>
      ) : (
        <Link className="bottom-nav__item" to={PATHS.home}>
          <Icon name="home" size={26} />
          <span>Home</span>
        </Link>
      )}
      <Link className="bottom-nav__item" to={PLACEHOLDER_ROUTES.notifications.path}>
        <Icon name="notifications" size={26} />
        <span>Notifications</span>
      </Link>
      <Link className="bottom-nav__item" to={PLACEHOLDER_ROUTES.discover.path}>
        <Icon name="search" size={26} />
        <span>Discover</span>
      </Link>
      <Link className="bottom-nav__item" to={PLACEHOLDER_ROUTES.messages.path}>
        <Icon name="messages" size={26} />
        <span>Messages</span>
      </Link>
      <button type="button" className="bottom-nav__item" onClick={onOpenMenu} aria-haspopup="dialog">
        <span className="bottom-nav__avatar">
          {initials}
          <span className="bottom-nav__badge" aria-hidden="true" />
        </span>
        <span>Menu</span>
      </button>
    </nav>
  )
}
