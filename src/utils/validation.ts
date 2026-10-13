/**
 * Form validation shared by the sign-up and sign-in screens.
 *
 * ASSUMPTION: the Fan PDF shows no error states, so the rules are the usual
 * enterprise defaults. The sample password in the mockup ("sempreFAN3030*#")
 * satisfies them. Align with the backend password policy when it exists.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const PASSWORD_MIN_LENGTH = 8

export function validateEmail(value: string): string | undefined {
  const email = value.trim()
  if (!email) return 'Email is required.'
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.'
  return undefined
}

/** Sign-up: enforce the password policy. */
export function validateNewPassword(value: string): string | undefined {
  if (!value) return 'Password is required.'
  if (value.length < PASSWORD_MIN_LENGTH || !/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters, including a letter and a number.`
  }
  return undefined
}

/** Sign-in: only presence is checked; the server decides whether it is right. */
export function validateRequiredPassword(value: string): string | undefined {
  return value ? undefined : 'Password is required.'
}
