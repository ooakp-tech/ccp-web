import { useState } from 'react'
import {
  SettingsButtonRow,
  SettingsCard,
  SettingsHeader,
  SettingsLinkRow,
  SettingsSectionTitle,
  SettingsToggleRow,
} from '../components/Settings'
import { SignedInLayout } from '../components/SignedInLayout'
import { useLogout } from '../components/useLogout'
import { PATHS, PLACEHOLDER_ROUTES } from '../routes/paths'
import type { User } from '../types'

/**
 * Delete Account PDF p.4 (right): Settings, opened from "Settings" in the
 * account drawer. Only "Account" is part of the delete flow.
 *
 * ASSUMPTIONS - the mockup crosses out every other row in red ("not set up yet"):
 * - those rows open the generic placeholder page, like other undesigned links;
 *   "Log out" works, because logging out already exists in the drawer;
 * - "NSFW Contents" and "Dark mode" switch on and off but change nothing yet
 *   (TODO: store as user preferences via the API);
 * - the tab bar, also crossed out, is kept so Home and Menu stay reachable;
 * - the x returns to home, where the drawer that opened Settings lives.
 */
export function SettingsPage({ user }: { user: User }) {
  const { loggingOut, logout } = useLogout()
  const [showNsfw, setShowNsfw] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <SignedInLayout user={user} className="settings">
      <div className="settings__column">
        <SettingsHeader title="Settings" kind="close" to={PATHS.home} label="Close settings" />

        <SettingsCard label="Settings">
          {user.role !== 'creator' && (
            <SettingsLinkRow icon="earn" label="Become a creator" to={PLACEHOLDER_ROUTES.joinAsCreator.path} />
          )}
          <SettingsLinkRow icon="account" label="Account" to={PATHS.accountSettings} />
          <SettingsLinkRow
            icon="payment-card"
            label="Payments and subscriptions"
            to={PLACEHOLDER_ROUTES.paymentSettings.path}
          />
          <SettingsLinkRow icon="notifications" label="Notifications" to={PLACEHOLDER_ROUTES.notificationSettings.path} />
          <SettingsLinkRow icon="shield" label="Privacy and safety" to={PLACEHOLDER_ROUTES.privacySettings.path} />
          <SettingsLinkRow icon="headset" label="Help, terms and support" to={PLACEHOLDER_ROUTES.helpSettings.path} />
          <SettingsButtonRow
            icon="logout"
            label={loggingOut ? 'Logging out...' : 'Log out'}
            danger
            onClick={logout}
            disabled={loggingOut}
          />
        </SettingsCard>

        <SettingsSectionTitle>Display &amp; Language</SettingsSectionTitle>
        <SettingsCard label="Display and language">
          <SettingsToggleRow icon="eye-off" label="NSFW Contents" checked={showNsfw} onChange={setShowNsfw} />
          <SettingsToggleRow icon="moon" label="Dark mode" checked={darkMode} onChange={setDarkMode} />
        </SettingsCard>
      </div>
    </SignedInLayout>
  )
}
