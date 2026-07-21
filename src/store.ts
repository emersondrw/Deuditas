import { useState, useCallback } from "react"
import type { DebtEntry, HistoryEntry, DebtType } from "./types"
import { generateId, todayISO } from "./utils/format"

const STORAGE_KEY = "deuditas-data"

function loadEntries(): DebtEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveEntries(entries: DebtEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function useDebtStore() {
  const [entries, setEntries] = useState<DebtEntry[]>(loadEntries)

  const persist = useCallback((next: DebtEntry[]) => {
    setEntries(next)
    saveEntries(next)
  }, [])

  const exportData = useCallback(() => {
    return JSON.stringify(entries, null, 2)
  }, [entries])

  const importData = useCallback((raw: string): boolean => {
    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return false
      persist(parsed as DebtEntry[])
      return true
    } catch {
      return false
    }
  }, [persist])

  const addEntry = useCallback((name: string, amount: number, type: DebtType) => {
    const now = todayISO()
    const historyEntry: HistoryEntry = {
      id: generateId(),
      type: "creacion",
      amount,
      date: now,
    }
    const entry: DebtEntry = {
      id: generateId(),
      name: name.trim(),
      amount,
      type,
      status: "activo",
      createdAt: now,
      history: [historyEntry],
    }
    persist([entry, ...entries])
  }, [entries, persist])

  const addToExisting = useCallback((id: string, amount: number, type: HistoryEntry["type"], note?: string) => {
    const now = todayISO()
    const historyEntry: HistoryEntry = {
      id: generateId(),
      type,
      amount,
      date: now,
      note,
    }
    const next = entries.map(e => {
      if (e.id !== id) return e
      const newAmount = type === "pago-parcial" ? e.amount - amount : e.amount + amount
      return {
        ...e,
        amount: newAmount,
        history: [...e.history, historyEntry],
      }
    })
    persist(next)
  }, [entries, persist])

  const togglePaid = useCallback((id: string) => {
    const next = entries.map(e =>
      e.id === id
        ? { ...e, status: (e.status === "activo" ? "pagado" : "activo") as DebtEntry["status"] }
        : e
    )
    persist(next)
  }, [entries, persist])

  const findActiveByNameAndType = useCallback((name: string, type: DebtType): DebtEntry | undefined => {
    return entries.find(e => e.name.toLowerCase() === name.trim().toLowerCase() && e.type === type && e.status === "activo")
  }, [entries])

  const names = Array.from(new Set(entries.map(e => e.name.toLowerCase())))

  return { entries, addEntry, addToExisting, togglePaid, findActiveByNameAndType, names, exportData, importData }
}
