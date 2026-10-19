import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/Button'
import { PasswordInput } from '../components/PasswordInput'
import { PATHS } from '../routes/paths'
import { resetPassword } from '../services/api'
import { validateNewPassword } from '../utils/validation'

/**
 * Target of the link in the API's "Recovery password" e-mail:
 * /reset-password/{hash}. Not in the PDFs; built on the sign-in frame.
 */
export function ResetPasswordPage() {
  const { hash = '' } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [formError, setFormError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const nextErrors = {
      password: validateNewPassword(password),
      confirm: confirm === password ? undefined : 'The passwords do not match.',
    }
    setErrors(nextErrors)
    setFormError(undefined)
    if (nextErrors.password || nextErrors.confirm) return

    setSaving(true)
    try {
      await resetPassword(hash, password)
      navigate(PATHS.signIn, { replace: true, state: { passwordReset: true } })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <AuthLayout>
      <div className="auth__intro">
        <h1>Choose a new password</h1>
        <p>Use at least 8 characters, including a letter and a number.</p>
      </div>

      <form className="auth__stack" onSubmit={handleSubmit} noValidate>
        <PasswordInput
          label="New password"
          name="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          disabled={saving}
        />
        <PasswordInput
          label="Confirm new password"
          name="confirm"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={errors.confirm}
          disabled={saving}
        />
        {formError && (
          <p className="form-message form-message--error" role="alert">
            {formError}
          </p>
        )}
        <Button type="submit" block loading={saving} className="auth__submit">
          Update password
        </Button>
      </form>

      <Button to={PATHS.forgotPassword} variant="outline" block className="auth__alt">
        Request a new link
      </Button>
    </AuthLayout>
  )
}
