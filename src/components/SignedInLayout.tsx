import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import type { User } from '../types'
import { AccountDrawer, initialsOf } from './AccountDrawer'
import { BottomNav } from './BottomNav'
import { useLogout } from './useLogout'

interface SignedInLayoutProps {
  user: User
  /** Highlights the Home tab (home screen only). */
  homeActive?: boolean
  className?: string
  children: ReactNode
}

/**
 * Frame shared by the signed-in screens - home (Sign-up PDF p.6) and the
 * settings screens (Delete Account PDF p.4-5): scrolling content, the tab bar,
 * and the account drawer that its "Menu" tab opens.
 */
export function SignedInLayout({ user, homeActive = false, className, children }: SignedInLayoutProps) {
  const location = useLocation()
  const { loggingOut, logout } = useLogout()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  // A drawer link may point at the screen that is already showing.
  useEffect(() => setDrawerOpen(false), [location.key])

  return (
    <>
      <div className={['home', className].filter(Boolean).join(' ')}>
        <main className="home__scroll">{children}</main>
        <BottomNav
          initials={initialsOf(user.displayName)}
          homeActive={homeActive}
          onOpenMenu={() => setDrawerOpen(true)}
        />
      </div>

      <AccountDrawer open={drawerOpen} user={user} loggingOut={loggingOut} onClose={closeDrawer} onLogout={logout} />
    </>
  )
}
