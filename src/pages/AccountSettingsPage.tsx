import { SettingsCard, SettingsHeader, SettingsLinkRow } from '../components/Settings'
import { SignedInLayout } from '../components/SignedInLayout'
import { PATHS, PLACEHOLDER_ROUTES } from '../routes/paths'
import type { User } from '../types'

/**
 * Delete Account PDF p.5 (left): Account, opened from Settings > Account.
 * ASSUMPTION: "Account Info" and "Password and security settings" are crossed
 * out in the mockup ("not set up yet") and open the placeholder page.
 */
export function AccountSettingsPage({ user }: { user: User }) {
  return (
    <SignedInLayout user={user} className="settings">
      <div className="settings__column">
        <SettingsHeader title="Account" kind="back" to={PATHS.settings} label="Back to settings" />

        <SettingsCard label="Account">
          <SettingsLinkRow icon="account" label="Account Info" to={PLACEHOLDER_ROUTES.accountInfo.path} />
          <SettingsLinkRow
            icon="lock-off"
            label="Password and security settings"
            to={PLACEHOLDER_ROUTES.passwordSecurity.path}
          />
          <SettingsLinkRow icon="delete" label="Delete my account" danger to={PATHS.deleteAccount} />
        </SettingsCard>
      </div>
    </SignedInLayout>
  )
}
