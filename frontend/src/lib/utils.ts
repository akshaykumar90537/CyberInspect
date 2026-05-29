import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'info']

export function severityLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function gradeToColor(grade: string) {
  const map: Record<string, string> = {
    A: '#22c55e', B: '#00d4ff', C: '#ffb800', D: '#ff8c42', E: '#ff3d5a', F: '#ff1a3d',
  }
  return map[grade] ?? '#64748b'
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
