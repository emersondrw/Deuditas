/**
 * @description       : Utility for exporting debt entries into a structured Excel (.xlsx) workbook.
 * @group             : Utilities
 * @author            : Emerson VI
 * @last modified on  : 2026-07-21
 **/
import * as XLSX from "xlsx"
import type { DebtEntry } from "../types"

export function exportToExcel(entries: DebtEntry[]): void {
  const wb = XLSX.utils.book_new()

  // 1. Group entries by Name
  const groupedByName: Record<
    string,
    {
      name: string
      activeMeDeben: number
      activeDebo: number
      pagadosMeDeben: number
      pagadosDebo: number
      totalEntries: number
    }
  > = {}

  // Sort entries alphabetically by name first
  const sortedEntries = [...entries].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  )

  sortedEntries.forEach((entry) => {
    const key = entry.name.trim().toLowerCase()
    if (!groupedByName[key]) {
      groupedByName[key] = {
        name: entry.name.trim(),
        activeMeDeben: 0,
        activeDebo: 0,
        pagadosMeDeben: 0,
        pagadosDebo: 0,
        totalEntries: 0,
      }
    }

    const group = groupedByName[key]
    group.totalEntries += 1

    if (entry.status === "activo") {
      if (entry.type === "me-deben") group.activeMeDeben += entry.amount
      else group.activeDebo += entry.amount
    } else {
      if (entry.type === "me-deben") group.pagadosMeDeben += entry.amount
      else group.pagadosDebo += entry.amount
    }
  })

  // Sheet 1: Resumen Agrupado por Nombre
  const summaryRows = Object.values(groupedByName)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
    .map((g) => ({
      Nombre: g.name,
      "Me Deben (Activo)": g.activeMeDeben,
      "Le Debo (Activo)": g.activeDebo,
      "Saldo Neto Activo": g.activeMeDeben - g.activeDebo,
      "Total Registros": g.totalEntries,
      "Histórico Pagado (Me deben)": g.pagadosMeDeben,
      "Histórico Pagado (Le debo)": g.pagadosDebo,
    }))

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows)
  summarySheet["!cols"] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 25 },
    { wch: 25 },
  ]
  XLSX.utils.book_append_sheet(wb, summarySheet, "Resumen por Nombre")

  // Sheet 2: Detalle de Deudas (Ordenado por Nombre)
  const detailRows = sortedEntries.map((e) => ({
    Nombre: e.name,
    Tipo: e.type === "me-deben" ? "Me deben" : "Le debes",
    "Monto Actual": e.amount,
    Estado: e.status === "activo" ? "Activo" : "Pagado",
    "Fecha Creación": e.createdAt,
  }))

  const detailSheet = XLSX.utils.json_to_sheet(detailRows)
  detailSheet["!cols"] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 20 },
  ]
  XLSX.utils.book_append_sheet(wb, detailSheet, "Detalle de Deudas")

  // Sheet 3: Historial de Movimientos (Ordenado por Nombre)
  const historyRows: Array<{
    Nombre: string
    "Tipo Deuda": string
    "Tipo Movimiento": string
    Monto: number
    Nota: string
    Fecha: string
  }> = []

  sortedEntries.forEach((e) => {
    const sortedHistory = [...e.history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    sortedHistory.forEach((h) => {
      let movType = "Creación"
      if (h.type === "pago-parcial") movType = "Pago parcial"
      if (h.type === "incremento") movType = "Incremento"

      historyRows.push({
        Nombre: e.name,
        "Tipo Deuda": e.type === "me-deben" ? "Me deben" : "Le debes",
        "Tipo Movimiento": movType,
        Monto: h.amount,
        Nota: h.note || "",
        Fecha: h.date,
      })
    })
  })

  const historySheet = XLSX.utils.json_to_sheet(historyRows)
  historySheet["!cols"] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 30 },
    { wch: 20 },
  ]
  XLSX.utils.book_append_sheet(wb, historySheet, "Historial de Movimientos")

  // Save workbook
  const dateStr = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `deuditas-reporte-${dateStr}.xlsx`)
}
