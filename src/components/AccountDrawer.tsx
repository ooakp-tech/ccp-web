import { Link } from 'react-router-dom'
import { PLACEHOLDER_ROUTES } from '../routes/paths'
import type { PlaceholderRoute } from '../routes/paths'
import type { User } from '../types'
import { BrandLogo } from './BrandLogo'
import { Icon } from './Icon'
import type { IconName } from './Icon'
import { useOverlay } from './useOverlay'

interface DrawerLink {
  icon: IconName
  route: PlaceholderRoute
}

const GROUP_FAN: DrawerLink[] = [
  { icon: 'earn', route: PLACEHOLDER_ROUTES.joinAsCreator },
  { icon: 'following', route: PLACEHOLDER_ROUTES.following },
  { icon: 'subscriptions', route: PLACEHOLDER_ROUTES.subscriptions },
]

const GROUP_APP: DrawerLink[] = [
  { icon: 'settings', route: PLACEHOLDER_ROUTES.settings },
  { icon: 'languages', route: PLACEHOLDER_ROUTES.languages },
  { icon: 'help', route: PLACEHOLDER_ROUTES.help },
]

export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] ?? '?').slice(0, 2)
  return letters.toUpperCase()
}

interface AccountDrawerProps {
  open: boolean
  user: User
  loggingOut: boolean
  onClose: () => void
  onLogout: () => void
}

/** Light account drawer sliding over the home screen (PDF p.6 right). */
export function AccountDrawer({ open, user, loggingOut, onClose, onLogout }: AccountDrawerProps) {
  const panelRef = useOverlay<HTMLDivElement>(open, onClose)
  if (!open) return null

  return (
    <div className="drawer" role="dialog" aria-modal="true" aria-label="Account menu">
      {/* The strip of home screen left of the panel closes the drawer, as does its "Menu" tile. */}
      <button type="button" className="drawer__scrim" onClick={onClose} aria-label="Close menu">
        <span className="drawer__tab">
          <BrandLogo variant="stacked" className="drawer__tab-logo" alt="" />
          <span>Menu</span>
        </span>
      </button>

      <div className="drawer__panel" ref={panelRef} tabIndex={-1}>
        <div className="drawer__user">
          <span className="drawer__avatar">
            {initialsOf(user.displayName)}
            <span className="drawer__online" aria-hidden="true" />
          </span>
          <span className="drawer__identity">
            <span className="drawer__name">{user.displayName}</span>
            <span className="drawer__handle">@{user.handle}</span>
          </span>
        </div>

        <ul className="drawer__list">
          <li>
            <Link className="drawer__item" to={PLACEHOLDER_ROUTES.profile.path}>
              <span className="drawer__icon drawer__icon--highlight">
                <Icon name="profile" size={26} />
              </span>
              <span className="drawer__label">{PLACEHOLDER_ROUTES.profile.title}</span>
            </Link>
          </li>
          <li>
            <Link className="drawer__item" to={PLACEHOLDER_ROUTES.wallet.path}>
              <span className="drawer__icon">
                <Icon name="wallet" size={28} />
              </span>
              <span className="drawer__label">{PLACEHOLDER_ROUTES.wallet.title}</span>
              <span className="drawer__balance">{user.walletBalance.toFixed(2)}</span>
            </Link>
          </li>
        </ul>

        <ul className="drawer__list drawer__list--divided">
          {GROUP_FAN.map((link) => (
            <DrawerItem key={link.route.path} {...link} />
          ))}
        </ul>

        <ul className="drawer__list drawer__list--divided">
          {GROUP_APP.map((link) => (
            <DrawerItem key={link.route.path} {...link} />
          ))}
          <li>
            <button type="button" className="drawer__item" onClick={onLogout} disabled={loggingOut}>
              <span className="drawer__icon">
                <Icon name="logout" size={28} />
              </span>
              <span className="drawer__label">{loggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

function DrawerItem({ icon, route }: DrawerLink) {
  return (
    <li>
      <Link className="drawer__item" to={route.path}>
        <span className="drawer__icon">
          <Icon name={icon} size={28} />
        </span>
        <span className="drawer__label">{route.title}</span>
      </Link>
    </li>
  )
}
