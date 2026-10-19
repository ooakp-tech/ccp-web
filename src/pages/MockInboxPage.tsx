import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { SUPPORT_EMAIL, asset } from '../config'
import { useSession } from '../context/SessionContext'
import { PATHS } from '../routes/paths'
import { getVerificationMessage } from '../services/api'
import type { VerificationMessage } from '../types'

function formatSentAt(iso: string): string {
  const date = new Date(iso)
  const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${day} at ${time}`
}

/**
 * DEMO ONLY - stands in for the user's mailbox (PDF p.5).
 *
 * In production this screen does not exist: the e-mail is sent by the backend
 * and opened in the user's own mail app. The card below reproduces the e-mail
 * from the mockup so it can double as the reference for the HTML e-mail
 * template; the mail-client chrome around it is reduced to a header.
 */
export function MockInboxPage() {
  const { pendingEmail } = useSession()
  const [message, setMessage] = useState<VerificationMessage | null>()

  useEffect(() => {
    let cancelled = false
    if (!pendingEmail) {
      setMessage(null)
      return
    }
    getVerificationMessage(pendingEmail).then((result) => {
      if (!cancelled) setMessage(result)
    })
    return () => {
      cancelled = true
    }
  }, [pendingEmail])

  // Creator PDF p.5 shows the creator variant: "Confirm your VELVET FX account".
  const isCreator = message?.role === 'creator'

  return (
    <div className="screen mail">
      <header className="mail__bar">
        <Link className="mail__back" to={pendingEmail ? PATHS.home : PATHS.landing}>
          <Icon name="chevron-left" size={26} />
          Inbox
        </Link>
        <span className="mail__demo">Simulated mailbox</span>
      </header>

      {message === undefined && <p className="mail__empty">Loading...</p>}

      {message === null && (
        <p className="mail__empty">
          No messages. <Link to={PATHS.signUp}>Sign up</Link> to receive the verification email.
        </p>
      )}

      {message && (
        <>
          <section className="mail__head">
            <h1>{isCreator ? 'Confirm your VELVET FX account' : 'Verify your VELVET FX account'}</h1>
            <div className="mail__sender">
              <img src={asset('email/velvet-sender-avatar.png')} alt="" width={50} height={50} />
              <div>
                <strong>VELVET FX</strong>
                <span>
                  To: me · {formatSentAt(message.sentAt)}
                </span>
              </div>
            </div>
          </section>

          <main className="mail__body">
            <article className="mail-card">
              <div className="mail-card__content">
                <img className="mail-card__logo" src={asset('email/velvet-email-logo.svg')} alt="VELVET FX" />
                <h2>Welcome to VELVET FX</h2>
                {isCreator ? (
                  <p>You&apos;re almost there. Confirm your email address and your account will be ready to go.</p>
                ) : (
                  <p>
                    We&apos;re excited to have you here. Verify your email to activate your account and get started on
                    the <strong>VELVET FX</strong> platform — we&apos;re thrilled about your sign-up.
                  </p>
                )}
                <Link
                  className="mail-card__cta"
                  to={`${isCreator ? PATHS.creatorVerify : PATHS.verifyEmail}?token=${encodeURIComponent(message.token)}`}
                >
                  {isCreator ? 'Confirm your account' : 'Verify your account'}
                  {!isCreator && <Icon name="arrow-right" size={20} />}
                </Link>
                <p className="mail-card__small">
                  {isCreator
                    ? 'This verification link expires in 24 hours, so please don2019t wait too long.'
                    : 'This link expires in 24 hours, so don2019t wait too long.'}
                </p>
                <p className="mail-card__small">
                  Didn&apos;t sign up for VELVET FX? Ignore this email, or let us know at{' '}
                  <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                </p>
              </div>
              <footer className="mail-card__footer">
                <strong>VELVET FX Support Team</strong>
                <span>Manage your notifications</span>
              </footer>
            </article>
            <p className="mail__legal">
              © 2026 VELVET FX
              <br />
              VELVET FX is a registered mark under One-of-a-Kind-Partners, Inc.
            </p>
          </main>
        </>
      )}
    </div>
  )
}
