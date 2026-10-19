/**
 * API layer: every call the UI makes to the backend goes through this module.
 *
 * Backend: the ModelFeed ASP.NET Core API hosted at https://velvet.love/api
 * (Swagger: https://velvet.love/api/index.html). A fan is a "Visitor" there.
 *
 *   Screen / button                  Endpoint (relative to API_BASE_URL = /api/api)
 *   Sign Up                          POST  /Visitor                 { name, user: { login, password } }
 *   Sign In                          POST  /Auth/login              { login, password }
 *   Continue with Google             POST  /Visitor/google          { idToken, nonce }
 *   Forgot password?                 POST  /Auth/forgetpassword     { email, url }
 *   Reset password (e-mail link)     POST  /Auth/changepassword     { hash, password }
 *   DELETE MY ACCOUNT                PATCH /Visitor/deactivate      (Bearer token)
 *
 * With VITE_API_BASE_URL empty (USE_MOCK_API) each function falls back to the
 * in-browser mock below, which keeps data in ./mockDb (sessionStorage).
 */
import { MOCK_LATENCY_MS, USE_MOCK_API } from '../config'
import type {
  Credentials,
  ExternalAuthResult,
  RegistrationData,
  RegistrationResult,
  SocialProvider,
  User,
  VerificationMessage,
} from '../types'
import { HttpError, TIMEOUT_STATUS, apiRequest } from './http'
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
  | 'NOT_SUPPORTED'
  | 'SESSION_EXPIRED'
  | 'NETWORK'
  | 'SERVER'
  | 'UNKNOWN'

export class ApiError extends Error {
  readonly code: ApiErrorCode

