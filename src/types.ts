export type DebtType = "debo" | "me-deben"
export type Status = "activo" | "pagado"

export interface HistoryEntry {
  id: string
  type: "creacion" | "pago-parcial" | "incremento"
  amount: number
  date: string
  currency?: string
  category?: string
  note?: string
}

export interface DebtEntry {
  id: string
  name: string
  amount: number
  type: DebtType
  status: Status
  createdAt: string
  currency?: string
  dueDate?: string
  category?: string
  history: HistoryEntry[]
}

export interface CurrencyInfo {
  code: string
  symbol: string
  name: string
  locale: string
  country?: string
}

export interface PersonCurrencyTotals {
  meDeben: number
  debo: number
  net: number
  count: number
}

export interface PersonAccount {
  key: string
  name: string
  debts: DebtEntry[]
  activeDebts: DebtEntry[]
  paidDebts: DebtEntry[]
  totals: Record<string, PersonCurrencyTotals>
  lastActivity: string
  oldestDueDate?: string
  overdueCount: number
}

export interface PaymentAllocation {
  entry: DebtEntry
  amount: number
}
