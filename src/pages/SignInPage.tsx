import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout, OrDivider } from '../components/AuthLayout'
import { Button } from '../components/Button'
import { PasswordInput } from '../components/PasswordInput'
import { SocialButtons } from '../components/SocialButtons'
import { TextInput } from '../components/TextInput'
import { useSession } from '../context/SessionContext'
import { PATHS, PLACEHOLDER_ROUTES } from '../routes/paths'
import { ApiError, signIn, signInWithProvider } from '../services/api'
import { beginOAuth, isProviderConfigured } from '../services/oauth'
import type { SocialProvider } from '../types'
import { validateEmail, validateRequiredPassword } from '../utils/validation'

/**
 * PDF p.6 (left): sign-in, reached from the verification e-mail or from
 * "Login" / "Already have an account? Sign in". Success opens the home screen.
 */
export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [socialBusy, setSocialBusy] = useState<SocialProvider | null>(null)
  const busy = submitting || socialBusy !== null

  // Set by VerifyEmailPage. Not in the PDF: a one-line confirmation so the
  // redirect from the e-mail link does not feel like a dead end.
  const routeState = location.state as { verified?: boolean; accountDeleted?: boolean } | null
  const justVerified = routeState?.verified === true
  // Set by DeleteAccountPage (Delete Account PDF p.6 lands here). Also not in the PDF.
  const accountDeleted = routeState?.accountDeleted === true

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const nextErrors = { email: validateEmail(email), password: validateRequiredPassword(password) }
    setErrors(nextErrors)
    setFormError(undefined)
    if (nextErrors.email || nextErrors.password) return

    setSubmitting(true)
    try {
      session.signInAs(await signIn({ email, password }))
      navigate(PATHS.home)
    } catch (error) {
      if (error instanceof ApiError && error.code === 'EMAIL_NOT_VERIFIED') {
        // Right password, unverified address: send them back to "Check your email".
        session.startVerification(email.trim().toLowerCase(), session.marketingOptIn)
        navigate(PATHS.home)
        return
      }
      setFormError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const handleSocial = async (provider: SocialProvider) => {
    setFormError(undefined)
    setSocialBusy(provider)
    try {
      // Real OAuth: leaves for the provider and comes back to OAuthCallbackPage.
      if (isProviderConfigured(provider)) await beginOAuth(provider, PATHS.signIn)
      session.signInAs(await signInWithProvider(provider))
      navigate(PATHS.home)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
      setSocialBusy(null)
    }
  }

  return (
    <AuthLayout>
      <h1 className="visually-hidden">Sign in</h1>

      <SocialButtons busy={socialBusy} disabled={busy} onSelect={handleSocial} />
      <OrDivider />

      {justVerified && (
        <p className="form-message form-message--success" role="status">
          Your email is verified. Sign in to continue.
        </p>
      )}
      {accountDeleted && (
        <p className="form-message form-message--success" role="status">
          Your account has been deleted.
        </p>
      )}

      <form className="auth__stack" onSubmit={handleSubmit} noValidate>
        <TextInput
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          disabled={busy}
        />
        <div>
          <PasswordInput
            label="Password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            disabled={busy}
          />
          <Link className="auth__forgot" to={PLACEHOLDER_ROUTES.forgotPassword.path}>
            Forgot password?
          </Link>
        </div>
        {formError && (
          <p className="form-message form-message--error" role="alert">
            {formError}
          </p>
        )}
        <Button type="submit" block loading={submitting} disabled={busy} className="auth__submit">
          Sign In
        </Button>
      </form>

      {/* ASSUMPTION: "Join VELVET FX" opens the sign-up screen, mirroring
          "Already have an account? Sign in" on the sign-up screen. */}
      <Button to={PATHS.signUp} variant="outline" block className="auth__alt">
        <span>
          Ready to create &amp; earn? <span className="text-accent">Join VELVET FX</span>
        </span>
      </Button>
    </AuthLayout>
  )
}
