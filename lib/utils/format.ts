import { formatDistanceToNow, format } from 'date-fns'

/**
 * Formats a number as USD currency.
 * @example formatCurrency(1234.5) => "$1,234.50"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Formats a date as "Mar 15, 2026".
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM d, yyyy')
}

/**
 * Formats a date as a relative time string, e.g. "2 hours ago", "3 days ago".
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

/**
 * Formats a number as a percentage string.
 * @example formatPercentage(73.5) => "73.5%"
 * @example formatPercentage(73.567, 1) => "73.6%"
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Formats a score as a whole number string (no decimals).
 * @example formatScore(73.4) => "73"
 */
export function formatScore(score: number): string {
  return Math.round(score).toString()
}
