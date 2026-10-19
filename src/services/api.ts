/**
 * Placeholder API layer.
 *
 * Every call the UI makes to the (future) ASP.NET Core backend goes through
 * this module, so wiring the real API later means replacing the bodies below
 * and nothing else. Each function documents the endpoint it stands in for.
 * Until then they simulate latency with setTimeout and keep data in the
 * sessionStorage-backed mock in ./mockDb.
 *
 * Suggested real implementation:
 *   const res = await fetch(`/api/...`, { method: 'POST', credentials: 'include',
 *     headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
 *   if (!res.ok) throw new ApiError(code, message)   // map ProblemDetails -> ApiError
 *   return res.json()
 */
import { MOCK_LATENCY_MS } from '../config'
import type {
  Credentials,
  ExternalAuthResult,
  RegistrationData,
  SocialProvider,
  User,
  VerificationMessage,
} from '../types'
import {
  checksum,
  deleteUser,
  findUser,
  findUserByToken,
  newToken,
  normalizeEmail,
  saveUser,
} from './mockDb'

export type ApiErrorCode =
  | 'EMAIL_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_VERIFIED'
  | 'INVALID_TOKEN'
  | 'NOT_FOUND'

export class ApiError extends Error {
  readonly code: ApiErrorCode

  constructor(code: ApiErrorCode, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

function delay<T>(value: T, ms = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/**
 * ASSUMPTION: the sign-up form only collects e-mail + password, yet the account
 * drawer (PDF page 6) shows a name and @handle. The backend will own this; the
 * mock derives both from the e-mail address ("jane.doe@x.com" -> "Jane Doe",
 * "@jane-doe-966").
 */
function toUser(email: string, displayName?: string): User {
  const parts = normalizeEmail(email)
    .split('@')[0]
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
  const words = parts.length > 0 ? parts : ['fan']
  return {
    email: normalizeEmail(email),
    displayName: displayName || words.map((word) => word[0].toUpperCase() + word.slice(1)).join(' '),
    handle: `${words.join('-')}-966`,
    walletBalance: 0,
  }
}

/**
 * Creates the fan account and sends the verification e-mail.
 * TODO: call API - POST /api/auth/register { email, password, marketingOptIn }
 */
export async function registerUser(data: RegistrationData): Promise<{ email: string }> {
  const email = normalizeEmail(data.email)
  if (findUser(email)?.verified) {
    await delay(null)
    throw new ApiError('EMAIL_TAKEN', 'An account with this email already exists. Sign in instead.')
  }
  // Registering again with an unverified address simply restarts verification.
  saveUser({
    email,
    passwordChecksum: checksum(data.password),
    verified: false,
    verificationToken: newToken(),
    verificationSentAt: new Date().toISOString(),
    marketingOptIn: data.marketingOptIn,
  })
  return delay({ email })
}

/**
 * "Send again" on the Check your email screen.
 * TODO: call API - POST /api/auth/resend-verification { email, humanToken }
 */
export async function resendVerificationEmail(email: string, humanToken: string): Promise<void> {
  void humanToken // the real API validates the Cloudflare Turnstile token server-side
  const user = findUser(email)
  if (!user) {
    await delay(null)
    throw new ApiError('NOT_FOUND', 'We could not find a sign-up for this email.')
  }
  if (!user.verified) {
    saveUser({ ...user, verificationToken: newToken(), verificationSentAt: new Date().toISOString() })
  }
  return delay(undefined)
}

/**
 * "Verify you are human" widget.
 * TODO: replace with the real Cloudflare Turnstile widget; it yields this token
 * client-side and the backend verifies it - there is no API call of ours here.
 */
export async function verifyHumanChallenge(): Promise<string> {
  return delay(`mock-turnstile-${newToken()}`, 900)
}

/**
 * Target of the "Verify your account" button in the e-mail.
 * TODO: call API - POST /api/auth/verify-email { token }
 * Idempotent on purpose: opening the same link twice still succeeds.
 */
export async function verifyEmail(token: string): Promise<{ email: string }> {
  const user = findUserByToken(token)
  if (!user) {
    await delay(null)
    throw new ApiError('INVALID_TOKEN', 'This verification link is invalid or has expired.')
  }
  saveUser({ ...user, verified: true })
  return delay({ email: user.email })
}

/**
 * E-mail + password sign-in.
 * TODO: call API - POST /api/auth/login { email, password } (sets the auth cookie / returns a JWT)
 */
export async function signIn(credentials: Credentials): Promise<User> {
  const user = findUser(credentials.email)
  if (!user || user.passwordChecksum !== checksum(credentials.password)) {
    await delay(null)
    throw new ApiError('INVALID_CREDENTIALS', 'Incorrect email or password.')
  }
  if (!user.verified) {
    await delay(null)
    throw new ApiError('EMAIL_NOT_VERIFIED', 'Please verify your email before signing in.')
  }
  return delay(toUser(user.email))
}

/**
 * "Continue with Google" / "Continue with X" when the provider has no client ID
 * in .env (see services/oauth.ts). DEMO ONLY: skips the provider's consent
 * screen and signs in a demo fan. Delete once both providers are configured.
 */
export async function signInWithProvider(provider: SocialProvider): Promise<User> {
  return delay(toUser(`${provider}.fan@example.com`))
}

/** Reads the claims of a JWT WITHOUT checking its signature - display only. */
function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const part = jwt.split('.')[1] ?? ''
  const binary = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
  const json = new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)))
  return JSON.parse(json) as Record<string, unknown>
}

