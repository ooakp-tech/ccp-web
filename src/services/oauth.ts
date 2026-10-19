/**
 * Browser half of "Continue with Google" / "Continue with X".
 *
 * Both providers use a full-page redirect so the PDF's own buttons can stay
 * (no provider-rendered button or popup):
 *
 *   Google - OpenID Connect, response_type=id_token. Google sends a signed ID
 *            token back in the URL fragment; the backend must validate it
 *            (signature, audience, nonce) before trusting it.
 *   X      - OAuth 2.0 Authorization Code with PKCE. X sends back a one-time
 *            code. Exchanging it needs a server: X's token endpoint does not
 *            allow browser (CORS) calls.
 *
 * Either way the result is handed to completeExternalSignIn() in ./api, which
 * is where the ASP.NET Core call goes. A provider whose client ID is not set
 * in .env stays on the old simulated sign-in, so the demo keeps working.
 *
 * Both callback URLs must be registered with the provider exactly as
 * callbackUrl() builds them, e.g. https://server/auth/callback/google.
 */
import { GOOGLE_CLIENT_ID, X_CLIENT_ID } from '../config'
import { PATHS } from '../routes/paths'
import type { ExternalAuthResult, SocialProvider } from '../types'

const PENDING_KEY = 'velvetfx.oauth'

const GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const X_AUTHORIZE_URL = 'https://x.com/i/oauth2/authorize'
// users.read is the minimum for GET /2/users/me and X requires tweet.read with it.
const X_SCOPES = 'users.read tweet.read'

/** What we remember across the redirect (sessionStorage, same tab only). */
interface PendingOAuth {
  provider: SocialProvider
  state: string
  /** Google: echoed inside the ID token, guards against replayed tokens. */
  nonce?: string
  /** X: PKCE secret, only ever sent to our own backend. */
  codeVerifier?: string
  /** Screen to go back to if the user cancels or something fails. */
  returnTo: string
}

export class OAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OAuthError'
  }
}

export function isProviderConfigured(provider: SocialProvider): boolean {
  return provider === 'google' ? GOOGLE_CLIENT_ID !== '' : X_CLIENT_ID !== ''
}

export function callbackUrl(provider: SocialProvider): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${window.location.origin}${base}${PATHS.oauthCallback}/${provider}`
}

function randomString(bytes = 32): string {
  return base64Url(crypto.getRandomValues(new Uint8Array(bytes)))
}

function base64Url(data: Uint8Array): string {
  let binary = ''
  data.forEach((byte) => (binary += String.fromCharCode(byte)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64Url(new Uint8Array(digest))
}

/** Leaves the app for the provider's consent screen. Never resolves normally. */
export async function beginOAuth(provider: SocialProvider, returnTo: string): Promise<never> {
  const state = randomString()
  const pending: PendingOAuth = { provider, state, returnTo }
  let url: URL

  if (provider === 'google') {
    pending.nonce = randomString()
    url = new URL(GOOGLE_AUTHORIZE_URL)
    url.search = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: callbackUrl('google'),
      response_type: 'id_token',
      scope: 'openid email profile',
      state,
      nonce: pending.nonce,
      prompt: 'select_account',
    }).toString()
  } else {
    pending.codeVerifier = randomString(48)
    url = new URL(X_AUTHORIZE_URL)
    url.search = new URLSearchParams({
      client_id: X_CLIENT_ID,
      redirect_uri: callbackUrl('x'),
      response_type: 'code',
      scope: X_SCOPES,
      state,
      code_challenge: await pkceChallenge(pending.codeVerifier),
      code_challenge_method: 'S256',
    }).toString()
  }

  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending))
  // Back from the consent screen may restore this page from the bfcache with
  // the button still spinning; reload it instead.
  window.addEventListener('pageshow', (event) => event.persisted && window.location.reload(), { once: true })
  window.location.assign(url.toString())
  // Keep the caller's spinner up while the browser navigates away.
  return new Promise<never>(() => {})
}

function readPending(): PendingOAuth | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    return raw ? (JSON.parse(raw) as PendingOAuth) : null
  } catch {
    return null
  }
}

/** Where to send the user back after a failed or cancelled sign-in. */
export function pendingReturnTo(): string {
  return readPending()?.returnTo ?? PATHS.signIn
}

export function clearPendingOAuth(): void {
  sessionStorage.removeItem(PENDING_KEY)
}

/**
 * Reads the provider's answer from the callback URL and checks it belongs to
 * the request this tab started. Does not clear the pending entry, so it is
 * safe to call twice (React StrictMode); call clearPendingOAuth() afterwards.
 */
export function readOAuthCallback(provider: string, location: { search: string; hash: string }): ExternalAuthResult {
  // Google answers in the fragment (id_token), X in the query string (code).
  const params = new URLSearchParams(provider === 'google' ? location.hash.replace(/^#/, '') : location.search)
  const pending = readPending()

  const error = params.get('error')
  if (error) {
    throw new OAuthError(
      error === 'access_denied'
        ? 'Sign-in was cancelled.'
        : `${providerName(provider)} sign-in failed (${error}). Please try again.`,
    )
  }
  if (!pending || pending.provider !== provider || params.get('state') !== pending.state) {
    throw new OAuthError('This sign-in link has expired. Please start again.')
  }

  if (pending.provider === 'google') {
    const idToken = params.get('id_token')
    if (!idToken || !pending.nonce) throw new OAuthError('Google did not return a sign-in token.')
    return { provider: 'google', idToken, nonce: pending.nonce }
  }

  const code = params.get('code')
  if (!code || !pending.codeVerifier) throw new OAuthError('X did not return a sign-in code.')
  return { provider: 'x', code, codeVerifier: pending.codeVerifier, redirectUri: callbackUrl('x') }
}

export function providerName(provider: string): string {
  return provider === 'x' ? 'X' : 'Google'
}
