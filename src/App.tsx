/**
 * @description       : Main application entry point providing Personal Debts and Group Trips navigation, export/import management, and modal orchestration.
 * @group             : Core
 * @author            : Emerson VI
 * @last modified on  : 2026-08-21
 * @last modified by  : Emerson VI
 **/

import { useState, useRef, useMemo } from "react"
import { useDebtStore } from "./store"
import { useTripStore } from "./tripStore"
import { SummaryBar } from "./components/SummaryBar"
import { DebtForm } from "./components/DebtForm"
import { DebtList } from "./components/DebtList"
import { DebtDetail } from "./components/DebtDetail"
import { InfoModal } from "./components/InfoModal"
import { ExportModal } from "./components/ExportModal"
import { CurrencyModal } from "./components/CurrencyModal"
import { TripTabSelector, type AppTab } from "./components/trip/TripTabSelector"
import { TripList } from "./components/trip/TripList"
import { TripDetailView } from "./components/trip/TripDetailView"
import { TripCreateModal } from "./components/trip/TripCreateModal"
import { exportToExcel } from "./utils/exportExcel"
import { getCurrencyInfo } from "./utils/format"
import type { DebtType, DebtEntry } from "./types"
import type { Trip, TripExpense } from "./tripTypes"

export default function App() {
  // Personal Debts Store
  const {
    entries,
    currency,
    setCurrency,
    addEntry,
    updateEntry,
    addToExisting,
    togglePaid,
    findActiveByNameTypeAndCurrency,
    names,
    exportData,
    importData,
  } = useDebtStore()

  // Group Trips Store
  const {
    trips,
    expenses,
    selectedTripId,
    setSelectedTripId,
    createTrip,
    updateTrip,
    deleteTrip,
    addParticipant,
    removeParticipant,
    addExpense,
    updateExpense,
    deleteExpense,
    toggleTripStatus,
    exportTripData,
    importTripData,
  } = useTripStore()

  // Navigation and UI State
  const [activeTab, setActiveTab] = useState<AppTab>("personal")
  const [tripCreateModalOpen, setTripCreateModalOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [infoOpen, setInfoOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<string | null>(null)

  const currencyInfo = getCurrencyInfo(currency)
  const detailEntry = detailId ? entries.find(e => e.id === detailId) ?? null : null

  // Active selected trip object
  const activeTrip = useMemo(
    () => (selectedTripId ? trips.find(t => t.id === selectedTripId) ?? null : null),
    [trips, selectedTripId]
  )

  const activeTripsCount = useMemo(
    () => trips.filter(t => t.status === "activo").length,
    [trips]
  )

  const handleAddToExisting = (name: string, amount: number, type: DebtType, itemCurrency: string): boolean => {
    const existing = findActiveByNameTypeAndCurrency(name, type, itemCurrency)
    if (existing) {
      addToExisting(existing.id, amount, "incremento", `Nuevo registro desde formulario`)
      return true
    }
    return false
  }

  const handleExportJson = () => {
    const personalJson = JSON.parse(exportData())
    const tripData = exportTripData()

    const combinedBackup = {
      version: 2,
      currency,
      exportedAt: personalJson.exportedAt,
      entries: personalJson.entries,
      trips: tripData.trips,
      tripExpenses: tripData.tripExpenses,
    }

    const json = JSON.stringify(combinedBackup, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `deuditas-completo-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast("Respaldo completo JSON exportado")
  }

  const handleExportExcel = () => {
    exportToExcel(entries, currency)
    showToast("Reporte Excel exportado")
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const rawContent = reader.result as string
        const parsed = JSON.parse(rawContent)

        // Import personal debts
        const okPersonal = importData(rawContent)

        // Import trips if present
        if (parsed && (Array.isArray(parsed.trips) || Array.isArray(parsed.tripExpenses))) {
          importTripData({
            trips: parsed.trips as Trip[],
            tripExpenses: parsed.tripExpenses as TripExpense[],
          })
        }

        if (okPersonal || parsed.trips) {
          showToast("Datos importados correctamente")
        } else {
          showToast("Error: archivo inválido")
        }
      } catch {
        showToast("Error al procesar el archivo")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white pb-24">
      <div className="max-w-md mx-auto px-4 pt-8">
        <header className="mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="text-3xl font-display leading-none">Deuditas</h1>
                <button
                  onClick={() => setInfoOpen(true)}
                  className="w-6 h-6 rounded-full bg-[#2a2a2a] flex items-center justify-center text-text-secondary hover:text-white hover:bg-[#333] transition-colors text-xs cursor-pointer"
                  title="Cómo funciona"
                >
                  ?
                </button>
                <button
                  onClick={() => setCurrencyModalOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-[#181818] border border-border-custom hover:border-text-secondary/50 hover:bg-[#222] text-xs font-mono text-white/90 hover:text-white transition-all flex items-center gap-1.5 group cursor-pointer shadow-xs"
                  title="Cambiar moneda"
                >
                  <span className="text-accent-owed font-semibold">{currencyInfo.symbol}</span>
                  <span className="text-text-secondary group-hover:text-white text-[11px] transition-colors">{currencyInfo.code}</span>
                  <svg className="w-3 h-3 text-text-secondary/60 group-hover:text-text-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-text-secondary mt-2 font-body">
                {activeTab === "personal"
                  ? "Controla quién te debe y a quién le debes"
                  : "Gastos compartidos para playa y viajes en grupo"}
              </p>
            </div>

            <div className="flex gap-1.5 shrink-0">
              {/* Botón Exportar */}
              <button
                onClick={() => setExportModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:text-white bg-[#141414] hover:bg-[#1c1c1c] border border-border-custom/80 hover:border-emerald-500/40 transition-all font-body flex items-center gap-1.5 cursor-pointer group"
                title="Exportar registros (JSON o Excel)"
              >
                <svg className="w-3.5 h-3.5 text-text-secondary group-hover:text-emerald-400 group-hover:-translate-y-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Exportar</span>
              </button>

              {/* Botón Importar */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:text-white bg-[#141414] hover:bg-[#1c1c1c] border border-border-custom/80 hover:border-blue-500/40 transition-all font-body flex items-center gap-1.5 cursor-pointer group"
                title="Importar respaldo (.json)"
              >
                <svg className="w-3.5 h-3.5 text-text-secondary group-hover:text-blue-400 group-hover:translate-y-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Importar</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
        </header>

        {/* Segmented Top Selector: Deudas Personales vs. Viajes & Grupos */}
        <TripTabSelector
          activeTab={activeTab}
          onSelectTab={tab => {
            setActiveTab(tab)
          }}
          activeTripsCount={activeTripsCount}
        />

        {/* DIVIDER */}
        <div className="mb-6 flex items-center gap-2 text-border-custom select-none">
          <span className="flex-1 h-px bg-border-custom" />
          <span className="font-mono text-[10px] text-border-custom tracking-[0.2em]">
            {activeTab === "personal" ? "DEUDITAS PERSONALES" : "VIAJES & TURISMO"}
          </span>
          <span className="flex-1 h-px bg-border-custom" />
        </div>

        {/* TAB 1: PERSONAL DEBTS */}
        {activeTab === "personal" && (
          <div>
            <SummaryBar entries={entries} currency={currency} />

            <DebtForm
              names={names}
              currency={currency}
              onAdd={addEntry}
              onAddToExisting={handleAddToExisting}
            />

            <DebtList
              entries={entries}
              currency={currency}
              onTogglePaid={togglePaid}
              onOpenDetail={setDetailId}
            />
          </div>
        )}

        {/* TAB 2: GROUP TRIPS */}
        {activeTab === "trips" && (
          <div>
            {activeTrip ? (
              <TripDetailView
                trip={activeTrip}
                expenses={expenses}
                onBack={() => setSelectedTripId(null)}
                onAddExpense={params => addExpense(activeTrip.id, params)}
                onUpdateExpense={updateExpense}
                onDeleteExpense={deleteExpense}
                onUpdateTrip={updateTrip}
                onDeleteTrip={deleteTrip}
                onToggleTripStatus={toggleTripStatus}
                onAddParticipant={addParticipant}
                onRemoveParticipant={removeParticipant}
              />
            ) : (
              <TripList
                trips={trips}
                expenses={expenses}
                onOpenTrip={setSelectedTripId}
                onCreateTripClick={() => setTripCreateModalOpen(true)}
                onToggleTripStatus={toggleTripStatus}
              />
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 ledger-card rounded-xl px-5 py-3 text-sm text-white z-50 animate-slide-up shadow-lg border border-cyan-500/30">
          {toast}
        </div>
      )}

      {/* Personal Debt Detail Modal */}
      <DebtDetail
        entry={detailEntry}
        currency={currency}
        onClose={() => setDetailId(null)}
        onAddPago={(id, amount, note) => addToExisting(id, amount, "pago-parcial", note)}
        onAddIncremento={(id, amount, note) => addToExisting(id, amount, "incremento", note)}
        onUpdateEntry={updateEntry}
      />

      {/* Trip Creation Modal */}
      <TripCreateModal
        open={tripCreateModalOpen}
        defaultCurrency={currency}
        onClose={() => setTripCreateModalOpen(false)}
        onCreateTrip={(name, destination, tripCurrency, participants, options) => {
          createTrip(name, destination, tripCurrency, participants, options)
          showToast(`¡Viaje "${name}" creado con éxito! 🏖️`)
        }}
      />

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        currency={currency}
        onClose={() => setExportModalOpen(false)}
        onExportJson={handleExportJson}
        onExportExcel={handleExportExcel}
      />

      {/* Currency Modal */}
      <CurrencyModal
        open={currencyModalOpen}
        currentCurrency={currency}
        onSelectCurrency={(code) => {
          setCurrency(code)
          showToast(`Moneda cambiada a ${code}`)
        }}
        onClose={() => setCurrencyModalOpen(false)}
      />

      {/* Info / Help Modal */}
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  )
}
