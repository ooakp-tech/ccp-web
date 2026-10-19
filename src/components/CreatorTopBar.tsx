import { Link } from 'react-router-dom'
import { PATHS, PLACEHOLDER_ROUTES } from '../routes/paths'
import { BrandLogo } from './BrandLogo'
import { Icon } from './Icon'

/**
 * Top bar of the creator home and the "Verify your email" screen (Creator PDF
 * p.5 and p.8 centre): VELVET FX logo on the left, search on the right.
 * ASSUMPTION: search opens the Discover placeholder, like the Discover tab.
 */
export function CreatorTopBar() {
  return (
    <header className="creator-top-bar">
      <Link to={PATHS.home} aria-label="VELVET FX home">
        <BrandLogo variant="horizontal" onLight className="creator-top-bar__logo" />
      </Link>
      <Link className="creator-top-bar__search" to={PLACEHOLDER_ROUTES.discover.path} aria-label="Search">
        <Icon name="search" size={24} />
      </Link>
    </header>
  )
}
