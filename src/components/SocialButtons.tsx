import { asset } from '../config'
import type { SocialProvider } from '../types'
import { Button } from './Button'
import { Icon } from './Icon'

interface SocialButtonsProps {
  /** Provider whose (mock) sign-in is in flight, if any. */
  busy: SocialProvider | null
  disabled?: boolean
  onSelect: (provider: SocialProvider) => void
}

/**
 * "Continue with Google" / "Continue with X" - identical on sign-up and sign-in.
 * The Google mark is the official icon shipped in the asset pack; at integration
 * time prefer the button rendered by Google Identity Services.
 */
export function SocialButtons({ busy, disabled, onSelect }: SocialButtonsProps) {
  return (
    <div className="auth__stack">
      <Button
        variant="outline"
        block
        loading={busy === 'google'}
        disabled={disabled}
        onClick={() => onSelect('google')}
      >
        <img className="social-icon" src={asset('auth/google-signin-icon.svg')} alt="" />
        Continue with Google
      </Button>
      <Button variant="outline" block loading={busy === 'x'} disabled={disabled} onClick={() => onSelect('x')}>
        <Icon name="close" src={asset('auth/x-logo.svg')} size={22} />
        Continue with X
      </Button>
    </div>
  )
}
