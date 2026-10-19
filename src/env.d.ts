/// <reference types="vite/client" />

// Build-time settings read from .env / .env.local (see .env.example).
interface ImportMetaEnv {
  /** Google OAuth client ID ("Web application"). Empty = simulated Google sign-in. */
  readonly VITE_GOOGLE_CLIENT_ID?: string
  /** X OAuth 2.0 client ID. Empty = simulated X sign-in. */
  readonly VITE_X_CLIENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
