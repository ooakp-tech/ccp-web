/**
 * App-wide switches.
 *
 * API_BASE_URL is the ModelFeed ASP.NET Core API (hosted at
 * https://velvet.love/api, controllers under /api/..., hence /api/api).
 * Set by VITE_API_BASE_URL in .env.development / .env.production; an empty
 * value switches every call in services/api.ts back to the in-browser mocks.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL?.trim() ?? '').replace(/\/$/, '')
export const USE_MOCK_API = API_BASE_URL === ''

/**
 * DEMO_MODE exists only for the mocks: with no real mail server, the "Verify
 * your account" e-mail (PDF page 5) is rendered inside the app at /mock-inbox
 * so the whole flow stays clickable. The real API has no e-mail verification
 * step yet, so the demo inbox is off whenever the API is used.
 */
export const DEMO_MODE = USE_MOCK_API

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
