interface MediaPlaceholderProps {
  className?: string
}

/**
 * Stands in for the "PHOTO HERE" / "CONTENT CREATOR PHOTO HERE" boxes of the
 * mockups. ASSUMPTION (2026-10-19, at the user's request): no photos on any
 * page, so these are soft tiles like the Elite Creators cards; swap in
 * <Picture> when real creator photos exist.
 */
export function MediaPlaceholder({ className }: MediaPlaceholderProps) {
  return <div className={['media-placeholder', className].filter(Boolean).join(' ')} aria-hidden="true" />
}
