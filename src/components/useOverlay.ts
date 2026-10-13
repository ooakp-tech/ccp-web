import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/**
 * Shared behaviour of the full-screen menu and the account drawer:
 * Escape closes, and focus moves into the overlay when it opens and back to
 * the opener when it closes.
 */
export function useOverlay<T extends HTMLElement>(open: boolean, onClose: () => void): RefObject<T> {
  const initialFocusRef = useRef<T>(null)

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    initialFocusRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      opener?.focus()
    }
  }, [open, onClose])

  return initialFocusRef
}
