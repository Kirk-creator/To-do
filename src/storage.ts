import type { AppData } from './types'
import { todayKey } from './types'

const STORAGE_KEY = 'daily-checklist-v1'

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as AppData
    if (!parsed.templates || !parsed.days) return emptyData()
    return parsed
  } catch {
    return emptyData()
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Private mode / quota — keep the session working even if persist fails
  }
}

function emptyData(): AppData {
  const today = todayKey()
  return {
    templates: [],
    days: [],
    lastOpenedDate: today,
  }
}
