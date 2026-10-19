/**
 * App-wide switches.
 *
 * DEMO_MODE exists only because there is no backend yet: with no real mail
 * server, the "Verify your account" e-mail (PDF page 5) is rendered inside the
 * app at /mock-inbox so the whole flow stays clickable. Set it to false (or
 * delete the mock-inbox route) once the ASP.NET Core API sends real e-mails.
 */
export const DEMO_MODE = true

/** Simulated network latency for the placeholder API, in milliseconds. */
export const MOCK_LATENCY_MS = 700

/**
 * OAuth client IDs for "Continue with Google" / "Continue with X", from
 * .env.local (see .env.example). Empty keeps that provider simulated.
 */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? ''
export const X_CLIENT_ID = import.meta.env.VITE_X_CLIENT_ID?.trim() ?? ''

export const SUPPORT_EMAIL = 'support@velvetfx.com'

/** Resolves a file under public/assets against the configured Vite `base`. */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}assets/${path}`
}
