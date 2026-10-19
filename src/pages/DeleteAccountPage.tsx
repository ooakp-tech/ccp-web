import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { DeleteReasonSheet } from '../components/DeleteReasonSheet'
import { SettingsHeader } from '../components/Settings'
import { SignedInLayout } from '../components/SignedInLayout'
import { useSession } from '../context/SessionContext'
import { PATHS } from '../routes/paths'
import { deleteAccount } from '../services/api'
import type { User } from '../types'

/**
 * Delete Account PDF p.5 (centre): warning and "DELETE ACCOUNT". The button
 * opens the reason pop-up (p.5 right); "DELETE MY ACCOUNT" there deletes the
 * account and lands on sign-in (p.6).
 * ASSUMPTION: sign-in shows a one-line "account deleted" notice (not in the PDF).
 */
export function DeleteAccountPage({ user }: { user: User }) {
  const navigate = useNavigate()
  const { clearSession } = useSession()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string>()
  const closeSheet = useCallback(() => setSheetOpen(false), [])

  const handleConfirm = async (reason: string) => {
    setError(undefined)
    setDeleting(true)
    try {
      await deleteAccount(user.email, reason)
      clearSession()
      navigate(PATHS.signIn, { replace: true, state: { accountDeleted: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Your account could not be deleted. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <>
      <SignedInLayout user={user} className="settings">
        <div className="settings__column">
          <SettingsHeader title="Delete my account" kind="back" to={PATHS.accountSettings} label="Back to account" />

          <p className="delete-account__intro">
            Deleting your VELVETFX account means losing all the time, effort, content, and progress you&rsquo;ve built
            on the platform. Your profile, data, and account history will be permanently removed. Before continuing,
            please take a moment to think carefully about whether you truly want to lose everything you created.
          </p>

          <div className="delete-account__card">
            <p className="delete-account__caution">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="currentColor" d="M12 2.5 1 21.5h22L12 2.5Zm1 16h-2v-2h2v2Zm0-4h-2v-5h2v5Z" />
              </svg>
              <span>
                Caution: Once you press DELETE ACCOUNT, there is no turning back. Your account, content, and progress
                cannot be recovered.
              </span>
            </p>
            <Button variant="danger" onClick={() => setSheetOpen(true)} aria-haspopup="dialog">
              DELETE ACCOUNT
            </Button>
          </div>
        </div>
      </SignedInLayout>

      <DeleteReasonSheet
        open={sheetOpen}
        deleting={deleting}
        error={error}
        onClose={closeSheet}
        onConfirm={handleConfirm}
      />
    </>
  )
}
