'use client'

import { Input } from './input'

interface DateInputProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
}

export function DateInput({ selected, onSelect, disabled, className }: DateInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      onSelect?.(new Date(value))
    } else {
      onSelect?.(undefined)
    }
  }

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Input
      type="date"
      value={formatDateForInput(selected)}
      onChange={handleChange}
      disabled={disabled}
      max={today}
      className={className}
    />
  )
}
