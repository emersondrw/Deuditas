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
