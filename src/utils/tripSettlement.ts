/**
 * @description       : Algorithms and utilities for calculating trip balances, debt minimization settlement, WhatsApp formatting, and Excel exports.
 * @group             : Utilities
 * @author            : Emerson VI
 * @last modified on  : 2026-08-21
 * @last modified by  : Emerson VI
 **/

import * as XLSX from "xlsx"
import type { Trip, TripExpense, ParticipantBalance, SettlementTransfer } from "../tripTypes"
import { formatCurrency, formatShortDate } from "./format"
import { getTripCategoryInfo } from "./tripCategories"

/**
 * @description       : Computes total expenses, category totals, and individual net balances for all trip participants.
 * @param trip        : The trip entity.
 * @param expenses    : Array of expenses for the given trip.
 * @return            : Summary with totalSpent, balances array, and category totals.
 **/
export function calculateTripBalances(trip: Trip, expenses: TripExpense[]) {
  const tripExpenses = expenses.filter(e => e.tripId === trip.id)
  const totalSpent = tripExpenses.reduce((acc, curr) => acc + curr.amount, 0)

  // Map to track paid and owed amounts per participant
  const paidMap: Record<string, number> = {}
  const owedMap: Record<string, number> = {}
  const categoryMap: Record<string, number> = {}

  // Initialize for all participants
  for (const p of trip.participants) {
    paidMap[p.id] = 0
    owedMap[p.id] = 0
  }

  // Iterate over expenses
  for (const exp of tripExpenses) {
    // Track category totals
    categoryMap[exp.categoryId] = (categoryMap[exp.categoryId] || 0) + exp.amount

    // Track paid by
    paidMap[exp.paidById] = (paidMap[exp.paidById] || 0) + exp.amount

    // Track owed based on splits
    for (const split of exp.splits) {
      if (split.included && split.amount > 0) {
        owedMap[split.participantId] = (owedMap[split.participantId] || 0) + split.amount
      }
    }
  }

  // Build balances array
  const balances: ParticipantBalance[] = trip.participants.map(p => {
    const totalPaid = paidMap[p.id] || 0
    const totalOwed = owedMap[p.id] || 0
    const netBalance = totalPaid - totalOwed
    return {
      participantId: p.id,
      participantName: p.name,
      totalPaid,
      totalOwed,
      netBalance,
    }
  })

  return {
    totalSpent,
    balances,
    categoryMap,
    expenseCount: tripExpenses.length,
  }
}

/**
 * @description       : Implements a greedy debt simplification algorithm to settle all balances with the minimum number of transactions.
 * @param trip        : The trip entity.
 * @param expenses    : Array of expenses for the given trip.
 * @return            : Array of optimized transfers from debtor to creditor.
 **/
export function calculateSettlement(trip: Trip, expenses: TripExpense[]): SettlementTransfer[] {
  const { balances } = calculateTripBalances(trip, expenses)
  const participantMap = new Map(trip.participants.map(p => [p.id, p.name]))

  // Separate creditors (net > 0.01) and debtors (net < -0.01)
  interface DebtNode {
    id: string
    name: string
    amount: number
  }

  const creditors: DebtNode[] = []
  const debtors: DebtNode[] = []

  for (const b of balances) {
    // Round to 2 decimals to prevent floating point inaccuracies
    const net = Math.round(b.netBalance * 100) / 100
    if (net > 0.009) {
      creditors.push({ id: b.participantId, name: b.participantName, amount: net })
    } else if (net < -0.009) {
      debtors.push({ id: b.participantId, name: b.participantName, amount: Math.abs(net) })
    }
  }

  // Sort descending by amount to optimize matches
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const transfers: SettlementTransfer[] = []
  let cIdx = 0
  let dIdx = 0

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx]
    const debtor = debtors[dIdx]
    const settleAmount = Math.min(creditor.amount, debtor.amount)
    const roundedAmount = Math.round(settleAmount * 100) / 100

    if (roundedAmount > 0) {
      transfers.push({
        fromId: debtor.id,
        fromName: debtor.name || participantMap.get(debtor.id) || "Participante",
        toId: creditor.id,
        toName: creditor.name || participantMap.get(creditor.id) || "Participante",
        amount: roundedAmount,
        currency: trip.currency,
      })
    }

    creditor.amount = Math.round((creditor.amount - settleAmount) * 100) / 100
    debtor.amount = Math.round((debtor.amount - settleAmount) * 100) / 100

    if (creditor.amount <= 0.009) cIdx++
    if (debtor.amount <= 0.009) dIdx++
  }

  return transfers
}

/**
 * @description       : Formats a complete, friendly WhatsApp report message for the group with emojis, totals, and settlement transfers.
 * @param trip        : The trip entity.
 * @param expenses    : Array of expenses for the given trip.
 * @return            : URI-encoded WhatsApp text message string.
 **/
