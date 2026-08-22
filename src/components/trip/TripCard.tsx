/**
 * @description       : Card component displaying high-level trip statistics, participant avatars, destination, and status.
 * @group             : Components
 * @author            : Emerson VI
 * @last modified on  : 2026-08-21
 * @last modified by  : Emerson VI
 **/

import type { Trip, TripExpense } from "../../tripTypes"
import { formatCurrency, formatShortDate } from "../../utils/format"
import { calculateTripBalances } from "../../utils/tripSettlement"

interface Props {
  trip: Trip
  expenses: TripExpense[]
  onOpenTrip: (tripId: string) => void
  onToggleStatus?: (tripId: string) => void
}

export function TripCard({ trip, expenses, onOpenTrip }: Props) {
  const { totalSpent, expenseCount } = calculateTripBalances(trip, expenses)
  const isFinalized = trip.status === "finalizado"
  const budget = trip.budget || 0
  const hasBudget = budget > 0
  const budgetPercentage = hasBudget ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0
  const isOverBudget = hasBudget && totalSpent > budget

  return (
    <div
      onClick={() => onOpenTrip(trip.id)}
      className={`
        ledger-card rounded-xl p-4.5 mb-3 transition-all duration-200 cursor-pointer group relative overflow-hidden
        hover:border-cyan-500/40 hover:bg-[#1c1c1c] active:scale-[0.99]
        ${isFinalized ? "opacity-60 grayscale-[30%]" : ""}
      `}
    >
      {/* Subtle coastal accent glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">🏖️</span>
            <h3 className="font-body font-semibold text-base text-white group-hover:text-cyan-200 transition-colors truncate">
              {trip.name}
            </h3>
            {isFinalized ? (
              <span className="text-[10px] uppercase font-body px-2 py-0.5 rounded-md bg-[#252525] text-text-secondary border border-border-custom font-medium">
                Finalizado
              </span>
            ) : (
              <span className="text-[10px] uppercase font-body px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-700/40 font-medium animate-pulse">
                En curso
              </span>
            )}
          </div>

          {trip.destination && (
            <p className="text-xs text-text-secondary font-body mt-1 flex items-center gap-1">
              <span>📍</span>
              <span className="text-gray-300 font-medium">{trip.destination}</span>
              <span className="text-border-custom">•</span>
              <span className="text-text-secondary">
                {formatShortDate(trip.startDate)}
                {trip.endDate ? ` - ${formatShortDate(trip.endDate)}` : ""}
              </span>
            </p>
          )}

          {/* Participant avatars stack */}
          <div className="flex items-center gap-1.5 mt-3">
            <div className="flex -space-x-2 overflow-hidden">
              {trip.participants.slice(0, 5).map(p => (
                <div
                  key={p.id}
                  style={{ backgroundColor: p.avatarColor || "#06b6d4" }}
                  className="w-6 h-6 rounded-full border-2 border-[#181818] flex items-center justify-center text-[10px] font-bold text-black font-mono shadow-xs"
                  title={p.name}
                >
                  {p.name.charAt(0)}
                </div>
              ))}
              {trip.participants.length > 5 && (
                <div className="w-6 h-6 rounded-full border-2 border-[#181818] bg-[#2a2a2a] text-text-secondary flex items-center justify-center text-[9px] font-mono font-bold">
                  +{trip.participants.length - 5}
                </div>
              )}
            </div>
            <span className="text-[11px] text-text-secondary font-body ml-1">
              {trip.participants.length} {trip.participants.length === 1 ? "viajero" : "viajeros"}
            </span>
          </div>
        </div>

        {/* Amount column */}
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-wider text-text-secondary font-body">Total gastado</p>
          <p className="font-mono text-base sm:text-lg font-bold text-cyan-300 tabular-nums mt-0.5">
            {formatCurrency(totalSpent, trip.currency)}
          </p>
          <p className="text-[11px] text-text-secondary font-mono mt-0.5">
            {expenseCount} {expenseCount === 1 ? "gasto" : "gastos"}
          </p>
        </div>
      </div>

      {/* Budget progress bar */}
      {hasBudget && (
        <div className="mt-3.5 pt-3 border-t border-border-custom/60">
          <div className="flex items-center justify-between text-[11px] font-body mb-1">
            <span className="text-text-secondary">Presupuesto ({budgetPercentage}%)</span>
            <span className={`font-mono ${isOverBudget ? "text-rose-400 font-semibold" : "text-gray-300"}`}>
              {formatCurrency(totalSpent, trip.currency)} / {formatCurrency(budget, trip.currency)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#252525] rounded-full overflow-hidden">
            <div
              style={{ width: `${budgetPercentage}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? "bg-rose-500"
                  : budgetPercentage > 85
                  ? "bg-amber-500"
                  : "bg-cyan-400"
              }`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
