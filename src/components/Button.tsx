import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type ButtonVariant = 'primary' | 'brand' | 'danger' | 'outline' | 'deep' | 'dark'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  /** Pill = auth screens / menus; rounded = landing CTAs. */
  shape?: 'pill' | 'rounded'
  block?: boolean
  size?: 'md' | 'sm'
  /** Shows a spinner and blocks repeat clicks while a (mock) API call runs. */
  loading?: boolean
  /** Renders a router <Link> with the same look instead of a <button>. */
  to?: string
  children: ReactNode
}

export function Button({
  variant = 'primary',
  shape = 'pill',
  block = false,
  size = 'md',
  loading = false,
  to,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${shape}`,
    size === 'sm' && 'btn--sm',
    block && 'btn--block',
    loading && 'is-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link className={classes} to={to}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} type={type} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}
