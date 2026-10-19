import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { TextInput } from '../components/TextInput'
import { PATHS, PLACEHOLDER_ROUTES } from '../routes/paths'

/** The mockup shows 9 step dots with this step first; steps 2-9 are phase 2. */
const ONBOARDING_STEPS = 9
const REFERRAL_KEY = 'velvetfx.creator.referralCode'
/** ASSUMPTION: codes look like the example "AXT-563" - letters, digits and dashes. */
const CODE_PATTERN = /^[A-Z0-9]+(-[A-Z0-9]+)*$/

/**
 * Creator PDF p.8 (right): "Have a referral code?", opened by "Start Monetizing".
 *
 * ASSUMPTIONS (phase 1 of the Creator PDF stops here):
 * - Proceed and Skip this step both continue to the next onboarding step,
 *   a placeholder until phase 2 is designed;
 * - the API has no referral field yet, so a code is kept in sessionStorage
 *   (TODO: send it to the API with the next onboarding step);
 * - < returns to the carousel, x closes onboarding and goes to the creator home.
 */
export function CreatorReferralPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string>()

  const next = () => navigate(PLACEHOLDER_ROUTES.creatorSetup.path)

  const handleProceed = (event: FormEvent) => {
    event.preventDefault()
    const value = code.trim().toUpperCase()
    if (value && (value.length < 3 || value.length > 20 || !CODE_PATTERN.test(value))) {
      setError('Enter a code like AXT-563, or skip this step.')
      return
    }
    try {
      if (value) sessionStorage.setItem(REFERRAL_KEY, value)
    } catch {
      // Storage unavailable: the code is simply not remembered.
    }
    next()
  }

  return (
    <div className="screen referral">
      <header className="referral__bar">
        <Link className="referral__icon-button" to={PATHS.creatorOnboarding} aria-label="Back">
          <Icon name="chevron-left" size={20} />
        </Link>
        <div className="referral__progress">
          <span className="referral__bar-title">Referrals</span>
          <ol className="referral__steps" aria-label={`Step 1 of ${ONBOARDING_STEPS}`}>
            {Array.from({ length: ONBOARDING_STEPS }, (_, step) => (
              <li key={step} className={step === 0 ? 'is-current' : undefined} />
            ))}
          </ol>
        </div>
        <Link className="referral__icon-button" to={PATHS.home} aria-label="Close">
          <Icon name="close" size={16} />
        </Link>
      </header>

      <form className="referral__form" onSubmit={handleProceed} noValidate>
        <div className="referral__content">
          <h1>Have a referral code?</h1>
          <p>(Optional) Enter your exclusive invitation code here.</p>
          <TextInput
            label="Referral code (optional)"
            placeholder="Example: AXT-563"
            name="referralCode"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={20}
            value={code}
            onChange={(event) => {
              setCode(event.target.value)
              setError(undefined)
            }}
            error={error}
          />
        </div>

        <div className="referral__actions">
          <Button type="submit" block>
            Proceed
          </Button>
          <button type="button" className="referral__skip" onClick={next}>
            Skip this step
          </button>
        </div>
      </form>
    </div>
  )
}
