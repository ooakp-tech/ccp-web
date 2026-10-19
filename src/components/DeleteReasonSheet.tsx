import { useCallback, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'
import { useOverlay } from './useOverlay'

interface DeleteReasonSheetProps {
  open: boolean
  deleting: boolean
  error?: string
  onClose: () => void
  onConfirm: (reason: string) => void
}

const MAX_REASON_LENGTH = 1000

/**
 * Delete Account PDF p.5 (right): pop-up from the bottom of the screen after
 * "DELETE ACCOUNT", asking why the fan is leaving.
 * ASSUMPTION: the reason is optional - the mockup labels it "Tell us your
 * reason" and shows no required marker; the account is deleted either way.
 */
export function DeleteReasonSheet({ open, deleting, error, onClose, onConfirm }: DeleteReasonSheetProps) {
  const [reason, setReason] = useState('')
  const titleId = useId()
  const textId = useId()
  // Escape must not cancel while the delete request is running.
  const deletingRef = useRef(deleting)
  deletingRef.current = deleting
  const handleEscape = useCallback(() => {
    if (!deletingRef.current) onClose()
  }, [onClose])
  const fieldRef = useOverlay<HTMLTextAreaElement>(open, handleEscape)
  if (!open) return null

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onConfirm(reason.trim())
  }

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={textId}>
      <button type="button" className="sheet__scrim" onClick={onClose} disabled={deleting} aria-label="Cancel" />
      <form className="sheet__panel" onSubmit={handleSubmit}>
        <div className="sheet__head">
          <h2 id={titleId}>Why are you deleting your account?</h2>
          <button type="button" className="sheet__close" onClick={onClose} disabled={deleting} aria-label="Close">
            <Icon name="close" size={14} />
          </button>
        </div>
        <p id={textId}>
          At VELVET FX, we truly care about your experience. Please share why you&rsquo;re leaving so we can better
          understand your decision and continue improving the platform for our creators.
        </p>
        <label className="visually-hidden" htmlFor={`${titleId}-reason`}>
          Your reason for deleting your account (optional)
        </label>
        <textarea
          ref={fieldRef}
          id={`${titleId}-reason`}
          className="sheet__reason"
          rows={3}
          maxLength={MAX_REASON_LENGTH}
          placeholder="Tell us your reason (for example: moving to another platform, personal reasons, or any other feedback)..."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          disabled={deleting}
        />
        {error && (
          <p className="form-message form-message--error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" variant="danger" block loading={deleting} className="sheet__confirm">
          DELETE MY ACCOUNT
        </Button>
      </form>
    </div>
  )
}
