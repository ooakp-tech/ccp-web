import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthLayout, OrDivider } from '../components/AuthLayout'
import { Button } from '../components/Button'
import { PasswordInput } from '../components/PasswordInput'
import { SocialButtons } from '../components/SocialButtons'
import { TextInput } from '../components/TextInput'
import { ToggleSwitch } from '../components/ToggleSwitch'
import { useSession } from '../context/SessionContext'
import { PATHS, PLACEHOLDER_ROUTES } from '../routes/paths'
import { registerCreator, registerUser, signInWithProvider } from '../services/api'
import { beginOAuth, isProviderConfigured } from '../services/oauth'
import type { AccountRole, SocialProvider } from '../types'
import {
  validateCreatorEmail,
  validateCreatorPassword,
  validateEmail,
  validateNewPassword,
} from '../utils/validation'

/**
 * Fan PDF p.4 (left): fan sign-up - Google, X, or e-mail + password.
 * Submitting e-mail + password redirects to "Check your email" (PDF p.4 right).
 *
 * Creator PDF p.4: the same screen at /signup?type=creator, with the creator
 * password rule and messages; Sign Up leads to the "Verify your email" pop-up
 * (Creator PDF p.5), Google to the onboarding carousel (p.6).
 */
export function SignUpPage() {
  const navigate = useNavigate()
  const session = useSession()
  const [searchParams] = useSearchParams()
  const role: AccountRole = searchParams.get('type') === 'creator' ? 'creator' : 'fan'
  const isCreator = role === 'creator'

  // "Change email" / "Use a different email" on the next screen returns here with the address prefilled.
  const [email, setEmail] = useState(session.pendingRole === role ? (session.pendingEmail ?? '') : '')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [socialBusy, setSocialBusy] = useState<SocialProvider | null>(null)
  const busy = submitting || socialBusy !== null

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const nextErrors = isCreator
      ? { email: validateCreatorEmail(email), password: validateCreatorPassword(password) }
      : { email: validateEmail(email), password: validateNewPassword(password) }
    setErrors(nextErrors)
    setFormError(undefined)
    if (nextErrors.email || nextErrors.password) return

    setSubmitting(true)
    try {
      if (isCreator) {
        const { email: sentTo } = await registerCreator({ email, password, marketingOptIn: session.marketingOptIn })
        session.startVerification(sentTo, session.marketingOptIn, 'creator')
        navigate(PATHS.home)
        return
      }
      const result = await registerUser({ email, password, marketingOptIn: session.marketingOptIn })
      // Mock: "Check your email" (PDF p.4 right). API: no verification step yet, straight to home.
      if (result.kind === 'verify') session.startVerification(result.email, session.marketingOptIn)
      else session.signInAs(result.user)
      navigate(PATHS.home)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const handleSocial = async (provider: SocialProvider) => {
    setFormError(undefined)
    setSocialBusy(provider)
    try {
      // Real OAuth: leaves for the provider and comes back to OAuthCallbackPage.
      // "Stay Updated" survives the round trip in the session.
      if (isProviderConfigured(provider)) {
        await beginOAuth(provider, isCreator ? PATHS.creatorSignUp : PATHS.signUp, role)
      }
      // Social accounts arrive already verified, so they skip the e-mail step.
      session.signInAs(await signInWithProvider(provider, role))
      navigate(isCreator ? PATHS.creatorOnboarding : PATHS.home)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
      setSocialBusy(null)
    }
  }

  return (
    <AuthLayout>
      <h1 className="visually-hidden">{isCreator ? 'Sign up as a creator' : 'Sign up as a fan'}</h1>

      <SocialButtons busy={socialBusy} disabled={busy} onSelect={handleSocial} />
      <OrDivider />

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
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          disabled={busy}
        />
        {formError && (
          <p className="form-message form-message--error" role="alert">
            {formError}
          </p>
        )}
        <Button type="submit" block loading={submitting} disabled={busy} className="auth__submit">
          Sign Up
        </Button>
      </form>

      <Button to={PATHS.signIn} variant="outline" block className="auth__alt">
        Already have an account? Sign in
      </Button>

      <p className="auth__legal">
        By continuing you agree to our <Link to={PLACEHOLDER_ROUTES.terms.path}>Terms &amp; Conditions</Link>,{' '}
        <Link to={PLACEHOLDER_ROUTES.privacy.path}>Privacy Policy</Link>, Content Creator Agreement if applicable, and
        confirm that you are at least 18 years old.
      </p>

      <section className="stay-updated">
        <div className="stay-updated__row">
          <h2 id="stay-updated-title">Stay Updated</h2>
          <ToggleSwitch
            checked={session.marketingOptIn}
            onChange={session.setMarketingOptIn}
            labelledBy="stay-updated-title"
            describedBy="stay-updated-text"
          />
        </div>
        <p id="stay-updated-text">
          I want to receive email updates, offers, and recommendations from <strong>Velvet FX</strong>.
          <br />I understand that I can opt out anytime.
        </p>
      </section>
    </AuthLayout>
  )
}
