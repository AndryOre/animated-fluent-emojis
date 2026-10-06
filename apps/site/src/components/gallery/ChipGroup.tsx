interface Chip<Value extends string | number> {
  value: Value
  label: string
}

interface ChipGroupProps<Value extends string | number> {
  label: string
  chips: readonly Chip<Value>[]
  selected: Value
  onSelect: (value: Value) => void
  disabled?: boolean
  disabledHint?: string
}

/**
 * A labelled row of single-choice chips. It scrolls horizontally on narrow
 * screens and wraps on wide ones.
 * @param props - Chip list, selected value, change handler and disabled state.
 * @returns The labelled row of chip buttons.
 */
export function ChipGroup<Value extends string | number>(
  props: ChipGroupProps<Value>,
) {
  const {
    label,
    chips,
    selected,
    onSelect,
    disabled = false,
    disabledHint,
  } = props
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-2 overflow-x-auto min-[860px]:flex-wrap"
    >
      <span className="shrink-0 text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      {chips.map((chip) => (
        <button
          key={chip.value}
          type="button"
          aria-pressed={selected === chip.value}
          aria-disabled={disabled}
          title={disabled ? disabledHint : undefined}
          onClick={() => {
            if (!disabled) onSelect(chip.value)
          }}
          className="h-7 shrink-0 rounded-full border border-border px-3 text-xs font-semibold hover:bg-secondary aria-disabled:opacity-50 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}