/**
 * Finishes a real Google / X sign-in after the provider redirected back.
 * Creates the fan account on first use (social accounts skip e-mail
 * verification) and signs it in.
 *
 * TODO: call API - POST /api/auth/external/{provider}
 *   google: { idToken, nonce, marketingOptIn }
 *           validate with GoogleJsonWebSignature.ValidateAsync (audience = client ID)
 *           and check the token's nonce claim equals `nonce`.
 *   x:      { code, codeVerifier, redirectUri, marketingOptIn }
 *           POST https://api.x.com/2/oauth2/token (grant_type=authorization_code,
 *           client_id, code_verifier, redirect_uri) then GET /2/users/me.
 *           Must be server-side: X blocks this exchange from browsers (CORS).
 */
export async function completeExternalSignIn(result: ExternalAuthResult, marketingOptIn: boolean): Promise<User> {
  void marketingOptIn // stored by the backend when it creates the account
  if (result.provider === 'google') {
    // The mock trusts the token's claims; the real backend must verify the signature.
    let claims: Record<string, unknown>
    try {
      claims = decodeJwtPayload(result.idToken)
    } catch {
      await delay(null)
      throw new ApiError('INVALID_TOKEN', 'Google returned an unreadable sign-in token.')
    }
    if (claims.nonce !== result.nonce || typeof claims.email !== 'string') {
      await delay(null)
      throw new ApiError('INVALID_TOKEN', 'Google sign-in could not be confirmed. Please try again.')
    }
    return delay(toUser(claims.email, typeof claims.name === 'string' ? claims.name : undefined))
  }
  // Without a backend the X code cannot be exchanged, so the real X profile is
  // unknown here: the consent screen was real, the signed-in fan is a demo one.
  return delay(toUser('x.fan@example.com', 'X Fan'))
}

/**
 * TODO: call API - POST /api/auth/logout
 */
export async function signOut(): Promise<void> {
  return delay(undefined, 200)
}

/**
 * Delete account flow (Delete Account PDF p.5): "DELETE MY ACCOUNT" in the
 * "Why are you deleting your account?" pop-up.
 * TODO: call API - DELETE /api/account  body: { reason }
 *   The backend deletes the profile, data and history, ends every session and
 *   stores the optional reason for product feedback. Expected: 204.
 */
export async function deleteAccount(email: string, reason: string): Promise<void> {
  void reason // kept by the backend; the mock has nowhere to send it
  deleteUser(email)
  return delay(undefined)
}

/**
 * DEMO ONLY - lets /mock-inbox show the e-mail a real mail server would have
 * delivered. There is no production equivalent; remove with the mock inbox.
 */
export async function getVerificationMessage(email: string): Promise<VerificationMessage | null> {
  const user = findUser(email)
  if (!user || user.verified) return delay(null, 200)
  return delay({ to: user.email, token: user.verificationToken, sentAt: user.verificationSentAt }, 200)
}
