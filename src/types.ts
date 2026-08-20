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
