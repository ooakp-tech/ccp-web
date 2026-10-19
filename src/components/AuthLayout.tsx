import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PATHS, PLACEHOLDER_ROUTES } from '../routes/paths'
import { BrandLogo } from './BrandLogo'

/**
 * Shared frame of the sign-up (PDF p.4) and sign-in (PDF p.6) screens: white
 * page with a purple glow, stacked company logo on top, policy links at the bottom.
 *
 * ASSUMPTION (desktop, not in the PDF): the same single form column, centred
 * on the white page (no photo since 2026-10-19).
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="screen auth">
      <div className="auth__panel">
        <header className="auth__header">
          <Link to={PATHS.landing} aria-label="VELVET FX home">
            <BrandLogo variant="stacked" onLight className="auth__logo" alt="VELVET FX - Premium content platform" />
          </Link>
        </header>

        <main className="auth__body">{children}</main>

        <footer className="auth__footer">
          <Link to={PLACEHOLDER_ROUTES.terms.path}>Terms and Conditions</Link>
          <span aria-hidden="true">|</span>
          <Link to={PLACEHOLDER_ROUTES.policies.path}>All our policies</Link>
        </footer>
      </div>
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
