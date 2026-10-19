import type { ReactNode } from 'react'
import { useId } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import type { IconName } from './Icon'
import { ToggleSwitch } from './ToggleSwitch'

/**
 * Building blocks of the Settings, Account and Delete my account screens
 * (Delete Account PDF p.4-5): a title bar with a close (x) or back (<) button,
 * and rounded grey cards holding rows.
 */

interface SettingsHeaderProps {
  title: string
  /** "close" puts a round x on the right (Settings); "back" a round < on the left. */
  kind: 'close' | 'back'
  to: string
  label: string
}

export function SettingsHeader({ title, kind, to, label }: SettingsHeaderProps) {
  const button = (
    <Link className="settings-header__button" to={to} aria-label={label}>
      <Icon name={kind === 'close' ? 'close' : 'chevron-left'} size={kind === 'close' ? 14 : 16} />
    </Link>
  )
  return (
    <header className={`settings-header settings-header--${kind}`}>
      {kind === 'back' && button}
      <h1>{title}</h1>
      {kind === 'close' && button}
    </header>
  )
}

export function SettingsCard({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <ul className="settings-card" aria-label={label}>
      {children}
    </ul>
  )
}

export function SettingsSectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="settings-section-title">{children}</h2>
}

interface SettingsRowProps {
  icon: IconName
  label: string
  /** Destructive rows ("Delete my account") are red. */
  danger?: boolean
}

export function SettingsLinkRow({ icon, label, danger, to }: SettingsRowProps & { to: string }) {
  return (
    <li>
      <Link className={['settings-row', danger && 'settings-row--danger'].filter(Boolean).join(' ')} to={to}>
        <Icon name={icon} size={22} />
        <span className="settings-row__label">{label}</span>
        <Icon name="chevron-right" size={18} className="settings-row__chevron" />
      </Link>
    </li>
  )
}

export function SettingsButtonRow({
  icon,
  label,
  danger,
  onClick,
  disabled,
}: SettingsRowProps & { onClick: () => void; disabled?: boolean }) {
  return (
    <li>
      <button
        type="button"
        className={['settings-row', danger && 'settings-row--danger'].filter(Boolean).join(' ')}
        onClick={onClick}
        disabled={disabled}
      >
        <Icon name={icon} size={22} />
        <span className="settings-row__label">{label}</span>
      </button>
    </li>
  )
}

export function SettingsToggleRow({
  icon,
  label,
  checked,
  onChange,
}: SettingsRowProps & { checked: boolean; onChange: (checked: boolean) => void }) {
  const labelId = useId()
  return (
    <li className="settings-row settings-row--static">
      <Icon name={icon} size={22} />
      <span className="settings-row__label" id={labelId}>
        {label}
      </span>
      <ToggleSwitch checked={checked} onChange={onChange} labelledBy={labelId} />
    </li>
  )
}
