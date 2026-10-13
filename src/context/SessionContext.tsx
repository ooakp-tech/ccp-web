import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'

/**
 * Client-side state that travels across the sign-up steps:
 *
 *   sign-up form  ->  pendingEmail (+ marketingOptIn)  ->  "Check your email"
 *   e-mail link   ->  pendingEmail cleared             ->  sign-in
 *   sign-in       ->  user                             ->  home / account drawer
 *
 * It is mirrored to sessionStorage so refreshing a route (the IIS rewrite
 * case) does not drop the user out of the flow. Passwords are never kept here.
 * TODO: when the API exists, `user` should come from GET /api/auth/me on load
 * (cookie/JWT session) instead of sessionStorage.
 */
interface SessionState {
  user: User | null
  /** Address waiting for e-mail verification; drives the "Check your email" screen. */
  pendingEmail: string | null
  marketingOptIn: boolean
}

interface SessionContextValue extends SessionState {
  startVerification: (email: string, marketingOptIn: boolean) => void
  completeVerification: () => void
  setMarketingOptIn: (value: boolean) => void
  signInAs: (user: User) => void
  clearSession: () => void
}

const STORAGE_KEY = 'velvetfx.session'

// "Stay Updated" is switched on in the mockup (PDF p.4), so that is the default.
const INITIAL_STATE: SessionState = { user: null, pendingEmail: null, marketingOptIn: true }

function loadState(): SessionState {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? { ...INITIAL_STATE, ...JSON.parse(stored) } : INITIAL_STATE
  } catch {
    return INITIAL_STATE
  }
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(loadState)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage unavailable: state still works for the lifetime of the page.
    }
  }, [state])

  const startVerification = useCallback((email: string, marketingOptIn: boolean) => {
    setState({ user: null, pendingEmail: email, marketingOptIn })
  }, [])

  const completeVerification = useCallback(() => {
    setState((current) => ({ ...current, pendingEmail: null }))
  }, [])

  const setMarketingOptIn = useCallback((marketingOptIn: boolean) => {
    setState((current) => ({ ...current, marketingOptIn }))
  }, [])

  const signInAs = useCallback((user: User) => {
    setState((current) => ({ ...current, user, pendingEmail: null }))
  }, [])

  const clearSession = useCallback(() => {
    setState((current) => ({ ...INITIAL_STATE, marketingOptIn: current.marketingOptIn }))
  }, [])

  const value = useMemo(
    () => ({ ...state, startVerification, completeVerification, setMarketingOptIn, signInAs, clearSession }),
    [state, startVerification, completeVerification, setMarketingOptIn, signInAs, clearSession],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used inside <SessionProvider>')
  return context
}