export function generateTripWhatsAppMessage(trip: Trip, expenses: TripExpense[]): string {
  const { totalSpent, balances, expenseCount } = calculateTripBalances(trip, expenses)
  const transfers = calculateSettlement(trip, expenses)
  const tripCurrency = trip.currency || "PEN"

  const lines: string[] = []
  lines.push(`🏖️ *LIQUIDACIÓN DE CUENTAS: ${trip.name.toUpperCase()}*`)
  if (trip.destination) {
    lines.push(`📍 *Destino:* ${trip.destination}`)
  }
  lines.push(`📅 *Fecha:* ${formatShortDate(trip.startDate)}${trip.endDate ? ` al ${formatShortDate(trip.endDate)}` : ""}`)
  lines.push(`💰 *Total gastado:* ${formatCurrency(totalSpent, tripCurrency)} (${expenseCount} gastos)`)
  lines.push(`👥 *Viajeros:* ${trip.participants.length} personas`)
  lines.push(``)

  // Balance individual
  lines.push(`📊 *RESUMEN POR VIAJERO:*`)
  for (const b of balances) {
    const net = Math.round(b.netBalance * 100) / 100
    let statusText = ""
    if (net > 0.01) {
      statusText = `🟢 Recupera ${formatCurrency(net, tripCurrency)}`
    } else if (net < -0.01) {
      statusText = `🔴 Debe pagar ${formatCurrency(Math.abs(net), tripCurrency)}`
    } else {
      statusText = `⚪ Al día (Saldado)`
    }
    lines.push(`• *${b.participantName}*: Pagó ${formatCurrency(b.totalPaid, tripCurrency)} | Consumió ${formatCurrency(b.totalOwed, tripCurrency)} -> ${statusText}`)
  }
  lines.push(``)

  // Liquidación sugerida
  lines.push(`🤝 *¿CÓMO SALDAR LAS CUENTAS? (Mínimas transferencias):*`)
  if (transfers.length === 0) {
    lines.push(`✨ ¡Todo el mundo está a mano! No hay transferencias pendientes.`)
  } else {
    transfers.forEach((t, i) => {
      lines.push(`${i + 1}. *${t.fromName}* le transfiere a *${t.toName}*: *${formatCurrency(t.amount, tripCurrency)}*`)
    })
  }

  lines.push(``)
  lines.push(`📱 _Generado automáticamente con Deuditas_`)

  return encodeURIComponent(lines.join("\n"))
}

/**
 * @description       : Generates and downloads a multi-sheet Excel spreadsheet with trip expenses, participants, and settlement summary.
 * @param trip        : The trip entity.
 * @param expenses    : Array of expenses for the given trip.
 **/
export function exportTripToExcel(trip: Trip, expenses: TripExpense[]): void {
  const tripExpenses = expenses.filter(e => e.tripId === trip.id)
  const { totalSpent, balances } = calculateTripBalances(trip, expenses)
  const transfers = calculateSettlement(trip, expenses)
  const tripCurrency = trip.currency || "PEN"
  const participantMap = new Map(trip.participants.map(p => [p.id, p.name]))

  const wb = XLSX.utils.book_new()

  // Sheet 1: Gastos
  const expensesData = tripExpenses.map((exp, idx) => {
    const cat = getTripCategoryInfo(exp.categoryId)
    const paidByName = participantMap.get(exp.paidById) || "Desconocido"
    const includedNames = exp.splits
      .filter(s => s.included)
      .map(s => participantMap.get(s.participantId) || "")
      .join(", ")

    return {
      "N°": idx + 1,
      "Concepto": exp.title,
      "Categoría": `${cat.icon} ${cat.name}`,
      "Lugar": exp.location || "-",
      "Fecha": exp.date ? formatShortDate(exp.date) : "-",
      "Pagado por": paidByName,
      "Monto": exp.amount,
      "Moneda": exp.currency || tripCurrency,
      "Propina": exp.tipAmount || 0,
      "Método división": exp.splitMethod === "equal" ? "Equitativo" : exp.splitMethod === "selected" ? "Seleccionados" : "Personalizado",
      "Participantes en gasto": includedNames,
      "Notas": exp.notes || "",
    }
  })

  const wsExpenses = XLSX.utils.json_to_sheet(expensesData)
  wsExpenses["!cols"] = [
    { wch: 5 },  // N°
    { wch: 30 }, // Concepto
    { wch: 22 }, // Categoría
    { wch: 18 }, // Lugar
    { wch: 12 }, // Fecha
    { wch: 16 }, // Pagado por
    { wch: 12 }, // Monto
    { wch: 10 }, // Moneda
    { wch: 10 }, // Propina
    { wch: 16 }, // Método
    { wch: 35 }, // Participantes
    { wch: 25 }, // Notas
  ]
  XLSX.utils.book_append_sheet(wb, wsExpenses, "Gastos del Viaje")

  // Sheet 2: Balances por Viajero
  const balancesData = balances.map((b, idx) => ({
    "N°": idx + 1,
    "Viajero": b.participantName,
    "Total Pagado": b.totalPaid,
    "Total Consumido": b.totalOwed,
    "Balance Neto": b.netBalance,
    "Estado": b.netBalance > 0.01 ? "Recupera dinero" : b.netBalance < -0.01 ? "Debe transferir" : "Saldado",
    "Moneda": tripCurrency,
  }))

  const wsBalances = XLSX.utils.json_to_sheet(balancesData)
  wsBalances["!cols"] = [
    { wch: 5 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 10 },
  ]
  XLSX.utils.book_append_sheet(wb, wsBalances, "Balances de Viajeros")

  // Sheet 3: Liquidación Sugerida
  const settlementData = transfers.map((t, idx) => ({
    "N°": idx + 1,
    "Quien Paga (Deudor)": t.fromName,
    "A Quien Paga (Acreedor)": t.toName,
    "Monto a Transferir": t.amount,
    "Moneda": t.currency,
  }))

  const wsSettlement = XLSX.utils.json_to_sheet(
    settlementData.length > 0
      ? settlementData
      : [{ "Mensaje": "Todas las cuentas están saldadas sin transferencias pendientes." }]
  )
  wsSettlement["!cols"] = [
    { wch: 5 },
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
    { wch: 10 },
  ]
  XLSX.utils.book_append_sheet(wb, wsSettlement, "Liquidación Final")

  // Generate filename
  const cleanName = trip.name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20)
  const filename = `viaje-${cleanName}-${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, filename)
}
