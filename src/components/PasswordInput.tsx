import { useState } from 'react'
import { Icon } from './Icon'
import { TextInput } from './TextInput'
import type { TextInputProps } from './TextInput'

type PasswordInputProps = Omit<TextInputProps, 'type' | 'trailing'>

/**
 * Password field with the "Show/Hide Password" icon called out on PDF p.4.
 * Icon convention taken from the mockups: plain eye while the password is
 * hidden (sign-in, p.6), crossed-out eye while it is visible (sign-up, p.4).
 */
export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <TextInput
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          className="field__toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} size={22} />
        </button>
      }
    />
  )
}
