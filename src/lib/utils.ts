import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

export function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'text-emerald-400',
    paused: 'text-amber-400',
    ended: 'text-slate-400',
    draft: 'text-blue-400',
    error: 'text-red-400',
  }
  return colors[status] || 'text-slate-400'
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    meta: '#0081FB',
    google: '#4285F4',
    tiktok: '#00F2EA',
    linkedin: '#0A66C2',
    twitter: '#1DA1F2',
    pinterest: '#E60023',
  }
  return colors[platform] || '#6366F1'
}

export function getPlatformGradient(platform: string): string {
  const gradients: Record<string, string> = {
    meta: 'from-blue-500 via-purple-500 to-pink-500',
    google: 'from-blue-500 via-red-500 to-yellow-500',
    tiktok: 'from-cyan-400 via-black to-pink-500',
    linkedin: 'from-blue-600 to-blue-800',
    twitter: 'from-blue-400 to-blue-600',
    pinterest: 'from-red-500 to-red-700',
  }
  return gradients[platform] || 'from-indigo-500 to-purple-500'
}
