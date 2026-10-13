interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** id of the element that names this switch (e.g. the "Stay Updated" heading). */
  labelledBy: string
  describedBy?: string
}

/** On/off switch used for "Stay Updated" (PDF p.4). */
export function ToggleSwitch({ checked, onChange, labelledBy, describedBy }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      className="toggle"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle__thumb" />
    </button>
  )
}
