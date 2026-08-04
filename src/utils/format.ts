import type { DebtEntry } from "../types"

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function todayISO(): string {
  return new Date().toISOString()
}

/**
 * @description       : Determines the effective status, display label, and color theme for a debt entry based on its current balance.
 * @group             : Utilities
 * @author            : Emerson VI
 * @last modified on  : 2026-08-04
 **/
export function getDebtStatus(entry: DebtEntry) {
  const netOwedToMe = entry.type === "me-deben" ? entry.amount : -entry.amount
  const isOwed = netOwedToMe > 0 || (netOwedToMe === 0 && entry.type === "me-deben")
  const displayAmount = Math.abs(entry.amount)

  return {
    isOwed,
    netOwedToMe,
    displayAmount,
    label: isOwed ? "Te debe" : "Le debes",
    colorClass: isOwed ? "text-accent-owed" : "text-accent-owe",
    bgClass: isOwed ? "bg-accent-owed" : "bg-accent-owe",
    borderClass: isOwed ? "border-l-accent-owed" : "border-l-accent-owe",
  }
}

