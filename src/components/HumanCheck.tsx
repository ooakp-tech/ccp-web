import { useState } from 'react'
import { verifyHumanChallenge } from '../services/api'

interface HumanCheckProps {
  /** Token to send with the protected request, or null while unverified. */
  onChange: (token: string | null) => void
  error?: string
}

/**
 * PLACEHOLDER for the Cloudflare Turnstile widget on "Check your email" (PDF p.4).
 * It reproduces the box and its behaviour so the flow is testable offline.
 * TODO: render the real widget here (https://developers.cloudflare.com/turnstile/)
 * and pass its token to onChange - the asset pack requires the provider's own
 * widget in production, so no Cloudflare artwork is bundled.
 */
export function HumanCheck({ onChange, error }: HumanCheckProps) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'verified'>('idle')

  const handleClick = async () => {
    if (status !== 'idle') return
    setStatus('checking')
    const token = await verifyHumanChallenge()
    setStatus('verified')
    onChange(token)
  }

  return (
    <div className="human-check-wrap">
      <div className={`human-check${error ? ' human-check--invalid' : ''}`}>
        <button
          type="button"
          role="checkbox"
          aria-checked={status === 'verified'}
          aria-busy={status === 'checking' || undefined}
          className={`human-check__box human-check__box--${status}`}
          onClick={handleClick}
        >
          <span className="human-check__mark" aria-hidden="true" />
          <span className="human-check__label">
            {status === 'checking' ? 'Verifying...' : status === 'verified' ? 'Success!' : 'Verify you are human'}
          </span>
        </button>
        <div className="human-check__brand">
          <span className="human-check__brand-name">CLOUDFLARE</span>
          <span className="human-check__links">
            <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">
              Privacy
            </a>
            <span aria-hidden="true"> · </span>
            <a href="https://developers.cloudflare.com/turnstile/" target="_blank" rel="noreferrer">
              Help
            </a>
          </span>
        </div>
      </div>
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
