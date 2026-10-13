import type { CSSProperties } from 'react'
import { asset } from '../config'

export type IconName =
  | 'arrow-right'
  | 'chevron-left'
  | 'chevron-right'
  | 'close'
  | 'earn'
  | 'eye'
  | 'eye-off'
  | 'following'
  | 'help'
  | 'home'
  | 'languages'
  | 'logout'
  | 'menu'
  | 'messages'
  | 'notifications'
  | 'profile'
  | 'search'
  | 'settings'
  | 'subscriptions'
  | 'wallet'

interface IconProps {
  name: IconName
  /** Rendered size in px. */
  size?: number
  /** Files outside /assets/icons (e.g. the X logo) pass their own path. */
  src?: string
  className?: string
}

/**
 * Renders an SVG from /assets/icons as a CSS mask so it takes the current text
 * colour (an <img> would not). Always decorative: the accessible name belongs
 * on the surrounding button/link.
 */
export function Icon({ name, size = 24, src, className }: IconProps) {
  const style = {
    '--icon-url': `url("${src ?? asset(`icons/${name}.svg`)}")`,
    width: size,
    height: size,
  } as CSSProperties
  return <span aria-hidden="true" className={['icon', className].filter(Boolean).join(' ')} style={style} />
}
