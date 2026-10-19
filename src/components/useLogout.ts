import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { PATHS } from '../routes/paths'
import { signOut } from '../services/api'

/** Logout used by the account drawer and the Settings screen: ends the session and returns to landing. */
export function useLogout(): { loggingOut: boolean; logout: () => Promise<void> } {
  const navigate = useNavigate()
  const { clearSession } = useSession()
  const [loggingOut, setLoggingOut] = useState(false)

  const logout = async () => {
    setLoggingOut(true)
    await signOut()
    clearSession()
    navigate(PATHS.landing)
  }

  return { loggingOut, logout }
}
