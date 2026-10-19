import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/Button'
import { useSession } from '../context/SessionContext'
import { PATHS } from '../routes/paths'
import { verifyEmail } from '../services/api'

/**
 * Landing point of the "Verify your account" button in the e-mail (PDF p.5).
 * Confirms the token, then redirects to sign-in exactly as PDF p.6 describes
 * ("...I was redirected to this screen"). The user only sees this for a moment.
 */
export function VerifyEmailPage() {
  const navigate = useNavigate()
  const { completeVerification } = useSession()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [error, setError] = useState<string | undefined>(
    token ? undefined : 'This verification link is incomplete.',
  )

  useEffect(() => {
    if (!token) return
    let cancelled = false
    verifyEmail(token)
      .then(() => {
        if (cancelled) return
        completeVerification()
        navigate(PATHS.signIn, { replace: true, state: { verified: true } })
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'We could not verify your email.')
      })
    return () => {
      cancelled = true
    }
  }, [token, completeVerification, navigate])

  return (
    <div className="screen auth status-page">
      <BrandLogo variant="stacked" onLight className="auth__logo" alt="VELVET FX - Premium content platform" />
      {error ? (
        <>
          <p className="form-message form-message--error" role="alert">
            {error}
          </p>
          <Button to={PATHS.signUp} variant="outline">
            Back to sign up
          </Button>
        </>
      ) : (
        <p className="status-page__text" role="status">
          <span className="spinner" aria-hidden="true" />
          Verifying your account...
        </p>
      )}
    </div>
  )
}
