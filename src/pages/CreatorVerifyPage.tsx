import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/Button'
import { useSession } from '../context/SessionContext'
import { PATHS } from '../routes/paths'
import { verifyCreatorEmail } from '../services/api'

/**
 * Target of "Confirm your account" in the creator e-mail (Creator PDF p.5 right):
 * /creator/verify?token=... Confirms the address, signs the creator in and
 * continues to the onboarding carousel (p.6). Shown only for a moment.
 */
export function CreatorVerifyPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { signInAs } = useSession()
  const [error, setError] = useState<string>()
  const token = params.get('token') ?? ''

  useEffect(() => {
    let cancelled = false
    verifyCreatorEmail(token)
      .then((user) => {
        if (cancelled) return
        signInAs(user)
        // replace: the one-time link should not stay in history.
        navigate(PATHS.creatorOnboarding, { replace: true })
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'This confirmation link did not work.')
      })
    return () => {
      cancelled = true
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="screen auth status-page">
      <BrandLogo variant="stacked" onLight className="auth__logo" alt="VELVET FX - Premium content platform" />
      {error ? (
        <>
          <p className="form-message form-message--error" role="alert">
            {error}
          </p>
          <Button to={PATHS.creatorSignUp} variant="outline">
            Back to creator sign up
          </Button>
        </>
      ) : (
        <p className="status-page__text" role="status">
          <span className="spinner" aria-hidden="true" />
          Confirming your account...
        </p>
      )}
    </div>
  )
}
