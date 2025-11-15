import { type ClassValue, clsx } from 'clsx'
import { format, isValid, parse } from 'date-fns'
import { twMerge } from 'tailwind-merge'

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

/**
 * Format number as USD currency
 */
export function formatCurrency(amount: number, locale = 'es-AR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format number as percentage
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}
