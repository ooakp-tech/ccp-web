import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PATHS, PLACEHOLDER_ROUTES } from '../routes/paths'
import { BrandLogo } from './BrandLogo'

/**
 * Shared frame of the sign-up (PDF p.4) and sign-in (PDF p.6) screens: glowing
 * dark background, stacked company logo on top, policy links at the bottom.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="screen auth">
      <header className="auth__header">
        <Link to={PATHS.landing} aria-label="VELVET FX home">
          <BrandLogo variant="stacked" className="auth__logo" alt="VELVET FX - Premium content platform" />
        </Link>
      </header>

      <main className="auth__body">{children}</main>

      <footer className="auth__footer">
        <Link to={PLACEHOLDER_ROUTES.terms.path}>Terms and Conditions</Link>
        <span aria-hidden="true">|</span>
        <Link to={PLACEHOLDER_ROUTES.policies.path}>All our policies</Link>
      </footer>
    </div>
  )
}

export function OrDivider() {
  return (
    <div className="auth__divider" role="separator">
      <span>or</span>
    </div>
  )
}
