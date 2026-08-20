import { useState, useCallback } from "react"
import type { DebtEntry, HistoryEntry, DebtType } from "./types"
import { generateId, todayISO } from "./utils/format"

const STORAGE_KEY = "deuditas-data"
const CURRENCY_STORAGE_KEY = "deuditas-currency"

function loadEntries(): DebtEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: DebtEntry[] = JSON.parse(raw)
      return parsed.map(e => ({
        ...e,
        name: e.name.trim().toUpperCase()
      }))
    }
  } catch { /* ignore */ }
  return []
}

function loadCurrency(): string {
  try {
    const raw = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (raw && raw.trim()) return raw.trim().toUpperCase()
  } catch { /* ignore */ }
  return "PEN"
}

function saveEntries(entries: DebtEntry[]) {
  const normalized = entries.map(e => ({
    ...e,
    name: e.name.trim().toUpperCase()
  }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
}

export function useDebtStore() {
  const [entries, setEntries] = useState<DebtEntry[]>(loadEntries)
  const [currency, setCurrencyState] = useState<string>(loadCurrency)

  const persist = useCallback((next: DebtEntry[]) => {
    const normalized = next.map(e => ({
      ...e,
      name: e.name.trim().toUpperCase()
    }))
    setEntries(normalized)
    saveEntries(normalized)
  }, [])

  const setCurrency = useCallback((code: string) => {
    const clean = code.trim().toUpperCase()
    setCurrencyState(clean)
    localStorage.setItem(CURRENCY_STORAGE_KEY, clean)
  }, [])

  const exportData = useCallback(() => {
    return JSON.stringify({
      version: 1,
      currency,
      exportedAt: todayISO(),
      entries,
    }, null, 2)
  }, [entries, currency])

  const importData = useCallback((raw: string): boolean => {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        persist(parsed as DebtEntry[])
        return true
      }
      if (parsed && Array.isArray(parsed.entries)) {
        persist(parsed.entries as DebtEntry[])
        if (typeof parsed.currency === "string" && parsed.currency.trim()) {
          setCurrency(parsed.currency.trim())
        }
        return true
      }
      return false
    } catch {
      return false
    }
  }, [persist, setCurrency])

  const addEntry = useCallback((
    name: string,
    amount: number,
    type: DebtType,
    entryCurrency?: string,
    category?: string,
    dueDate?: string
  ) => {
    const now = todayISO()
    const finalCurrency = (entryCurrency || currency).trim().toUpperCase()
    const finalCategory = category?.trim() || "general"
    const finalName = name.trim().toUpperCase()
    const historyEntry: HistoryEntry = {
      id: generateId(),
      type: "creacion",
      amount,
      date: now,
      currency: finalCurrency,
      category: finalCategory,
    }
    const entry: DebtEntry = {
      id: generateId(),
      name: finalName,
      amount,
      type,
      status: "activo",
      createdAt: now,
      currency: finalCurrency,
      category: finalCategory,
      dueDate: dueDate?.trim() || undefined,
      history: [historyEntry],
    }
    persist([entry, ...entries])
  }, [entries, currency, persist])

  const updateEntry = useCallback((
    id: string,
    updates: {
      name?: string
      type?: DebtType
      currency?: string
      category?: string
      dueDate?: string
    }
  ) => {
    const next = entries.map(e => {
      if (e.id !== id) return e
      const updatedName = updates.name ? updates.name.trim().toUpperCase() : e.name
      const updatedCurrency = updates.currency ? updates.currency.trim().toUpperCase() : (e.currency || currency)
      const updatedCategory = updates.category !== undefined ? updates.category.trim() : (e.category || "general")
      const updatedDueDate = updates.dueDate !== undefined ? (updates.dueDate.trim() || undefined) : e.dueDate
      const updatedType = updates.type || e.type

      return {
        ...e,
        name: updatedName,
        type: updatedType,
        currency: updatedCurrency,
        category: updatedCategory,
        dueDate: updatedDueDate,
      }
    })
    persist(next)
  }, [entries, currency, persist])

  const addToExisting = useCallback((id: string, amount: number, type: HistoryEntry["type"], note?: string) => {
    const now = todayISO()
    const existing = entries.find(e => e.id === id)
    const entryCurrency = existing?.currency || currency
    const historyEntry: HistoryEntry = {
      id: generateId(),
      type,
      amount,
      date: now,
      currency: entryCurrency,
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
  }, [entries, currency, persist])

  const togglePaid = useCallback((id: string) => {
    const next = entries.map(e =>
      e.id === id
        ? { ...e, status: (e.status === "activo" ? "pagado" : "activo") as DebtEntry["status"] }
        : e
    )
    persist(next)
  }, [entries, persist])

  const findActiveByNameTypeAndCurrency = useCallback((name: string, type: DebtType, entryCurrency?: string): DebtEntry | undefined => {
    const targetCurrency = (entryCurrency || currency).trim().toUpperCase()
    const targetName = name.trim().toUpperCase()
    return entries.find(e =>
      e.name.toUpperCase() === targetName &&
      e.type === type &&
      e.status === "activo" &&
      ((e.currency || currency).toUpperCase() === targetCurrency)
    )
  }, [entries, currency])

  const findActiveByNameAndType = useCallback((name: string, type: DebtType): DebtEntry | undefined => {
    return findActiveByNameTypeAndCurrency(name, type, currency)
  }, [findActiveByNameTypeAndCurrency, currency])

  const names = Array.from(new Set(entries.map(e => e.name.toUpperCase())))

  return {
    entries,
    currency,
    setCurrency,
    addEntry,
    updateEntry,
    addToExisting,
    togglePaid,
    findActiveByNameTypeAndCurrency,
    findActiveByNameAndType,
    names,
    exportData,
    importData,
  }
}
