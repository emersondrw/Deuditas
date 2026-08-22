/**
 * @description       : Trips overview listing active and finalized trips with quick create button and beach travel inspiration.
 * @group             : Components
 * @author            : Emerson VI
 * @last modified on  : 2026-08-21
 * @last modified by  : Emerson VI
 **/

import type { Trip, TripExpense } from "../../tripTypes"
import { TripCard } from "./TripCard"

interface Props {
  trips: Trip[]
  expenses: TripExpense[]
  onOpenTrip: (tripId: string) => void
  onCreateTripClick: () => void
  onToggleTripStatus?: (tripId: string) => void
}

export function TripList({
  trips,
  expenses,
  onOpenTrip,
  onCreateTripClick,
}: Props) {
  const activos = trips.filter(t => t.status === "activo")
  const finalizados = trips.filter(t => t.status === "finalizado")

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Action Header Button */}
      <button
        type="button"
        onClick={onCreateTripClick}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-body font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition-all cursor-pointer active:scale-98"
      >
        <span className="text-lg">🏖️</span>
        <span>+ Crear Nuevo Viaje en Grupo</span>
      </button>

      {/* Empty State */}
      {trips.length === 0 ? (
        <div className="text-center py-12 px-6 ledger-card rounded-2xl border border-border-custom relative overflow-hidden bg-gradient-to-b from-[#141414] to-[#0f1418]">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
            🏖️
          </div>
          <h3 className="font-display text-xl sm:text-2xl text-white">
            Tu próximo viaje a la playa
          </h3>
          <p className="text-xs text-text-secondary mt-2 max-w-sm mx-auto font-body leading-relaxed">
            Lleva el control de toldos, cevicherías, casas de playa, paseos en lancha y compras de supermercado. Deuditas calcula exactamente quién le debe a quién al final del viaje.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 max-w-md mx-auto">
            <div className="p-2.5 rounded-xl bg-[#1a1a1a] border border-border-custom text-left">
              <span className="text-lg">🍹</span>
              <p className="text-[11px] font-body text-gray-300 font-medium mt-1">Beach Clubs</p>
              <p className="text-[9px] text-text-secondary">Tragos y comidas</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#1a1a1a] border border-border-custom text-left">
              <span className="text-lg">🚤</span>
              <p className="text-[11px] font-body text-gray-300 font-medium mt-1">Tours & Lanchas</p>
              <p className="text-[9px] text-text-secondary">Snorkel y paseos</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#1a1a1a] border border-border-custom text-left">
              <span className="text-lg">🏨</span>
              <p className="text-[11px] font-body text-gray-300 font-medium mt-1">Casa / Airbnb</p>
              <p className="text-[9px] text-text-secondary">Hospedaje grupal</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#1a1a1a] border border-border-custom text-left">
              <span className="text-lg">📱</span>
              <p className="text-[11px] font-body text-gray-300 font-medium mt-1">WhatsApp</p>
              <p className="text-[9px] text-text-secondary">Cuentas claras</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Active Trips */}
          {activos.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <h2 className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body font-medium">
                  Viajes en Curso
                </h2>
                <span className="font-mono text-[10px] text-border-custom ml-auto">{activos.length}</span>
              </div>

              {activos.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  expenses={expenses}
                  onOpenTrip={onOpenTrip}
                />
              ))}
            </div>
          )}

          {/* Finalized Trips */}
          {finalizados.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-border-custom" />
                <h2 className="text-[11px] uppercase tracking-[0.15em] text-text-secondary font-body font-medium">
                  Viajes Finalizados
                </h2>
                <span className="font-mono text-[10px] text-border-custom ml-auto">{finalizados.length}</span>
              </div>

              {finalizados.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  expenses={expenses}
                  onOpenTrip={onOpenTrip}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
