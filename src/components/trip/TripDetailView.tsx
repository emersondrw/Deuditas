/**
 * @description       : Full-screen view for an active trip with sub-navigation for Expenses, Balances & Settlement, and Participants.
 * @group             : Components
 * @author            : Emerson VI
 * @last modified on  : 2026-08-21
 * @last modified by  : Emerson VI
 **/

import { useState, useMemo } from "react"
import type { Trip, TripExpense, SplitMethod, ExpenseSplit } from "../../tripTypes"
import { formatCurrency, formatShortDate } from "../../utils/format"
import { calculateTripBalances, exportTripToExcel } from "../../utils/tripSettlement"
import { TRIP_CATEGORIES } from "../../utils/tripCategories"
import { TripExpenseCard } from "./TripExpenseCard"
import { TripExpenseModal } from "./TripExpenseModal"
import { TripBalancesView } from "./TripBalancesView"
import { TripParticipantsView } from "./TripParticipantsView"
import { TripWhatsAppModal } from "./TripWhatsAppModal"
import { TripCreateModal } from "./TripCreateModal"

interface Props {
  trip: Trip
  expenses: TripExpense[]
  onBack: () => void
  onAddExpense: (params: {
    title: string
    amount: number
    currency: string
    paidById: string
    categoryId: string
    location?: string
    date?: string
    notes?: string
    splitMethod: SplitMethod
    splits?: ExpenseSplit[]
    tipAmount?: number
  }) => void
  onUpdateExpense: (
    expenseId: string,
    params: {
      title?: string
      amount?: number
      currency?: string
      paidById?: string
      categoryId?: string
      location?: string
      date?: string
      notes?: string
      splitMethod?: SplitMethod
      splits?: ExpenseSplit[]
      tipAmount?: number
    }
  ) => void
  onDeleteExpense: (expenseId: string) => void
  onUpdateTrip: (
    tripId: string,
    updates: Partial<Omit<Trip, "id" | "createdAt" | "participants">>
  ) => void
  onDeleteTrip: (tripId: string) => void
  onToggleTripStatus: (tripId: string) => void
  onAddParticipant: (tripId: string, name: string) => void
  onRemoveParticipant: (tripId: string, participantId: string) => void
}

type TripSubTab = "expenses" | "balances" | "participants"

