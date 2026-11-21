import { useState, useCallback } from "react"
import type { DebtEntry, HistoryEntry, DebtType } from "./types"
import { generateId, todayISO } from "./utils/format"
import { planPersonPayment } from "./utils/personAccounts"

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
      const rawAmount = type === "pago-parcial" ? e.amount - amount : e.amount + amount
      const newAmount = type === "pago-parcial"
        ? Math.max(0, Math.round(rawAmount * 100) / 100)
        : Math.round(rawAmount * 100) / 100
      return {
        ...e,
        amount: newAmount,
        status: type === "pago-parcial" && newAmount <= 0 ? "pagado" as DebtEntry["status"] : e.status,
        history: [...e.history, historyEntry],
      }
    })
    persist(next)
  }, [entries, currency, persist])

  /**
   * @description       : Registers a payment for a person and distributes it automatically across their active debts (oldest first).
   * @param name        : Person name (normalized).
   * @param amount      : Amount received/paid.
   * @param type        : Direction ("me-deben" = they pay me, "debo" = I pay them).
   * @param entryCurrency : Currency of the payment.
   * @param note        : Optional note added to every affected history entry.
   * @return            : Total amount actually applied.
   **/
  const addPersonPayment = useCallback((
    name: string,
    amount: number,
    type: DebtType,
    entryCurrency: string,
    note?: string
  ): number => {
    const targetName = name.trim().toUpperCase()
    const finalCurrency = (entryCurrency || currency).trim().toUpperCase()
    const personEntries = entries.filter(e => e.name.toUpperCase() === targetName)
    const plan = planPersonPayment(personEntries, amount, type, finalCurrency, currency)
    if (plan.allocations.length === 0) return 0

    const now = todayISO()
    const allocations = new Map(plan.allocations.map(item => [item.entry.id, item.amount]))

    const next = entries.map(e => {
      const applied = allocations.get(e.id)
      if (!applied) return e

      const newAmount = Math.max(0, Math.round((e.amount - applied) * 100) / 100)
      const historyEntry: HistoryEntry = {
        id: generateId(),
        type: "pago-parcial",
        amount: applied,
        date: now,
        currency: finalCurrency,
        note: note || `Abono aplicado desde estado de cuenta`,
      }

      return {
        ...e,
        amount: newAmount,
        status: newAmount <= 0 ? "pagado" as DebtEntry["status"] : e.status,
        history: [...e.history, historyEntry],
      }
    })

    persist(next)
    return plan.total
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
    addPersonPayment,
    togglePaid,
    findActiveByNameTypeAndCurrency,
    findActiveByNameAndType,
    names,
    exportData,
    importData,
  }
}
