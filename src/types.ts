/** Fan = Visitor in the API, creator = Presenter. */
export type AccountRole = 'fan' | 'creator'

export interface User {
  email: string
  role: AccountRole
  displayName: string
  /** Shown as @handle in the account drawer. */
  handle: string
  walletBalance: number
  /** JWT from the API (TokenResponse.accessToken); absent in mock mode. */
  accessToken?: string
  /** Visitor (fan) id in the API. */
  visitorId?: string
}

/**
 * Outcome of the Sign Up button. The mock follows the PDF (verification
 * e-mail, then "Check your email"); the real API has no verification step yet
 * and signs the new fan in straight away.
 */
export type RegistrationResult = { kind: 'verify'; email: string } | { kind: 'signed-in'; user: User }

export interface RegistrationData {
  email: string
  password: string
  /** "Stay Updated" toggle on the sign-up screen. */
  marketingOptIn: boolean
}

export interface Credentials {
  email: string
  password: string
}

export type SocialProvider = 'google' | 'x'

/**
 * What the provider hands back after its consent screen, ready to be sent to
 * the backend (see services/oauth.ts).
 */
export type ExternalAuthResult =
  | { provider: 'google'; idToken: string; nonce: string }
  | { provider: 'x'; code: string; codeVerifier: string; redirectUri: string }

/** The verification e-mail as shown on PDF page 5 (demo inbox only). */
export interface VerificationMessage {
  to: string
  token: string
  sentAt: string
  /** Fan: "Verify your VELVET FX account" (Fan PDF p.5). Creator: "Confirm your VELVET FX account" (Creator PDF p.5). */
  role: AccountRole
}
