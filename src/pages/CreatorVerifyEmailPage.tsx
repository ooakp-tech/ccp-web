import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { CreatorTopBar } from '../components/CreatorTopBar'
import { Icon } from '../components/Icon'
import { MediaPlaceholder } from '../components/MediaPlaceholder'
import { DEMO_MODE } from '../config'
import { useSession } from '../context/SessionContext'
import { PATHS } from '../routes/paths'
import { resendCreatorVerification } from '../services/api'

/**
 * Creator PDF p.5 (left): "Verify your email", shown at /home right after the
 * creator signs up (the mockup's address bar shows velvetfx.com/home).
 *
 * ASSUMPTIONS (the PDF shows the controls, not their outcome):
 * - "Use a different email" returns to the creator sign-up with the address prefilled;
 * - the close (x) leaves the flow and returns to the landing screen, as on the fan screen.
 * Unlike the fan screen, the mockup has no "Verify you are human" box here.
 */
export function CreatorVerifyEmailPage({ email }: { email: string }) {
  const navigate = useNavigate()
  const session = useSession()
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string }>()

  const handleResend = async () => {
    setNotice(undefined)
    setSending(true)
    try {
      await resendCreatorVerification(email)
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
    <div className="screen creator-verify">
      <CreatorTopBar />
      <MediaPlaceholder className="creator-verify__photo" />
      {DEMO_MODE && (
        <Link className="demo-pill creator-verify__demo" to={PATHS.mockInbox}>
          Demo: open inbox
        </Link>
      )}

      <main className="creator-verify__sheet" role="dialog" aria-labelledby="creator-verify-title">
        <div className="creator-verify__head">
          <h1 id="creator-verify-title">Verify your email</h1>
          <button type="button" className="round-close" onClick={handleClose} aria-label="Close">
            <Icon name="close" size={16} />
          </button>
        </div>
        <p>
          A verification link has been sent to:
          <strong>{email}</strong>
        </p>
        <p>
          Check your inbox and click the link to verify your account and continue. If you don&rsquo;t see the email,
          please check your spam folder.
        </p>
        <p className="creator-verify__prompt">Didn&rsquo;t receive it?</p>

        <Button variant="outline" block loading={sending} onClick={handleResend}>
          Resend link
        </Button>
        {notice && (
          <p className={`form-message form-message--${notice.kind}`} role="status">
            {notice.text}
          </p>
        )}

        <Link className="creator-verify__change" to={PATHS.creatorSignUp}>
          Use a different email
        </Link>
      </main>
    </div>
  )
}
