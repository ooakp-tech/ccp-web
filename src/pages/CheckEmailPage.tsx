import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/Button'
import { HumanCheck } from '../components/HumanCheck'
import { Icon } from '../components/Icon'
import { DEMO_MODE } from '../config'
import { useSession } from '../context/SessionContext'
import { PATHS } from '../routes/paths'
import { resendVerificationEmail } from '../services/api'

/**
 * PDF p.4 (right): "Check your email", shown at /home right after sign-up
 * while the address is still unverified.
 *
 * ASSUMPTIONS (the PDF shows the buttons but not their outcome):
 * - "Send again" needs the "Verify you are human" check first - that is what
 *   the Cloudflare widget on this screen protects.
 * - "Change email" returns to the sign-up form with the address prefilled.
 * - The close (x) button leaves the flow and returns to the landing screen.
 */
export function CheckEmailPage({ email }: { email: string }) {
  const navigate = useNavigate()
  const session = useSession()
  const [humanToken, setHumanToken] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string }>()
  const [humanError, setHumanError] = useState<string>()

  const handleResend = async () => {
    setNotice(undefined)
    if (!humanToken) {
      setHumanError('Please confirm you are human first.')
      return
    }
    setSending(true)
    try {
      await resendVerificationEmail(email, humanToken)
      setNotice({ kind: 'success', text: 'We sent a new link. Please check your inbox.' })
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Could not send the email.' })
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    session.clearSession()
    navigate(PATHS.landing)
  }

  return (
    <div className="screen check-email">
      {/* ASSUMPTION (2026-10-19, at the user's request): the photo is replaced by
          the sign-up page's centred logo on the white, purple-glow page. */}
      <header className="check-email__header">
        <BrandLogo variant="stacked" onLight className="auth__logo" alt="VELVET FX - Premium content platform" />
        {DEMO_MODE && (
          <Link className="demo-pill" to={PATHS.mockInbox}>
            Demo: open inbox
          </Link>
        )}
      </header>

      <main className="check-email__dialog" role="dialog" aria-labelledby="check-email-title">
        <button type="button" className="round-close" onClick={handleClose} aria-label="Close">
          <Icon name="close" size={18} />
        </button>
        <h1 id="check-email-title">Check your email</h1>
        <p className="check-email__sent">
          We sent a link to:
          <strong>{email}</strong>
        </p>
        <p>
          Check your email inbox to verify and continue. Didn&apos;t receive the email? Please check your spam folder.
        </p>
        <p className="check-email__prompt">Haven&apos;t found it?</p>

        <Button variant="deep" block loading={sending} onClick={handleResend}>
          Send again
        </Button>
        {notice && (
          <p className={`form-message form-message--${notice.kind}`} role="status">
            {notice.text}
          </p>
        )}

        <Link className="check-email__change" to={PATHS.signUp}>
          Change email
        </Link>

        <HumanCheck
          onChange={(token) => {
            setHumanToken(token)
            setHumanError(undefined)
          }}
          error={humanError}
        />
      </main>
    </div>
  )
}
