/**
 * @description       : Card component representing a single trip expense with beach category icon, payer info, and split breakdown.
 * @group             : Components
 * @author            : Emerson VI
 * @last modified on  : 2026-08-21
 * @last modified by  : Emerson VI
 **/

import type { Trip, TripExpense } from "../../tripTypes"
import { formatCurrency, formatShortDate } from "../../utils/format"
import { getTripCategoryInfo } from "../../utils/tripCategories"

interface Props {
  expense: TripExpense
  trip: Trip
  onEdit: (expense: TripExpense) => void
  onDelete: (expenseId: string) => void
}

export function TripExpenseCard({ expense, trip, onEdit, onDelete }: Props) {
  const category = getTripCategoryInfo(expense.categoryId)
  const payer = trip.participants.find(p => p.id === expense.paidById)
  const payerName = payer ? payer.name : "Desconocido"
  const payerColor = payer?.avatarColor || "#06b6d4"

  const includedSplits = expense.splits.filter(s => s.included)
  const isAllIncluded = includedSplits.length === trip.participants.length

  return (
    <div className="ledger-card rounded-xl p-4 mb-2.5 transition-all duration-200 hover:border-cyan-500/30 group">
      <div className="flex items-start justify-between gap-3">
        {/* Left Side: Icon & Details */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            style={{ backgroundColor: `${category.color}15`, borderColor: `${category.color}40` }}
            className="w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 mt-0.5"
            title={category.name}
          >
            {category.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-body font-medium text-sm text-white truncate">
                {expense.title}
              </h4>
              <span
                style={{ color: category.color, borderColor: `${category.color}40` }}
                className="text-[10px] font-body px-1.5 py-0.2 rounded-md bg-[#1d1d1d] border shrink-0"
              >
                {category.name}
              </span>
            </div>

            {/* Payer & Split Info */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs text-text-secondary">
              <div className="flex items-center gap-1">
                <span
                  style={{ backgroundColor: payerColor }}
                  className="w-4 h-4 rounded-full text-[9px] font-bold text-black flex items-center justify-center font-mono"
                >
                  {payerName.charAt(0)}
                </span>
                <span className="text-gray-300 font-medium">Pagó {payerName}</span>
              </div>

              <span className="text-border-custom">•</span>

              <span className="text-text-secondary text-[11px]">
                {isAllIncluded
                  ? `Entre todos (${trip.participants.length})`
                  : `Entre ${includedSplits.length} ${includedSplits.length === 1 ? "persona" : "personas"}`}
              </span>

              {expense.location && (
                <>
                  <span className="text-border-custom">•</span>
                  <span className="text-cyan-300/80 text-[11px] flex items-center gap-0.5">
                    📍 {expense.location}
                  </span>
                </>
              )}

              <span className="text-border-custom">•</span>
              <span className="text-text-secondary text-[11px]">
                {formatShortDate(expense.date)}
              </span>
            </div>

            {/* Optional Notes */}
            {expense.notes && (
              <p className="text-[11px] text-text-secondary/70 italic mt-1 font-body">
                "{expense.notes}"
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Amount & Actions */}
        <div className="text-right shrink-0">
          <p className="font-mono text-base font-bold text-white tabular-nums">
            {formatCurrency(expense.amount, expense.currency || trip.currency)}
          </p>
          {expense.tipAmount && expense.tipAmount > 0 && (
            <p className="text-[10px] font-mono text-amber-400">
              +{formatCurrency(expense.tipAmount, expense.currency || trip.currency)} propina
            </p>
          )}

          <div className="flex items-center justify-end gap-1 mt-2">
            <button
              onClick={() => onEdit(expense)}
              className="text-[11px] text-text-secondary hover:text-cyan-300 px-2 py-1 rounded-md hover:bg-surface-hover transition-colors font-body cursor-pointer"
              title="Editar gasto"
            >
              Editar
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Eliminar el gasto "${expense.title}"?`)) {
                  onDelete(expense.id)
                }
              }}
              className="text-[11px] text-text-secondary hover:text-rose-400 px-2 py-1 rounded-md hover:bg-rose-950/30 transition-colors font-body cursor-pointer"
              title="Eliminar gasto"
            >
              Borrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