  constructor(code: ApiErrorCode, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

/** Turns an HttpError from ./http into an ApiError the screens understand. */
function toApiError(error: unknown, rules: { code: ApiErrorCode; when: RegExp; message?: string }[] = []): ApiError {
  if (error instanceof ApiError) return error
  if (!(error instanceof HttpError)) return new ApiError('UNKNOWN', 'Something went wrong. Please try again.')
  if (error.status === 0) return new ApiError('NETWORK', error.message)
  // 5xx or our own timeout: the API itself is failing, not the fan's input.
  if (error.status >= 500 || error.status === TIMEOUT_STATUS) return new ApiError('SERVER', error.message)
  if (error.status === 401 || error.status === 403) return new ApiError('SESSION_EXPIRED', error.message)
  const haystack = `${error.codes.join(' ')} ${error.message}`
  const rule = rules.find((candidate) => candidate.when.test(haystack))
  return rule ? new ApiError(rule.code, rule.message ?? error.message) : new ApiError('UNKNOWN', error.message)
}

// ---------- API response shapes (camelCase JSON from ASP.NET Core) ----------

/** TokenResponse */
interface ApiToken {
  authenticated: boolean
  accessToken: string
  expiration: string
  visitorId?: string | null
  name?: string | null
}

/** VisitorResponse (only the fields the UI reads) */
interface ApiVisitor {
  id: string
  name?: string | null
  user?: { login?: string | null } | null
  token?: ApiToken | null
}

function delay<T>(value: T, ms = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/**
 * ASSUMPTION: the sign-up form only collects e-mail + password, yet the account
 * drawer (PDF page 6) shows a name and @handle. The API needs a name too, so
 * both are derived from the e-mail address ("jane.doe@x.com" -> "Jane Doe",
 * "@jane-doe-966") unless the API or Google supplies a name.
 */
function toUser(email: string, displayName?: string | null): User {
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

function fromToken(email: string, token: ApiToken): User {
  return { ...toUser(email, token.name), accessToken: token.accessToken, visitorId: token.visitorId ?? undefined }
}

/** Where the reset link in the "Recovery password" e-mail points (the API appends /{hash}). */
export function resetPasswordBaseUrl(): string {
  return `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}/reset-password`
}

// ---------- Sign up ----------

/**
 * Sign Up button. API: POST /Visitor creates an active fan and returns a token.
 *
 * The deployed API (before the 2026-10-19 fix in VisitorService) saves the fan
 * and then fails on a creator welcome message, answering 400 although the
 * account exists. Signing in with the same credentials recovers from that;
 * remove the fallback once the fixed API is published.
 */
export async function registerUser(data: RegistrationData): Promise<RegistrationResult> {
  if (USE_MOCK_API) return mockRegisterUser(data)

  const email = data.email.trim()
  try {
    const visitor = await apiRequest<ApiVisitor>('/Visitor', {
      method: 'POST',
      body: { name: toUser(email).displayName, user: { login: email, password: data.password } },
    })
    if (!visitor.token?.accessToken) return { kind: 'signed-in', user: await signIn({ email, password: data.password }) }
    return { kind: 'signed-in', user: fromToken(visitor.user?.login ?? email, visitor.token) }
  } catch (error) {
    const apiError = toApiError(error, [
      { code: 'EMAIL_TAKEN', when: /already exists/i, message: 'An account with this email already exists. Sign in instead.' },
    ])
    // Only a normal 400 answer can be the deployed API's "saved, then failed" case;
    // after a crash, timeout or network error a sign-in attempt would only double the wait.
    if (apiError.code !== 'UNKNOWN') throw apiError
    try {
      return { kind: 'signed-in', user: await signIn({ email, password: data.password }) }
    } catch {
      throw apiError
    }
  }
}

async function mockRegisterUser(data: RegistrationData): Promise<RegistrationResult> {
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
  return delay({ kind: 'verify', email })
}

// ---------- E-mail verification (mock only: the API has no verification step yet) ----------

/**
 * "Send again" on the Check your email screen.
 * TODO: call API once it sends verification e-mails - POST /Auth/resend-verification { email, humanToken }
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
 * TODO: call API once it sends verification e-mails - POST /Auth/verify-email { token }
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

// ---------- Sign in ----------

/** E-mail + password sign-in. API: POST /Auth/login (deactivated fans are refused). */
export async function signIn(credentials: Credentials): Promise<User> {
  if (USE_MOCK_API) return mockSignIn(credentials)

  const email = credentials.email.trim()
  try {
    const token = await apiRequest<ApiToken>('/Auth/login', {
      method: 'POST',
      body: { login: email, password: credentials.password },
    })
    return fromToken(email, token)
  } catch (error) {
    throw toApiError(error, [
      { code: 'INVALID_CREDENTIALS', when: /Username\/Password|invalid/i, message: 'Incorrect email or password.' },
    ])
  }
}

async function mockSignIn(credentials: Credentials): Promise<User> {
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

// ---------- Google / X ----------

/**
 * "Continue with Google" / "Continue with X" when the provider has no client ID
 * (see services/oauth.ts). Mock: signs in a demo fan. With the API there is
 * nothing to fall back to, so the button reports that sign-in is unavailable.
 */
export async function signInWithProvider(provider: SocialProvider): Promise<User> {
  if (!USE_MOCK_API) {
    throw new ApiError(
      'NOT_SUPPORTED',
      `Sign-in with ${provider === 'x' ? 'X' : 'Google'} is not available yet. Please use your email and password.`,
    )
  }
  return delay(toUser(`${provider}.fan@example.com`))
}

/** Reads the claims of a JWT WITHOUT checking its signature - mock and display only. */
function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const part = jwt.split('.')[1] ?? ''
  const binary = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
  const json = new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)))
  return JSON.parse(json) as Record<string, unknown>
}

/**
 * Finishes a real Google / X sign-in after the provider redirected back.
 * Google, API: POST /Visitor/google { idToken, nonce } - the server verifies the
 * token and signs in, or creates, the fan with that e-mail.
 * X: the API has no endpoint yet (it would have to exchange the code with
 * POST https://api.x.com/2/oauth2/token server-side).
 */
export async function completeExternalSignIn(result: ExternalAuthResult, marketingOptIn: boolean): Promise<User> {
  void marketingOptIn // TODO: the API has no "Stay Updated" field yet
  if (USE_MOCK_API) return mockCompleteExternalSignIn(result)

  if (result.provider !== 'google') {
    throw new ApiError('NOT_SUPPORTED', 'Sign-in with X is not available yet. Please use Google or your email.')
  }
  try {
    const visitor = await apiRequest<ApiVisitor>('/Visitor/google', {
      method: 'POST',
      body: { idToken: result.idToken, nonce: result.nonce },
    })
    if (!visitor.token) throw new ApiError('UNKNOWN', 'Google sign-in did not complete. Please try again.')
    const email = visitor.user?.login ?? String(decodeJwtPayload(result.idToken).email ?? '')
    return fromToken(email, visitor.token)
  } catch (error) {
    throw toApiError(error)
  }
}

async function mockCompleteExternalSignIn(result: ExternalAuthResult): Promise<User> {
  if (result.provider === 'google') {
    // The mock trusts the token's claims; the API verifies the signature.
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

// ---------- Password reset ----------

/**
 * "Forgot password?" API: POST /Auth/forgetpassword { email, url }. The API
 * e-mails a link to `${url}/${hash}`, which opens ResetPasswordPage.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  if (USE_MOCK_API) return delay(undefined)
  try {
    await apiRequest<string>('/Auth/forgetpassword', {
      method: 'POST',
      body: { email: email.trim(), url: resetPasswordBaseUrl() },
    })
  } catch (error) {
    throw toApiError(error, [
      { code: 'NOT_FOUND', when: /does not exist/i, message: 'We could not find an account with this email.' },
    ])
  }
}

/** New password from the reset link. API: POST /Auth/changepassword { hash, password }. */
export async function resetPassword(hash: string, password: string): Promise<void> {
  if (USE_MOCK_API) return delay(undefined)
  try {
    await apiRequest<string>('/Auth/changepassword', { method: 'POST', body: { hash, password } })
  } catch (error) {
    throw toApiError(error, [
      { code: 'INVALID_TOKEN', when: /Hash|invalid/i, message: 'This reset link is invalid or has expired. Request a new one.' },
    ])
  }
}

// ---------- Sign out / delete ----------

/** The API issues stateless JWTs, so signing out only drops the token client-side. */
export async function signOut(): Promise<void> {
  return delay(undefined, USE_MOCK_API ? 200 : 0)
}

/**
 * Delete account flow (Delete Account PDF p.5): "DELETE MY ACCOUNT".
 * API: PATCH /Visitor/deactivate - the fan and its user are deactivated, so
 * the e-mail can no longer sign in (and can sign up again as a new account).
 * TODO: the API has nowhere to store `reason` yet.
 */
export async function deleteAccount(user: User, reason: string): Promise<void> {
  void reason
  if (USE_MOCK_API) {
    deleteUser(user.email)
    return delay(undefined)
  }
  if (!user.accessToken) throw new ApiError('SESSION_EXPIRED', 'Your session has expired. Please sign in again.')
  try {
    await apiRequest<unknown>('/Visitor/deactivate', { method: 'PATCH', token: user.accessToken })
  } catch (error) {
    throw toApiError(error)
  }
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
