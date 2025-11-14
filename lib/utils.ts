import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parse, isValid } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert DD/MM/YYYY string to Date object
 */
export function parseDate(dateString: string): Date | undefined {
  try {
    const parsed = parse(dateString, 'dd/MM/yyyy', new Date())
    return isValid(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

/**
 * Convert Date object to DD/MM/YYYY string
 */
export function formatDate(date: Date | undefined): string {
  if (!date) return ''
  try {
    return format(date, 'dd/MM/yyyy')
  } catch {
    return ''
  }
}
