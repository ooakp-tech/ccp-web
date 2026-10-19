import { Navigate, Route, Routes } from 'react-router-dom'
import { DEMO_MODE } from '../config'
import { useSession } from '../context/SessionContext'
import { AccountSettingsPage } from '../pages/AccountSettingsPage'
import { CheckEmailPage } from '../pages/CheckEmailPage'
import { CreatorHomePage } from '../pages/CreatorHomePage'
import { CreatorOnboardingPage } from '../pages/CreatorOnboardingPage'
import { CreatorReferralPage } from '../pages/CreatorReferralPage'
import { CreatorVerifyEmailPage } from '../pages/CreatorVerifyEmailPage'
import { CreatorVerifyPage } from '../pages/CreatorVerifyPage'
import { DeleteAccountPage } from '../pages/DeleteAccountPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { HomePage } from '../pages/HomePage'
import { LandingPage } from '../pages/LandingPage'
import { MockInboxPage } from '../pages/MockInboxPage'
import { OAuthCallbackPage } from '../pages/OAuthCallbackPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { SettingsPage } from '../pages/SettingsPage'
import { SignInPage } from '../pages/SignInPage'
import { SignUpPage } from '../pages/SignUpPage'
import { VerifyEmailPage } from '../pages/VerifyEmailPage'
import { PATHS, PLACEHOLDER_ROUTES } from './paths'
import type { PlaceholderRoute } from './paths'
import type { User } from '../types'

/**
 * /home serves two mockup screens, because both screenshots show
 * velvetfx.com/home in the address bar:
 *   - signed in                        -> home (PDF p.6 centre)
 *   - signed up, e-mail not verified   -> "Check your email" (PDF p.4 right)
 *   - neither                          -> sign-in
 */
function HomeRoute() {
  const { user, pendingEmail, pendingRole } = useSession()
  if (user) return user.role === 'creator' ? <CreatorHomePage user={user} /> : <HomePage user={user} />
  if (pendingEmail) {
    // Creator PDF p.5: "Verify your email" is also shown at velvetfx.com/home.
    return pendingRole === 'creator' ? <CreatorVerifyEmailPage email={pendingEmail} /> : <CheckEmailPage email={pendingEmail} />
  }
  return <Navigate to={PATHS.signIn} replace />
}

/** Creator onboarding screens: a signed-in fan goes home, anyone else to sign-in. */
function RequireCreator({ children }: { children: JSX.Element }) {
  const { user } = useSession()
  if (!user) return <Navigate to={PATHS.signIn} replace />
  return user.role === 'creator' ? children : <Navigate to={PATHS.home} replace />
}

/** Signed-in screens: anyone else goes to sign-in. */
function RequireUser({ render }: { render: (user: User) => JSX.Element }) {
  const { user } = useSession()
  return user ? render(user) : <Navigate to={PATHS.signIn} replace />
}

function Placeholder({ route }: { route: PlaceholderRoute }) {
  const { user } = useSession()
  if (route.requiresAuth && !user) return <Navigate to={PATHS.signIn} replace />
  return <PlaceholderPage title={route.title} />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path={PATHS.landing} element={<LandingPage />} />
      <Route path={PATHS.signUp} element={<SignUpPage />} />
      <Route path={PATHS.home} element={<HomeRoute />} />
      <Route path={PATHS.verifyEmail} element={<VerifyEmailPage />} />
      <Route path={PATHS.signIn} element={<SignInPage />} />
      <Route path={PATHS.forgotPassword} element={<ForgotPasswordPage />} />
      <Route path={`${PATHS.resetPassword}/:hash`} element={<ResetPasswordPage />} />
      <Route path={`${PATHS.oauthCallback}/:provider`} element={<OAuthCallbackPage />} />
      {/* Creator sign-up PDF (phase 1); the sign-up form itself is /signup?type=creator */}
      <Route path={PATHS.creatorVerify} element={<CreatorVerifyPage />} />
      <Route path={PATHS.creatorOnboarding} element={<RequireCreator><CreatorOnboardingPage /></RequireCreator>} />
      <Route path={PATHS.creatorReferral} element={<RequireCreator><CreatorReferralPage /></RequireCreator>} />
      {/* Fan Delete Account PDF */}
      <Route path={PATHS.settings} element={<RequireUser render={(user) => <SettingsPage user={user} />} />} />
      <Route
        path={PATHS.accountSettings}
        element={<RequireUser render={(user) => <AccountSettingsPage user={user} />} />}
      />
      <Route
        path={PATHS.deleteAccount}
        element={<RequireUser render={(user) => <DeleteAccountPage user={user} />} />}
      />
      {DEMO_MODE && <Route path={PATHS.mockInbox} element={<MockInboxPage />} />}

      {Object.values(PLACEHOLDER_ROUTES).map((route) => (
        <Route key={route.path} path={route.path} element={<Placeholder route={route} />} />
      ))}

      <Route path="*" element={<Navigate to={PATHS.landing} replace />} />
    </Routes>
  )
}