export function TripDetailView({
  trip,
  expenses,
  onBack,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onUpdateTrip,
  onDeleteTrip,
  onToggleTripStatus,
  onAddParticipant,
  onRemoveParticipant,
}: Props) {
  const [subTab, setSubTab] = useState<TripSubTab>("expenses")
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<TripExpense | null>(null)
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false)
  const [editTripModalOpen, setEditTripModalOpen] = useState(false)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const tripExpenses = useMemo(
    () => expenses.filter(e => e.tripId === trip.id),
    [expenses, trip.id]
  )

  const { totalSpent, expenseCount } = calculateTripBalances(trip, expenses)
  const budget = trip.budget || 0
  const hasBudget = budget > 0
  const remainingBudget = budget - totalSpent
  const perPersonAvg =
    trip.participants.length > 0 ? totalSpent / trip.participants.length : totalSpent

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return tripExpenses.filter(e => {
      if (selectedCategoryFilter && e.categoryId !== selectedCategoryFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = e.title.toLowerCase().includes(q)
        const matchLocation = e.location?.toLowerCase().includes(q) || false
        const matchPayer = trip.participants.find(p => p.id === e.paidById)?.name.toLowerCase().includes(q) || false
        if (!matchTitle && !matchLocation && !matchPayer) return false
      }
      return true
    })
  }, [tripExpenses, selectedCategoryFilter, searchQuery, trip.participants])

  const handleOpenEditExpense = (exp: TripExpense) => {
    setEditingExpense(exp)
    setExpenseModalOpen(true)
  }

  const handleOpenNewExpense = () => {
    setEditingExpense(null)
    setExpenseModalOpen(true)
  }

  return (
    <div className="animate-fade-in">
      {/* Top Back & Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-surface-hover"
        >
          <span className="text-sm">←</span>
          <span>Todos los viajes</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setWhatsAppModalOpen(true)}
            className="px-2.5 py-1 rounded-lg text-xs bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Compartir en WhatsApp"
          >
            <span>📱</span>
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => exportTripToExcel(trip, expenses)}
            className="px-2.5 py-1 rounded-lg text-xs bg-[#1c1c1c] hover:bg-[#262626] text-text-secondary hover:text-white border border-border-custom flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Descargar Excel"
          >
            <span>📊</span>
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleTripStatus(trip.id)}
            className="px-2.5 py-1 rounded-lg text-xs bg-[#1c1c1c] hover:bg-[#262626] text-text-secondary hover:text-white border border-border-custom transition-colors cursor-pointer"
            title={trip.status === "finalizado" ? "Reabrir viaje" : "Finalizar viaje"}
          >
            {trip.status === "finalizado" ? "Reabrir" : "Finalizar"}
          </button>

          <button
            type="button"
            onClick={() => setEditTripModalOpen(true)}
            className="px-2.5 py-1 rounded-lg text-xs bg-[#1c1c1c] hover:bg-[#262626] text-text-secondary hover:text-white border border-border-custom transition-colors cursor-pointer"
            title="Configurar viaje"
          >
            ⚙️
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm(`¿Estás seguro de eliminar el viaje "${trip.name}" y todos sus gastos asociados?`)) {
                onDeleteTrip(trip.id)
                onBack()
              }
            }}
            className="px-2.5 py-1 rounded-lg text-xs bg-rose-950/40 hover:bg-rose-900/60 text-rose-300/80 hover:text-rose-200 border border-rose-800/40 transition-colors cursor-pointer"
            title="Eliminar viaje"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Trip Hero Card */}
      <div className="ledger-card rounded-2xl p-5 mb-5 relative overflow-hidden border border-cyan-900/40 bg-gradient-to-br from-[#0c1a24] via-[#141414] to-[#121212]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-2xl sm:text-3xl text-white tracking-tight">
                {trip.name}
              </h2>
              <span
                className={`text-[10px] uppercase font-body px-2 py-0.5 rounded-full border font-medium ${
                  trip.status === "finalizado"
                    ? "bg-[#252525] text-text-secondary border-border-custom"
                    : "bg-cyan-950/80 text-cyan-300 border-cyan-700/40"
                }`}
              >
                {trip.status === "finalizado" ? "Finalizado" : "En curso"}
              </span>
            </div>

            <p className="text-xs text-text-secondary font-body mt-1.5 flex items-center gap-1.5">
              <span>📍 {trip.destination || "Playa & Turismo"}</span>
              <span className="text-border-custom">•</span>
              <span>
                {formatShortDate(trip.startDate)}
                {trip.endDate ? ` al ${formatShortDate(trip.endDate)}` : ""}
              </span>
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase tracking-wider text-text-secondary">Moneda</p>
            <span className="font-mono text-xs font-bold text-cyan-300 px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-700/40 inline-block mt-0.5">
              {trip.currency}
            </span>
          </div>
        </div>

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-border-custom/60">
          <div className="bg-[#181818]/80 p-2.5 rounded-xl border border-border-custom/80">
            <p className="text-[10px] uppercase tracking-wider text-text-secondary font-body">
              Total Gastado
            </p>
            <p className="font-mono text-base sm:text-lg font-bold text-cyan-300 tabular-nums mt-0.5">
              {formatCurrency(totalSpent, trip.currency)}
            </p>
          </div>

          <div className="bg-[#181818]/80 p-2.5 rounded-xl border border-border-custom/80">
            <p className="text-[10px] uppercase tracking-wider text-text-secondary font-body">
              Gasto Promedio
            </p>
            <p className="font-mono text-base sm:text-lg font-semibold text-gray-200 tabular-nums mt-0.5">
              {formatCurrency(perPersonAvg, trip.currency)}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-[#181818]/80 p-2.5 rounded-xl border border-border-custom/80">
            <p className="text-[10px] uppercase tracking-wider text-text-secondary font-body">
              {hasBudget ? "Presupuesto Restante" : "Viajeros"}
            </p>
            <p className={`font-mono text-base sm:text-lg font-semibold tabular-nums mt-0.5 ${hasBudget && remainingBudget < 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {hasBudget ? formatCurrency(remainingBudget, trip.currency) : `${trip.participants.length} integrantes`}
            </p>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-[#141414] rounded-xl border border-border-custom mb-5 select-none">
        <button
          type="button"
          onClick={() => setSubTab("expenses")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-body font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === "expenses"
              ? "bg-[#222] text-white shadow-sm border border-white/10 font-semibold"
              : "text-text-secondary hover:text-white hover:bg-[#1a1a1a]"
          }`}
        >
          <span>📋</span>
          <span>Gastos ({expenseCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("balances")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-body font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === "balances"
              ? "bg-[#222] text-white shadow-sm border border-white/10 font-semibold"
              : "text-text-secondary hover:text-white hover:bg-[#1a1a1a]"
          }`}
        >
          <span>⚖️</span>
          <span>Liquidación</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("participants")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-body font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === "participants"
              ? "bg-[#222] text-white shadow-sm border border-white/10 font-semibold"
              : "text-text-secondary hover:text-white hover:bg-[#1a1a1a]"
          }`}
        >
          <span>👥</span>
          <span>Viajeros ({trip.participants.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: EXPENSES LIST */}
      {subTab === "expenses" && (
        <div className="space-y-4">
          {/* Main Action Button */}
          <button
            type="button"
            onClick={handleOpenNewExpense}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-body font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition-all cursor-pointer active:scale-98"
          >
            <span className="text-lg">🏖️</span>
            <span>+ Registrar Gasto del Viaje</span>
          </button>

          {/* Quick Filters */}
          <div className="space-y-2">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por concepto, lugar o pagador..."
                className="w-full ledger-input rounded-xl pl-9 pr-4 py-2 text-xs text-white font-body placeholder:text-text-secondary/50"
              />
              <span className="absolute left-3 top-2.5 text-xs text-text-secondary">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-text-secondary hover:text-white font-mono"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter(null)}
                className={`px-2.5 py-1 rounded-full text-xs font-body transition-colors cursor-pointer shrink-0 ${
                  selectedCategoryFilter === null
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-600/50 font-medium"
                    : "bg-[#181818] text-text-secondary border border-border-custom hover:text-white"
                }`}
              >
                Todas las categorías
              </button>

              {TRIP_CATEGORIES.map(cat => {
                const isSelected = selectedCategoryFilter === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(isSelected ? null : cat.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-body transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-600/50 font-medium"
                        : "bg-[#181818] text-text-secondary border border-border-custom hover:text-white"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name.split("&")[0]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Expenses List */}
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-text-secondary ledger-card rounded-xl p-6">
              <p className="text-3xl mb-2">🏖️</p>
              <h3 className="font-body font-semibold text-white text-base">
                {tripExpenses.length === 0 ? "No hay gastos registrados aún" : "No hay resultados para el filtro"}
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                {tripExpenses.length === 0
                  ? "Registra toldos, ceviches, traslados, compras de supermercado y más."
                  : "Prueba seleccionando otra categoría o borrando la búsqueda."}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <h3 className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body font-medium">
                  Historial de Gastos
                </h3>
                <span className="text-xs font-mono text-cyan-300">
                  {filteredExpenses.length} {filteredExpenses.length === 1 ? "registro" : "registros"}
                </span>
              </div>

              {filteredExpenses.map(exp => (
                <TripExpenseCard
                  key={exp.id}
                  expense={exp}
                  trip={trip}
                  onEdit={handleOpenEditExpense}
                  onDelete={onDeleteExpense}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: BALANCES & SETTLEMENT */}
      {subTab === "balances" && (
        <TripBalancesView
          trip={trip}
          expenses={expenses}
          onOpenWhatsApp={() => setWhatsAppModalOpen(true)}
          onExportExcel={() => exportTripToExcel(trip, expenses)}
        />
      )}

      {/* SUBTAB 3: PARTICIPANTS */}
      {subTab === "participants" && (
        <TripParticipantsView
          trip={trip}
          expenses={expenses}
          onAddParticipant={name => onAddParticipant(trip.id, name)}
          onRemoveParticipant={id => onRemoveParticipant(trip.id, id)}
        />
      )}

      {/* Modals */}
      <TripExpenseModal
        open={expenseModalOpen}
        trip={trip}
        expense={editingExpense}
        onClose={() => setExpenseModalOpen(false)}
        onSave={params => {
          if (editingExpense) {
            onUpdateExpense(editingExpense.id, params)
          } else {
            onAddExpense({
              ...params,
            })
          }
        }}
      />

      <TripWhatsAppModal
        open={whatsAppModalOpen}
        trip={trip}
        expenses={expenses}
        onClose={() => setWhatsAppModalOpen(false)}
      />

      <TripCreateModal
        open={editTripModalOpen}
        editingTrip={trip}
        onClose={() => setEditTripModalOpen(false)}
        onCreateTrip={() => {}}
        onUpdateTrip={onUpdateTrip}
      />
    </div>
  )
}
