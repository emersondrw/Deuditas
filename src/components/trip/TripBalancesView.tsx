/**
 * @description       : Balance and settlement view showing individual participant shares, net balances, and optimized debt minimization transfers.
 * @group             : Components
 * @author            : Emerson VI
 * @last modified on  : 2026-08-21
 * @last modified by  : Emerson VI
 **/

import type { Trip, TripExpense } from "../../tripTypes"
import { formatCurrency } from "../../utils/format"
import { calculateTripBalances, calculateSettlement } from "../../utils/tripSettlement"

interface Props {
  trip: Trip
  expenses: TripExpense[]
  onOpenWhatsApp: () => void
  onExportExcel: () => void
}

export function TripBalancesView({ trip, expenses, onOpenWhatsApp, onExportExcel }: Props) {
  const { totalSpent, balances, categoryMap, expenseCount } = calculateTripBalances(trip, expenses)
  const transfers = calculateSettlement(trip, expenses)
  const tripCurrency = trip.currency || "PEN"

  if (expenseCount === 0) {
    return (
      <div className="text-center py-12 text-text-secondary ledger-card rounded-xl p-6">
        <p className="text-3xl mb-2">⚖️</p>
        <h3 className="font-body font-semibold text-white text-base">Sin gastos registrados</h3>
        <p className="text-xs text-text-secondary mt-1">
          Registra los gastos del viaje para calcular automáticamente los balances y las transferencias de liquidación.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Balances por Viajero */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <h3 className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body font-medium">
              Balance por Viajero
            </h3>
          </div>
          <span className="text-xs font-mono text-cyan-300">Total: {formatCurrency(totalSpent, tripCurrency)}</span>
        </div>

        <div className="space-y-2">
          {balances.map(b => {
            const isCreditor = b.netBalance > 0.01
            const isDebtor = b.netBalance < -0.01
            const participant = trip.participants.find(p => p.id === b.participantId)
            const avatarColor = participant?.avatarColor || "#06b6d4"

            return (
              <div
                key={b.participantId}
                className="ledger-card rounded-xl p-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    style={{ backgroundColor: avatarColor }}
                    className="w-8 h-8 rounded-full text-xs font-bold text-black flex items-center justify-center font-mono shrink-0 shadow-xs"
                  >
                    {b.participantName.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-body font-medium text-sm text-white truncate">
                      {b.participantName}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-0.5 flex-wrap">
                      <span>Pagó: {formatCurrency(b.totalPaid, tripCurrency)}</span>
                      <span className="text-border-custom">•</span>
                      <span>Consumo: {formatCurrency(b.totalOwed, tripCurrency)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`font-mono text-sm font-bold tabular-nums ${
                      isCreditor
                        ? "text-emerald-400"
                        : isDebtor
                        ? "text-rose-400"
                        : "text-text-secondary"
                    }`}
                  >
                    {isCreditor ? `+${formatCurrency(b.netBalance, tripCurrency)}` : isDebtor ? `-${formatCurrency(Math.abs(b.netBalance), tripCurrency)}` : "Saldado"}
                  </p>
                  <p className="text-[10px] text-text-secondary font-body">
                    {isCreditor ? "Recupera" : isDebtor ? "Debe pagar" : "Al día"}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* LIQUIDACIÓN DE CUENTAS (Mínimas Transferencias) */}
      <div className="p-4 bg-gradient-to-b from-[#131d24] to-[#121212] rounded-2xl border border-cyan-900/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🤝</span>
            <div>
              <h3 className="font-body font-semibold text-sm text-white">
                Liquidación Sugerida
              </h3>
              <p className="text-[11px] text-text-secondary">
                Mínimo número de transferencias para saldar todas las deudas
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/40">
            {transfers.length} {transfers.length === 1 ? "transferencia" : "transferencias"}
          </span>
        </div>

        {transfers.length === 0 ? (
          <div className="text-center py-6 text-emerald-400/90 font-body text-xs flex flex-col items-center gap-1.5">
            <span className="text-2xl">✨</span>
            <span>¡Excelente! Todas las cuentas del viaje están perfectamente cuadradas.</span>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {transfers.map((t, idx) => (
              <div
                key={`${t.fromId}-${t.toId}-${idx}`}
                className="bg-[#181818]/90 border border-border-custom rounded-xl p-3 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-mono text-xs text-text-secondary">#{idx + 1}</span>
                  <span className="font-body font-medium text-xs text-rose-300 truncate">
                    {t.fromName}
                  </span>
                  <span className="text-text-secondary text-xs shrink-0">le transfiere a</span>
                  <span className="font-body font-medium text-xs text-emerald-300 truncate">
                    {t.toName}
                  </span>
                </div>
                <span className="font-mono font-bold text-sm text-white shrink-0 tabular-nums">
                  {formatCurrency(t.amount, t.currency)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Acciones de Liquidación: WhatsApp y Excel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border-custom/60">
          <button
            type="button"
            onClick={onOpenWhatsApp}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-xs font-body font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer group"
          >
            <span className="text-base group-hover:scale-110 transition-transform">📱</span>
            <span>Compartir en WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onExportExcel}
            className="w-full py-2.5 px-3 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-border-custom hover:border-cyan-500/40 text-white text-xs font-body font-medium flex items-center justify-center gap-2 transition-all cursor-pointer group"
          >
            <span className="text-base group-hover:translate-y-[-2px] transition-transform">📊</span>
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>
    </div>
  )
}
