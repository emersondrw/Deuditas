/**
 * @description       : Builds consolidated per-person accounts, plans automatic payment allocation across debts, and generates printable/WhatsApp statements.
 * @group             : Utilities
 * @author            : Emerson VI
 * @last modified on  : 2026-11-21
 * @last modified by  : Emerson VI
 **/

import type {
  DebtEntry,
  DebtType,
  PaymentAllocation,
  PersonAccount,
  PersonCurrencyTotals,
} from "../types"
import { formatCurrency, formatShortDate } from "./format"
import { getCategoryInfo } from "./categories"

const AVATAR_COLORS = [
  "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "bg-sky-500/15 text-sky-300 border-sky-500/30",
  "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "bg-rose-500/15 text-rose-300 border-rose-500/30",
  "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  "bg-lime-500/15 text-lime-300 border-lime-500/30",
  "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
]

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function dateValue(value?: string): number {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

function parseLocalDate(value: string): Date | null {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function startOfToday(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function getPersonInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function getPersonAvatarClass(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 100000
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

/**
 * @description       : Groups every debt entry by normalized person name and computes net balances per currency.
 * @param entries     : All debt entries.
 * @param fallback    : Currency used for legacy entries without their own currency.
 * @return            : Person accounts sorted by absolute net balance (descending).
 **/
export function buildPersonAccounts(entries: DebtEntry[], fallback = "PEN"): PersonAccount[] {
  const groups = new Map<string, DebtEntry[]>()

  for (const entry of entries) {
    const key = entry.name.trim().toUpperCase()
    if (!key) continue
    const existing = groups.get(key)
    if (existing) {
      existing.push(entry)
    } else {
      groups.set(key, [entry])
    }
  }

  const today = startOfToday()
  const accounts: PersonAccount[] = []

  for (const [key, debts] of groups) {
    const activeDebts = debts.filter(d => d.status === "activo")
    const paidDebts = debts.filter(d => d.status === "pagado")
    const totals: Record<string, PersonCurrencyTotals> = {}
    let overdueCount = 0
    let oldestDueDate: string | undefined
    let lastActivity = ""

    for (const debt of debts) {
      if (dateValue(debt.createdAt) > dateValue(lastActivity)) lastActivity = debt.createdAt
      for (const item of debt.history) {
        if (dateValue(item.date) > dateValue(lastActivity)) lastActivity = item.date
      }
    }

    for (const debt of activeDebts) {
      const code = (debt.currency || fallback).toUpperCase()
      const totalsForCurrency = totals[code] ?? { meDeben: 0, debo: 0, net: 0, count: 0 }

      if (debt.type === "me-deben") {
        totalsForCurrency.meDeben = roundMoney(totalsForCurrency.meDeben + debt.amount)
      } else {
        totalsForCurrency.debo = roundMoney(totalsForCurrency.debo + debt.amount)
      }
      totalsForCurrency.net = roundMoney(totalsForCurrency.meDeben - totalsForCurrency.debo)
      totalsForCurrency.count += 1
      totals[code] = totalsForCurrency

      if (debt.dueDate) {
        if (!oldestDueDate || debt.dueDate < oldestDueDate) oldestDueDate = debt.dueDate
        const due = parseLocalDate(debt.dueDate)
        if (due && due.getTime() < today.getTime()) overdueCount += 1
      }
    }

    accounts.push({
      key,
      name: key,
      debts: [...debts].sort((a, b) => dateValue(b.createdAt) - dateValue(a.createdAt)),
      activeDebts: [...activeDebts].sort((a, b) => dateValue(a.createdAt) - dateValue(b.createdAt)),
      paidDebts: [...paidDebts].sort((a, b) => dateValue(b.createdAt) - dateValue(a.createdAt)),
      totals,
      lastActivity,
      oldestDueDate,
      overdueCount,
    })
  }

  return accounts.sort((a, b) => {
    const balanceOf = (account: PersonAccount) =>
      Object.values(account.totals).reduce((sum, totals) => sum + Math.abs(totals.net), 0)
    const diff = balanceOf(b) - balanceOf(a)
    return diff !== 0 ? diff : a.name.localeCompare(b.name)
  })
}

/**
 * @description       : Plans how an amount is applied across a person's active debts of one type/currency (oldest first).
 * @param debts       : All debts belonging to the person.
 * @param amount      : Amount to apply.
 * @param type        : Direction of the payment ("me-deben" = they pay me, "debo" = I pay them).
 * @param currency    : Payment currency.
 * @param fallback    : Currency used for legacy entries without their own currency.
 * @return            : Allocations per debt plus any leftover amount that could not be applied.
 **/
export function planPersonPayment(
  debts: DebtEntry[],
  amount: number,
  type: DebtType,
  currency: string,
  fallback = "PEN"
): { allocations: PaymentAllocation[]; leftover: number; total: number } {
  const code = currency.trim().toUpperCase()
  const safeAmount = Number.isFinite(amount) && amount > 0 ? roundMoney(amount) : 0

  const candidates = debts
    .filter(
      debt =>
        debt.status === "activo" &&
        debt.type === type &&
        debt.amount > 0 &&
        (debt.currency || fallback).toUpperCase() === code
    )
    .sort((a, b) => dateValue(a.createdAt) - dateValue(b.createdAt))

  const allocations: PaymentAllocation[] = []
  let remaining = safeAmount

  for (const entry of candidates) {
    if (remaining <= 0) break
    const applied = roundMoney(Math.min(remaining, entry.amount))
    if (applied <= 0) continue
    allocations.push({ entry, amount: applied })
    remaining = roundMoney(remaining - applied)
  }

  return {
    allocations,
    leftover: remaining,
    total: roundMoney(safeAmount - remaining),
  }
}

/**
 * @description       : Returns the currencies with active debts for a person, optionally filtered by direction.
 **/
export function getPersonCurrencies(account: PersonAccount, type?: DebtType, fallback = "PEN"): string[] {
  const codes = new Set<string>()
  for (const debt of account.activeDebts) {
    if (type && debt.type !== type) continue
    codes.add((debt.currency || fallback).toUpperCase())
  }
  return Array.from(codes)
}

/**
 * @description       : Builds a plain-text account statement for a person.
 **/
export function generatePersonStatementText(account: PersonAccount, fallback = "PEN"): string {
  const lines: string[] = []
  lines.push(`*ESTADO DE CUENTA — ${account.name}*`)
  lines.push(`_Generado el ${new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}_`)
  lines.push("")

  const currencies = Object.entries(account.totals)
  if (currencies.length === 0) {
    lines.push("Sin deudas activas. 🎉")
  } else {
    lines.push("💰 *SALDO*")
    for (const [code, totals] of currencies) {
      const netLabel = totals.net > 0 ? "a favor" : totals.net < 0 ? "en contra" : "en paz"
      lines.push(
        `• ${code}: te debe ${formatCurrency(totals.meDeben, code)} | le debes ${formatCurrency(totals.debo, code)} | neto ${formatCurrency(Math.abs(totals.net), code)} (${netLabel})`
      )
    }
  }

  if (account.activeDebts.length > 0) {
    lines.push("")
    lines.push("📋 *DETALLE*")
    for (const debt of account.activeDebts) {
      const code = (debt.currency || fallback).toUpperCase()
      const direction = debt.type === "me-deben" ? "te debe" : "le debes"
      const category = getCategoryInfo(debt.category).name
      const created = formatShortDate(debt.createdAt)
      const due = debt.dueDate ? ` · vence ${formatShortDate(debt.dueDate)}` : ""
      lines.push(`• ${formatCurrency(debt.amount, code)} ${direction} · ${category} · ${created}${due}`)
    }
  }

  lines.push("")
  lines.push("_Enviado desde Deuditas_")
  return lines.join("\n")
}

/**
 * @description       : Opens a print-ready statement in a new window (the browser can save it as PDF).
 **/
export function printPersonStatement(account: PersonAccount, fallback = "PEN"): boolean {
  const printWindow = window.open("", "_blank", "width=720,height=900")
  if (!printWindow) return false

  const rows = account.activeDebts
    .map(debt => {
      const code = (debt.currency || fallback).toUpperCase()
      const direction = debt.type === "me-deben" ? "Te debe" : "Le debes"
      const due = debt.dueDate ? formatShortDate(debt.dueDate) : "—"
      return `<tr>
        <td>${escapeHtml(getCategoryInfo(debt.category).name)}</td>
        <td>${direction}</td>
        <td class="num">${formatCurrency(debt.amount, code)}</td>
        <td>${due}</td>
      </tr>`
    })
    .join("")

  const summary = Object.entries(account.totals)
    .map(([code, totals]) => {
      const net = totals.net > 0 ? "Te debe" : totals.net < 0 ? "Le debes" : "En paz"
      return `<tr>
        <td>${escapeHtml(code)}</td>
        <td class="num">${formatCurrency(totals.meDeben, code)}</td>
        <td class="num">${formatCurrency(totals.debo, code)}</td>
        <td class="num"><strong>${formatCurrency(Math.abs(totals.net), code)}</strong> <span class="muted">(${net})</span></td>
      </tr>`
    })
    .join("")

  printWindow.document.write(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Estado de cuenta — ${escapeHtml(account.name)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #111; margin: 40px; }
    h1 { font-size: 24px; margin: 0 0 4px; letter-spacing: -0.02em; }
    .muted { color: #666; }
    .meta { font-size: 12px; color: #666; margin-bottom: 24px; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: #555; margin: 28px 0 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #666; border-bottom: 1px solid #ddd; padding: 6px 8px; }
    td { padding: 8px; border-bottom: 1px solid #eee; }
    .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .brand { margin-top: 36px; font-size: 11px; color: #999; text-align: center; }
    @media print { body { margin: 16mm; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(account.name)}</h1>
  <p class="meta">Estado de cuenta · ${new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}</p>

  <h2>Saldo</h2>
  <table>
    <thead><tr><th>Moneda</th><th class="num">Te debe</th><th class="num">Le debes</th><th class="num">Neto</th></tr></thead>
    <tbody>${summary || `<tr><td colspan="4" class="muted">Sin deudas activas</td></tr>`}</tbody>
  </table>

  <h2>Detalle</h2>
  <table>
    <thead><tr><th>Categoría</th><th>Dirección</th><th class="num">Monto</th><th>Vence</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="4" class="muted">Sin deudas activas</td></tr>`}</tbody>
  </table>

  <p class="brand">Generado con Deuditas</p>
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`)
  printWindow.document.close()
  return true
}
