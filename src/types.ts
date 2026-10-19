export interface User {
  email: string
  displayName: string
  /** Shown as @handle in the account drawer. */
  handle: string
  walletBalance: number
}

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
}
