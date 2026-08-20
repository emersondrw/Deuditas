import type { DebtEntry, CurrencyInfo } from "../types"

export const CURRENCIES: CurrencyInfo[] = [
  { code: "PEN", symbol: "S/", name: "Sol peruano", locale: "es-PE", country: "Perú" },
  { code: "USD", symbol: "$", name: "Dólar estadounidense", locale: "en-US", country: "Estados Unidos / Internacional" },
  { code: "EUR", symbol: "€", name: "Euro", locale: "es-ES", country: "Unión Europea" },
  { code: "MXN", symbol: "$", name: "Peso mexicano", locale: "es-MX", country: "México" },
  { code: "COP", symbol: "$", name: "Peso colombiano", locale: "es-CO", country: "Colombia" },
  { code: "ARS", symbol: "$", name: "Peso argentino", locale: "es-AR", country: "Argentina" },
  { code: "CLP", symbol: "$", name: "Peso chileno", locale: "es-CL", country: "Chile" },
  { code: "BRL", symbol: "R$", name: "Real brasileño", locale: "pt-BR", country: "Brasil" },
  { code: "BOB", symbol: "Bs.", name: "Boliviano", locale: "es-BO", country: "Bolivia" },
  { code: "CRC", symbol: "₡", name: "Colón costarricense", locale: "es-CR", country: "Costa Rica" },
  { code: "DOP", symbol: "RD$", name: "Peso dominicano", locale: "es-DO", country: "República Dominicana" },
  { code: "GTQ", symbol: "Q", name: "Quetzal guatemalteco", locale: "es-GT", country: "Guatemala" },
  { code: "HNL", symbol: "L", name: "Lempira hondureño", locale: "es-HN", country: "Honduras" },
  { code: "NIO", symbol: "C$", name: "Córdoba nicaragüense", locale: "es-NI", country: "Nicaragua" },
  { code: "PYG", symbol: "₲", name: "Guaraní paraguayo", locale: "es-PY", country: "Paraguay" },
  { code: "UYU", symbol: "$U", name: "Peso uruguayo", locale: "es-UY", country: "Uruguay" },
  { code: "VES", symbol: "Bs.D", name: "Bolívar venezolano", locale: "es-VE", country: "Venezuela" },
  { code: "GBP", symbol: "£", name: "Libra esterlina", locale: "en-GB", country: "Reino Unido" },
  { code: "CAD", symbol: "CA$", name: "Dólar canadiense", locale: "en-CA", country: "Canadá" },
]

export function getCurrencyInfo(code: string = "PEN"): CurrencyInfo {
  return CURRENCIES.find(c => c.code.toUpperCase() === code.toUpperCase()) || CURRENCIES[0]
}

export function formatCurrency(amount: number, currencyCode: string = "PEN"): string {
  const curr = getCurrencyInfo(currencyCode)
  try {
    return new Intl.NumberFormat(curr.locale, {
      style: "currency",
      currency: curr.code,
      minimumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${curr.symbol} ${amount.toFixed(2)}`
  }
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

export function formatShortDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString("es-PE", { day: "numeric", month: "short" })
  } catch {
    return dateStr
  }
}

export function getDueDateStatus(dueDate?: string) {
  if (!dueDate || !dueDate.trim()) {
    return {
      status: "none" as const,
      label: "",
      daysDiff: 0,
      badgeClass: "",
    }
  }

  const [year, month, day] = dueDate.slice(0, 10).split("-").map(Number)
  const due = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - today.getTime()
  const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (daysDiff < 0) {
    const days = Math.abs(daysDiff)
    return {
      status: "overdue" as const,
      label: days === 1 ? "Venció ayer" : `Vencida hace ${days}d`,
      daysDiff,
      badgeClass: "text-red-400 bg-red-500/15 border-red-500/40",
    }
  }

  if (daysDiff === 0) {
    return {
      status: "today" as const,
      label: "Vence hoy",
      daysDiff: 0,
      badgeClass: "text-amber-400 bg-amber-500/20 border-amber-500/40 animate-pulse font-medium",
    }
  }

  if (daysDiff <= 3) {
    return {
      status: "soon" as const,
      label: daysDiff === 1 ? "Vence mañana" : `Vence en ${daysDiff}d`,
      daysDiff,
      badgeClass: "text-amber-300/90 bg-amber-500/10 border-amber-500/30",
    }
  }

  return {
    status: "future" as const,
    label: `Vence ${formatShortDate(dueDate)}`,
    daysDiff,
    badgeClass: "text-text-secondary bg-[#1a1a1a] border-border-custom",
  }
}

export function generateWhatsAppMessage(
  entry: DebtEntry,
  categoryName?: string,
  currencyCode?: string
): string {
  const finalCurrency = entry.currency || currencyCode || "PEN"
  const formattedAmount = formatCurrency(Math.abs(entry.amount), finalCurrency)
  const isMeDeben = entry.type === "me-deben"
  const catText = categoryName && categoryName !== "General / Otro" ? ` por concepto de *${categoryName}*` : ""
  const dueInfo = entry.dueDate ? ` (acordado para el ${formatShortDate(entry.dueDate)})` : ""

  if (isMeDeben) {
    return encodeURIComponent(
      `Hola ${entry.name}! 👋 Te escribo para comentarte sobre el saldo pendiente de *${formattedAmount}*${catText}${dueInfo} registrado en Deuditas. Cuando tengas oportunidad me avisas para coordinar. ¡Muchas gracias!`
    )
  } else {
    return encodeURIComponent(
      `Hola ${entry.name}! 👋 Te escribo para tener presente el saldo pendiente de *${formattedAmount}*${catText}${dueInfo} que te debo. Avísame cómo prefieres que coordinemos el pago. ¡Un abrazo!`
    )
  }
}


