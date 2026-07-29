import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { celebrate, celebrateAllDone } from './confetti'
import { loadData, saveData } from './storage'
import {
  COLORS,
  SYMBOLS,
  formatDisplayDate,
  todayKey,
  uid,
  type AppData,
  type DayCompletion,
  type DayRecord,
  type TodoColor,
  type TodoKind,
  type TodoTemplate,
} from './types'

type Tab = 'today' | 'history'

function getDay(data: AppData, date: string): DayRecord {
  return data.days.find((d) => d.date === date) ?? { date, completions: [] }
}

function upsertDay(data: AppData, day: DayRecord): AppData {
  const others = data.days.filter((d) => d.date !== day.date)
  return { ...data, days: [...others, day].sort((a, b) => b.date.localeCompare(a.date)) }
}

function isCompletedToday(day: DayRecord, templateId: string): boolean {
  return day.completions.some((c) => c.templateId === templateId)
}

/** Active items for a given day */
function visibleTemplates(data: AppData, date: string): TodoTemplate[] {
  const day = getDay(data, date)
  return data.templates.filter((t) => {
    if (t.kind === 'recurring') return true
    // One-time: hide if permanently done on a previous day
    if (t.permanentlyDone) {
      // Still show if completed today (so it appears checked until tomorrow)
      return isCompletedToday(day, t.id)
    }
    return true
  })
}

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData())
  const [tab, setTab] = useState<Tab>('today')
  const [composerOpen, setComposerOpen] = useState(false)
  const today = todayKey()

  // Persist + roll day state
  useEffect(() => {
    setData((prev) => {
      if (prev.lastOpenedDate === today) return prev
      // New calendar day: mark one-time items completed on prior days as permanently done
      const templates = prev.templates.map((t) => {
        if (t.kind !== 'once' || t.permanentlyDone) return t
        const wasDoneBefore = prev.days.some(
          (d) => d.date < today && d.completions.some((c) => c.templateId === t.id),
        )
        return wasDoneBefore ? { ...t, permanentlyDone: true } : t
      })
      return { ...prev, templates, lastOpenedDate: today }
    })
  }, [today])

  useEffect(() => {
    saveData(data)
  }, [data])

  const day = getDay(data, today)
  const items = useMemo(() => visibleTemplates(data, today), [data, today])
  const openItems = items.filter((t) => !isCompletedToday(day, t.id))
  const doneItems = items.filter((t) => isCompletedToday(day, t.id))
  const total = items.length
  const doneCount = doneItems.length
  const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100)

  function toggleComplete(template: TodoTemplate) {
    const already = isCompletedToday(day, template.id)
    let nextCompletions: DayCompletion[]
    if (already) {
      nextCompletions = day.completions.filter((c) => c.templateId !== template.id)
    } else {
      nextCompletions = [
        ...day.completions,
        { templateId: template.id, completedAt: new Date().toISOString() },
      ]
    }
    const nextDay = { ...day, completions: nextCompletions }
    let next = upsertDay(data, nextDay)

    // If unchecking a one-time that was marked permanently done today, revive it
    if (already && template.kind === 'once' && template.permanentlyDone) {
      next = {
        ...next,
        templates: next.templates.map((t) =>
          t.id === template.id ? { ...t, permanentlyDone: false } : t,
        ),
      }
    }

    setData(next)

    if (!already) {
      celebrate()
      const willBeDone = openItems.length === 1 && openItems[0].id === template.id
      if (willBeDone && total > 1) {
        setTimeout(() => celebrateAllDone(), 350)
      }
    }
  }

  function undoCompletion(date: string, templateId: string) {
    const target = getDay(data, date)
    const nextDay = {
      ...target,
      completions: target.completions.filter((c) => c.templateId !== templateId),
    }
    let next = upsertDay(data, nextDay)
    next = {
      ...next,
      templates: next.templates.map((t) =>
        t.id === templateId && t.kind === 'once' ? { ...t, permanentlyDone: false } : t,
      ),
    }
    setData(next)
  }

  function addTodo(input: {
    title: string
    kind: TodoKind
    symbol: string
    color: TodoColor
  }) {
    const template: TodoTemplate = {
      id: uid(),
      title: input.title.trim(),
      kind: input.kind,
      symbol: input.symbol,
      color: input.color,
      createdAt: new Date().toISOString(),
      permanentlyDone: false,
    }
    setData((prev) => ({ ...prev, templates: [...prev.templates, template] }))
    setComposerOpen(false)
  }

  function deleteTodo(id: string) {
    setData((prev) => ({
      ...prev,
      templates: prev.templates.filter((t) => t.id !== id),
      days: prev.days.map((d) => ({
        ...d,
        completions: d.completions.filter((c) => c.templateId !== id),
      })),
    }))
  }

  const historyDays = useMemo(() => {
    return [...data.days]
      .filter((d) => d.completions.length > 0)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30)
  }, [data.days])

  return (
    <div className="app">
      <header className="header">
        <h1 className="brand">Daily Checklist</h1>
        <p className="date-line">{formatDisplayDate(today)}</p>
      </header>

      {tab === 'today' && total > 0 && (
        <div className="progress-wrap">
          <div className="progress-meta">
            <span>
              <strong>
                {doneCount}/{total}
              </strong>{' '}
              done
            </span>
            <span>{progress}%</span>
          </div>
          <div className="progress-track" aria-hidden>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <nav className="tabs" aria-label="Sections">
        <button
          type="button"
          className={`tab ${tab === 'today' ? 'active' : ''}`}
          onClick={() => setTab('today')}
        >
          Today
        </button>
        <button
          type="button"
          className={`tab ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          History
        </button>
      </nav>

      {tab === 'today' ? (
        <TodayView
          openItems={openItems}
          doneItems={doneItems}
          day={day}
          onToggle={toggleComplete}
          onDelete={deleteTodo}
          allDone={total > 0 && openItems.length === 0}
        />
      ) : (
        <HistoryView
          historyDays={historyDays}
          templates={data.templates}
          onUndo={undoCompletion}
        />
      )}

      <button
        type="button"
        className="fab"
        aria-label="Add to-do"
        onClick={() => setComposerOpen(true)}
      >
        +
      </button>

      {composerOpen && (
        <Composer
          onClose={() => setComposerOpen(false)}
          onAdd={addTodo}
        />
      )}
    </div>
  )
}

function colorVar(color: TodoColor): string {
  return `var(--color-${color})`
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4.5 10.5 8 14l7.5-8"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TodayView({
  openItems,
  doneItems,
  day,
  onToggle,
  onDelete,
  allDone,
}: {
  openItems: TodoTemplate[]
  doneItems: TodoTemplate[]
  day: DayRecord
  onToggle: (t: TodoTemplate) => void
  onDelete: (id: string) => void
  allDone: boolean
}) {
  if (openItems.length === 0 && doneItems.length === 0) {
    return (
      <div className="empty">
        <h2>Nothing here yet</h2>
        <p>Tap + to add a daily habit or a one-time task.</p>
      </div>
    )
  }

  return (
    <div>
      {allDone && (
        <div className="all-done-banner" style={{ marginBottom: '1rem' }}>
          <p>All clear for today</p>
        </div>
      )}

      {openItems.length > 0 && (
        <section>
          <p className="section-label">To do</p>
          <ul className="list">
            {openItems.map((t) => (
              <TodoRow
                key={t.id}
                todo={t}
                checked={false}
                onToggle={() => onToggle(t)}
                onDelete={() => onDelete(t.id)}
              />
            ))}
          </ul>
        </section>
      )}

      {doneItems.length > 0 && (
        <section style={{ marginTop: openItems.length ? '1.25rem' : 0 }}>
          <p className="section-label">Done</p>
          <ul className="list">
            {doneItems.map((t) => (
              <TodoRow
                key={t.id}
                todo={t}
                checked
                completedAt={day.completions.find((c) => c.templateId === t.id)?.completedAt}
                onToggle={() => onToggle(t)}
                onDelete={() => onDelete(t.id)}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function TodoRow({
  todo,
  checked,
  completedAt,
  onToggle,
  onDelete,
}: {
  todo: TodoTemplate
  checked: boolean
  completedAt?: string
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <li
      className={`todo-row ${checked ? 'done' : ''}`}
      style={{ ['--item-color' as string]: colorVar(todo.color) }}
    >
      <button
        type="button"
        className={`check ${checked ? 'checked' : ''}`}
        aria-label={checked ? `Uncheck ${todo.title}` : `Complete ${todo.title}`}
        onClick={onToggle}
      >
        <CheckIcon />
      </button>
      <div className="todo-main">
        <div className="todo-title-row">
          <span className="todo-symbol" aria-hidden>
            {todo.symbol}
          </span>
          <span className="todo-title">{todo.title}</span>
        </div>
        <span className="todo-meta">
          {todo.kind === 'recurring' ? 'Every day' : 'One-time'}
          {checked && completedAt
            ? ` · ${new Date(completedAt).toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}`
            : ''}
        </span>
      </div>
      <button
        type="button"
        className="delete-btn"
        aria-label={`Delete ${todo.title}`}
        onClick={onDelete}
      >
        ×
      </button>
    </li>
  )
}

function HistoryView({
  historyDays,
  templates,
  onUndo,
}: {
  historyDays: DayRecord[]
  templates: TodoTemplate[]
  onUndo: (date: string, templateId: string) => void
}) {
  const byId = new Map(templates.map((t) => [t.id, t]))

  if (historyDays.length === 0) {
    return (
      <div className="empty">
        <h2>No history yet</h2>
        <p>Completed items show up here so you can undo a mistaken check.</p>
      </div>
    )
  }

  return (
    <div>
      {historyDays.map((d) => (
        <section key={d.date} className="history-day">
          <h3>{d.date === todayKey() ? 'Today' : formatDisplayDate(d.date)}</h3>
          {[...d.completions]
            .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
            .map((c) => {
              const t = byId.get(c.templateId)
              if (!t) return null
              return (
                <div
                  key={`${d.date}-${c.templateId}-${c.completedAt}`}
                  className="history-item"
                  style={{ ['--item-color' as string]: colorVar(t.color) }}
                >
                  <span className="todo-symbol" aria-hidden>
                    {t.symbol}
                  </span>
                  <div className="todo-main">
                    <span className="todo-title">{t.title}</span>
                    <span className="history-time">
                      {new Date(c.completedAt).toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {t.kind === 'recurring' ? ' · daily' : ' · one-time'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="undo-btn"
                    onClick={() => onUndo(d.date, c.templateId)}
                  >
                    Undo
                  </button>
                </div>
              )
            })}
        </section>
      ))}
    </div>
  )
}

function Composer({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (input: {
    title: string
    kind: TodoKind
    symbol: string
    color: TodoColor
  }) => void
}) {
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<TodoKind>('recurring')
  const [symbol, setSymbol] = useState<string>(SYMBOLS[0])
  const [color, setColor] = useState<TodoColor>('sage')

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title, kind, symbol, color })
  }

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Add to-do"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <form className="sheet" onSubmit={submit}>
        <div className="sheet-handle" aria-hidden />
        <h2>New to-do</h2>

        <div className="field">
          <label htmlFor="todo-title">What needs doing?</label>
          <input
            id="todo-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Water the plants…"
            autoFocus
            maxLength={80}
          />
        </div>

        <div className="field">
          <label>Type</label>
          <div className="kind-toggle">
            <button
              type="button"
              className={`kind-option ${kind === 'recurring' ? 'active' : ''}`}
              onClick={() => setKind('recurring')}
            >
              <strong>Every day</strong>
              <span>Resets each morning so you can check it again.</span>
            </button>
            <button
              type="button"
              className={`kind-option ${kind === 'once' ? 'active' : ''}`}
              onClick={() => setKind('once')}
            >
              <strong>One-time</strong>
              <span>Carries over until you finish it.</span>
            </button>
          </div>
        </div>

        <div className="field">
          <label>Symbol</label>
          <div className="picker-grid" role="listbox" aria-label="Symbol">
            {SYMBOLS.map((s) => (
              <button
                key={s}
                type="button"
                className={`symbol-btn ${symbol === s ? 'active' : ''}`}
                onClick={() => setSymbol(s)}
                aria-label={`Symbol ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Color</label>
          <div className="picker-grid" role="listbox" aria-label="Color">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`color-btn ${color === c.id ? 'active' : ''}`}
                onClick={() => setColor(c.id)}
                aria-label={c.label}
                title={c.label}
              >
                <span style={{ ['--swatch' as string]: c.hex }} />
              </button>
            ))}
          </div>
        </div>

        <div className="sheet-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
            Add item
          </button>
        </div>
      </form>
    </div>
  )
}
