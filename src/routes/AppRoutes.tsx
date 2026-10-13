import { Navigate, Route, Routes } from 'react-router-dom'
import { DEMO_MODE } from '../config'
import { useSession } from '../context/SessionContext'
import { CheckEmailPage } from '../pages/CheckEmailPage'
import { HomePage } from '../pages/HomePage'
import { LandingPage } from '../pages/LandingPage'
import { MockInboxPage } from '../pages/MockInboxPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { SignInPage } from '../pages/SignInPage'
import { SignUpPage } from '../pages/SignUpPage'
import { VerifyEmailPage } from '../pages/VerifyEmailPage'
import { PATHS, PLACEHOLDER_ROUTES } from './paths'
import type { PlaceholderRoute } from './paths'

/**
 * /home serves two mockup screens, because both screenshots show
 * velvetfx.com/home in the address bar:
 *   - signed in                        -> home (PDF p.6 centre)
 *   - signed up, e-mail not verified   -> "Check your email" (PDF p.4 right)
 *   - neither                          -> sign-in
 */
function HomeRoute() {
  const { user, pendingEmail } = useSession()
  if (user) return <HomePage user={user} />
  if (pendingEmail) return <CheckEmailPage email={pendingEmail} />
  return <Navigate to={PATHS.signIn} replace />
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
      {DEMO_MODE && <Route path={PATHS.mockInbox} element={<MockInboxPage />} />}

      {Object.values(PLACEHOLDER_ROUTES).map((route) => (
        <Route key={route.path} path={route.path} element={<Placeholder route={route} />} />
      ))}

      <Route path="*" element={<Navigate to={PATHS.landing} replace />} />
    </Routes>
  )
}
