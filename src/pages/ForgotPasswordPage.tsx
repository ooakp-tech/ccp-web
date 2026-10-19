import { useState } from 'react'
import type { FormEvent } from 'react'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/Button'
import { TextInput } from '../components/TextInput'
import { PATHS } from '../routes/paths'
import { requestPasswordReset } from '../services/api'
import { validateEmail } from '../utils/validation'

/**
 * "Forgot password?" on the sign-in screen. Not in the PDFs; built on the
 * sign-in frame. The API e-mails a reset link that opens ResetPasswordPage.
 */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const [formError, setFormError] = useState<string>()
  const [sending, setSending] = useState(false)
  const [sentTo, setSentTo] = useState<string>()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const nextError = validateEmail(email)
    setError(nextError)
    setFormError(undefined)
    if (nextError) return

    setSending(true)
    try {
      await requestPasswordReset(email)
      setSentTo(email.trim())
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthLayout>
      <div className="auth__intro">
        <h1>Forgot password?</h1>
        <p>Enter the email you signed up with and we&rsquo;ll send you a link to choose a new password.</p>
      </div>

      {sentTo ? (
        <p className="form-message form-message--success" role="status">
          We sent a reset link to <strong>{sentTo}</strong>. It expires in 2 days. Didn&rsquo;t get it? Check your spam
          folder.
        </p>
      ) : (
        <form className="auth__stack" onSubmit={handleSubmit} noValidate>
          <TextInput
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={error}
            disabled={sending}
          />
          {formError && (
            <p className="form-message form-message--error" role="alert">
              {formError}
            </p>
          )}
          <Button type="submit" block loading={sending} className="auth__submit">
            Send reset link
          </Button>
        </form>
      )}

      <Button to={PATHS.signIn} variant="outline" block className="auth__alt">
        Back to sign in
      </Button>
    </AuthLayout>
  )
}
