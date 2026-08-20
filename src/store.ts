import { useState, useCallback } from "react"
import type { DebtEntry, HistoryEntry, DebtType } from "./types"
import { generateId, todayISO } from "./utils/format"

const STORAGE_KEY = "deuditas-data"
const CURRENCY_STORAGE_KEY = "deuditas-currency"

function loadEntries(): DebtEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function loadCurrency(): string {
  try {
    const raw = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (raw && raw.trim()) return raw.trim()
  } catch { /* ignore */ }
  return "PEN"
}

function saveEntries(entries: DebtEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function useDebtStore() {
  const [entries, setEntries] = useState<DebtEntry[]>(loadEntries)
  const [currency, setCurrencyState] = useState<string>(loadCurrency)

  const persist = useCallback((next: DebtEntry[]) => {
    setEntries(next)
    saveEntries(next)
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
      name: name.trim(),
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
    return entries.find(e =>
      e.name.toLowerCase() === name.trim().toLowerCase() &&
      e.type === type &&
      e.status === "activo" &&
      ((e.currency || currency).toUpperCase() === targetCurrency)
    )
  }, [entries, currency])

  const findActiveByNameAndType = useCallback((name: string, type: DebtType): DebtEntry | undefined => {
    return findActiveByNameTypeAndCurrency(name, type, currency)
  }, [findActiveByNameTypeAndCurrency, currency])

  const names = Array.from(new Set(entries.map(e => e.name.toLowerCase())))

  return {
    entries,
    currency,
    setCurrency,
    addEntry,
    addToExisting,
    togglePaid,
    findActiveByNameTypeAndCurrency,
    findActiveByNameAndType,
    names,
    exportData,
    importData,
  }
}
