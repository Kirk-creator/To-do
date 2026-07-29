export type TodoKind = 'recurring' | 'once'

export type TodoColor =
  | 'sage'
  | 'coral'
  | 'sky'
  | 'amber'
  | 'lilac'
  | 'rose'

export interface TodoTemplate {
  id: string
  title: string
  kind: TodoKind
  symbol: string
  color: TodoColor
  createdAt: string
  /** For once-items: true once finished on some day (won't carry over) */
  permanentlyDone: boolean
}

export interface DayCompletion {
  templateId: string
  completedAt: string
}

export interface DayRecord {
  date: string // YYYY-MM-DD
  completions: DayCompletion[]
}

export interface AppData {
  templates: TodoTemplate[]
  days: DayRecord[]
  lastOpenedDate: string
}

export const SYMBOLS = [
  '★',
  '●',
  '◆',
  '▲',
  '♥',
  '✿',
  '☀',
  '☾',
  '⚡',
  '✦',
  '◎',
  '◇',
] as const

export const COLORS: { id: TodoColor; label: string; hex: string }[] = [
  { id: 'sage', label: 'Sage', hex: '#6b9b7a' },
  { id: 'coral', label: 'Coral', hex: '#e07a5f' },
  { id: 'sky', label: 'Sky', hex: '#5b8fa8' },
  { id: 'amber', label: 'Amber', hex: '#d4a017' },
  { id: 'lilac', label: 'Lilac', hex: '#9b7eb8' },
  { id: 'rose', label: 'Rose', hex: '#c45c7a' },
]

export function todayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDisplayDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}
