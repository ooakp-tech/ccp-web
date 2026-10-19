import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/Button'
import { useSession } from '../context/SessionContext'
import { PATHS } from '../routes/paths'
import { completeExternalSignIn } from '../services/api'
import { clearPendingOAuth, pendingReturnTo, providerName, readOAuthCallback } from '../services/oauth'

/**
 * Not in the PDF: where Google / X send the user back after their consent
 * screen (/auth/callback/google, /auth/callback/x). Finishes the sign-in and
 * continues to home, as the simulated buttons did. Shown only for a moment.
 */
export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { provider = '' } = useParams()
  const { signInAs, marketingOptIn } = useSession()
  const [error, setError] = useState<string>()
  const [returnTo] = useState(pendingReturnTo)

  useEffect(() => {
    let cancelled = false
    Promise.resolve()
      .then(() => completeExternalSignIn(readOAuthCallback(provider, location), marketingOptIn))
      .then((user) => {
        if (cancelled) return
        clearPendingOAuth()
        signInAs(user)
        // replace: drops the code / token from the URL and from history.
        navigate(PATHS.home, { replace: true })
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        clearPendingOAuth()
        setError(reason instanceof Error ? reason.message : 'Sign-in failed. Please try again.')
      })
    return () => {
      cancelled = true
    }
    // Runs once per callback URL; marketingOptIn is read at that moment.
  }, [provider, location.key]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="screen auth status-page">
      <BrandLogo variant="stacked" onLight className="auth__logo" alt="VELVET FX - Premium content platform" />
      {error ? (
        <>
          <p className="form-message form-message--error" role="alert">
            {error}
          </p>
          <Button to={returnTo} variant="outline">
            Back to {returnTo === PATHS.signUp ? 'sign up' : 'sign in'}
          </Button>
        </>
      ) : (
        <p className="status-page__text" role="status">
          <span className="spinner" aria-hidden="true" />
          Signing you in with {providerName(provider)}...
        </p>
      )}
    </div>
  )
}
